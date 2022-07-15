package channels

import (
	"bytes"
	"context"
	"crypto/tls"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"path"
	"strings"
	"time"

	"github.com/prometheus/alertmanager/notify"
	"github.com/prometheus/common/model"

	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/util"

	"github.com/grafana/grafana/pkg/components/simplejson"
)

const (
	FooterIconURL      = "https://grafana.com/assets/img/fav32.png"
	ColorAlertFiring   = "#D63232"
	ColorAlertResolved = "#36a64f"
	//LOGZ.IO GRAFANA CHANGE :: DEV-31356: Change grafana default username, footer URL,text to logzio ones
	LogzioAlertNotificationUsername = "Logz.io Metrics Alerts"
	LogzioIconUrl                   = "https://s3.amazonaws.com/logzio-static-content-cdn/logzio-logo.png"
	LogzioFooterText                = "logz.io"
	EncodedHashSymbol               = "%23"
	EncodedSpaceSymbol              = "%20"
	//LOGZ.IO GRAFANA CHANGE :: end
)

var (
	// Provides current time. Can be overwritten in tests.
	timeNow = time.Now
)

type receiverInitError struct {
	Reason string
	Err    error
	Cfg    NotificationChannelConfig
}

func (e receiverInitError) Error() string {
	name := ""
	if e.Cfg.Name != "" {
		name = fmt.Sprintf("%q ", e.Cfg.Name)
	}

	s := fmt.Sprintf("failed to validate receiver %sof type %q: %s", name, e.Cfg.Type, e.Reason)
	if e.Err != nil {
		return fmt.Sprintf("%s: %s", s, e.Err.Error())
	}

	return s
}

func (e receiverInitError) Unwrap() error { return e.Err }

func getAlertStatusColor(status model.AlertStatus) string {
	if status == model.AlertFiring {
		return ColorAlertFiring
	}
	return ColorAlertResolved
}

type NotificationChannel interface {
	notify.Notifier
	notify.ResolvedSender
}
type NotificationChannelConfig struct {
	OrgID                 int64             // only used internally
	UID                   string            `json:"uid"`
	Name                  string            `json:"name"`
	Type                  string            `json:"type"`
	DisableResolveMessage bool              `json:"disableResolveMessage"`
	Settings              *simplejson.Json  `json:"settings"`
	SecureSettings        map[string][]byte `json:"secureSettings"`
}

type httpCfg struct {
	body     []byte
	user     string
	password string
}

// sendHTTPRequest sends an HTTP request.
// Stubbable by tests.
var sendHTTPRequest = func(ctx context.Context, url *url.URL, cfg httpCfg, logger log.Logger) ([]byte, error) {
	var reader io.Reader
	if len(cfg.body) > 0 {
		reader = bytes.NewReader(cfg.body)
	}
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, url.String(), reader)
	if err != nil {
		return nil, fmt.Errorf("failed to create HTTP request: %w", err)
	}
	if cfg.user != "" && cfg.password != "" {
		request.Header.Set("Authorization", util.GetBasicAuthHeader(cfg.user, cfg.password))
	}

	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("User-Agent", "Grafana")
	netTransport := &http.Transport{
		TLSClientConfig: &tls.Config{
			Renegotiation: tls.RenegotiateFreelyAsClient,
		},
		Proxy: http.ProxyFromEnvironment,
		DialContext: (&net.Dialer{
			Timeout: 30 * time.Second,
		}).DialContext,
		TLSHandshakeTimeout: 5 * time.Second,
	}
	netClient := &http.Client{
		Timeout:   time.Second * 30,
		Transport: netTransport,
	}
	resp, err := netClient.Do(request)
	if err != nil {
		return nil, err
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			logger.Warn("Failed to close response body", "err", err)
		}
	}()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode/100 != 2 {
		logger.Warn("HTTP request failed", "url", request.URL.String(), "statusCode", resp.Status, "body",
			string(respBody))
		return nil, fmt.Errorf("failed to send HTTP request - status code %d", resp.StatusCode)
	}

	logger.Debug("Sending HTTP request succeeded", "url", request.URL.String(), "statusCode", resp.Status)
	return respBody, nil
}

func joinUrlPath(base, additionalPath string, logger log.Logger) string {
	u, err := url.Parse(base)
	if err != nil {
		logger.Debug("failed to parse URL while joining URL", "url", base, "err", err.Error())
		return base
	}

	u.Path = path.Join(u.Path, additionalPath)

	return u.String()
}

// LOGZ.IO GRAFANA CHANGE :: DEV-31554 - Set APP url to logzio grafana for alert notification URLs
func ToLogzioAppPath(path string) string {
	// because the app path contains # symbol which is encoded by default we need to replace encoded symbol back to original
	return strings.Replace(path, EncodedHashSymbol, "#", 1)
}

// Golang encode function encodes space as + instead of %20 so we need to replace
func ReplaceEncodedSpace(path string) string {
	return strings.Replace(path, "+", EncodedSpaceSymbol, -1)
}

// LOGZ.IO GRAFANA CHANGE :: DEV-31554 - Set APP url to logzio grafana for alert notification URLs

// GetBoundary is used for overriding the behaviour for tests
// and set a boundary for multipart body. DO NOT set this outside tests.
var GetBoundary = func() string {
	return ""
}

// LOGZ.IO GRAFANA CHANGE :: DEV-32721 - Validate channel url accessibility
func ValidateNotificationChannelUrl(url *url.URL) error {
	ips, err := net.LookupIP(url.Host)
	if err != nil {
		return errors.New("URL must be reachable")
	}

	for _, ip := range ips {
		if ip.IsPrivate() {
			return errors.New("URL must be reachable")
		}
	}

	return nil
}

// LOGZ.IO GRAFANA CHANGE :: end
