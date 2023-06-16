package angulardetector

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"regexp"
	"sync"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"

	"github.com/grafana/grafana/pkg/plugins/log"
)

const (
	// defaultGCOMDetectorsProviderTTL is the default TTL for the cached Angular detection patterns fetched from GCOM.
	defaultGCOMDetectorsProviderTTL = time.Hour * 24

	// gcomAngularPatternsPath is the relative path to the GCOM API handler that returns angular detection patterns.
	gcomAngularPatternsPath = "/api/plugins/angular_patterns"
)

var _ detectorsProvider = &gcomDetectorsProvider{}

// gcomDetectorsProvider is a detectorsProvider which fetches patterns from GCOM, and caches the result for
// the specified ttl. All subsequent calls to provideDetectors will return the cached result until the TTL expires.
// This struct is safe for concurrent use.
type gcomDetectorsProvider struct {
	log log.Logger

	httpClient *http.Client

	baseURL string

	ttl        time.Duration
	lastUpdate time.Time

	mux       sync.Mutex
	detectors []detector
}

// newGCOMDetectorsProvider returns a new gcomDetectorsProvider.
// baseURL is the GCOM base url, without /api and without a trailing slash (e.g.: https://grafana.com)
// A default reasonable value for ttl is defaultGCOMDetectorsProviderTTL.
func newGCOMDetectorsProvider(baseURL string, ttl time.Duration) (detectorsProvider, error) {
	cl, err := httpclient.New()
	if err != nil {
		return nil, fmt.Errorf("httpclient new: %w", err)
	}
	return &gcomDetectorsProvider{
		log:        log.New("plugins.angulardetector.gcom"),
		baseURL:    baseURL,
		httpClient: cl,
		ttl:        ttl,
	}, nil
}

// tryUpdateRemoteDetectors tries to update the cached detectors value, if the cache has expired.
//
// If the TTL hasn't passed yet, this function returns immediately.
// Otherwise, it calls fetch on the fetcher, and updates the cached detectors value and lastUpdate.
//
// lastUpdate is also updated in case of an error, to avoid consecutive failures.
// However, if there's an error, the cached value is not changed.
//
// The caller must have acquired g.mux.
func (p *gcomDetectorsProvider) tryUpdateRemoteDetectors(ctx context.Context) error {
	if time.Since(p.lastUpdate) <= p.ttl {
		// Patterns already fetched
		return nil
	}

	// Update last update even if there's an error, to avoid wasting time due to consecutive failures
	defer func() {
		p.lastUpdate = time.Now()
	}()

	// Fetch patterns from GCOM API
	resp, err := p.fetch(ctx)
	if err != nil {
		return fmt.Errorf("fetch: %w", err)
	}

	// Convert patterns definitions to detectors
	detectors, err := resp.detectors()
	if err != nil {
		return fmt.Errorf("detectors: %w", err)
	}
	p.log.Debug("Updated remote angular detectors", "detectors", len(detectors))

	// Update cached result
	p.detectors = detectors
	return nil
}

// provideDetectors gets the remote detections, either from the cache or from the remote source (if TTL has passed).
// If an error occurs during the cache refresh, the function fails silently and the old cached value is returned
// instead.
func (p *gcomDetectorsProvider) provideDetectors(ctx context.Context) []detector {
	p.mux.Lock()
	defer p.mux.Unlock()

	if err := p.tryUpdateRemoteDetectors(ctx); err != nil {
		// Fail silently
		p.log.Warn("Could not update remote detectors", "error", err)
	}
	return p.detectors
}

// fetch fetches the angular patterns from GCOM and returns them as gcomPatterns.
// Call detectors() on the returned value to get the corresponding detectors.
func (p *gcomDetectorsProvider) fetch(ctx context.Context) (gcomPatterns, error) {
	st := time.Now()

	reqURL, err := url.JoinPath(p.baseURL, gcomAngularPatternsPath)
	if err != nil {
		return nil, fmt.Errorf("url joinpath: %w", err)
	}

	p.log.Debug("Fetching remote angular detection patterns", "url", reqURL)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, reqURL, nil)
	if err != nil {
		return nil, fmt.Errorf("new request with context: %w", err)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http do: %w", err)
	}
	defer func() {
		if closeErr := resp.Body.Close(); closeErr != nil {
			p.log.Error("response body close error", "error", err)
		}
	}()
	var out gcomPatterns
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, fmt.Errorf("json decode: %w", err)
	}
	p.log.Debug("Fetched remote angular detection patterns", "patterns", len(out), "duration", time.Since(st))
	return out, nil
}

// gcomPatternType is a pattern type returned by the GCOM API.
type gcomPatternType string

const (
	gcomPatternTypeContains gcomPatternType = "contains"
	gcomPatternTypeRegex    gcomPatternType = "regex"
)

// gcomPattern is an Angular detection pattern returned by the GCOM API.
type gcomPattern struct {
	Name    string
	Pattern string
	Type    gcomPatternType
}

// errUnknownPatternType is returned when a pattern type is not known.
var errUnknownPatternType = errors.New("unknown pattern type")

// detector converts a gcomPattern into a detector, based on its Type.
// If a pattern type is unknown, it returns an error wrapping errUnknownPatternType.
func (p *gcomPattern) detector() (detector, error) {
	switch p.Type {
	case gcomPatternTypeContains:
		return &containsBytesDetector{pattern: []byte(p.Pattern)}, nil
	case gcomPatternTypeRegex:
		re, err := regexp.Compile(p.Pattern)
		if err != nil {
			return nil, fmt.Errorf("%q regexp compile: %w", p.Pattern, err)
		}
		return &regexDetector{regex: re}, nil
	}
	return nil, fmt.Errorf("%q: %w", p.Type, errUnknownPatternType)
}

// gcomPatterns is a slice of gcomPattern s.
type gcomPatterns []gcomPattern

// detectors converts the slice of gcomPattern s into a slice of detectors, by calling detector() on each gcomPattern.
func (p gcomPatterns) detectors() ([]detector, error) {
	var finalErr error
	detectors := make([]detector, 0, len(p))
	for _, pattern := range p {
		d, err := pattern.detector()
		if err != nil {
			// Fail silently in case of an errUnknownPatternType.
			// This allows us to introduce new pattern types without breaking old Grafana versions
			if !errors.Is(err, errUnknownPatternType) {
				// Other error, do not ignore it
				finalErr = errors.Join(finalErr, err)
			}
			continue
		}
		detectors = append(detectors, d)
	}
	if finalErr != nil {
		return nil, finalErr
	}
	return detectors, nil
}
