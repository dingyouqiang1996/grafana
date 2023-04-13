package graphite

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"path"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"

	"github.com/grafana/grafana/pkg/components/simplejson"
	"github.com/grafana/grafana/pkg/infra/httpclient"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/infra/tracing"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/grafana/grafana/pkg/tsdb/legacydata"
)

var logger = log.New("tsdb.graphite")

type Service struct {
	im     instancemgmt.InstanceManager
	tracer tracing.Tracer
}

const (
	TargetFullModelField = "targetFull"
	TargetModelField     = "target"
)

func ProvideService(httpClientProvider httpclient.Provider, tracer tracing.Tracer) *Service {
	return &Service{
		im:     datasource.NewInstanceManager(newInstanceSettings(httpClientProvider)),
		tracer: tracer,
	}
}

type datasourceInfo struct {
	HTTPClient *http.Client
	URL        string
	Id         int64
}

func newInstanceSettings(httpClientProvider httpclient.Provider) datasource.InstanceFactoryFunc {
	return func(settings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
		opts, err := settings.HTTPClientOptions()
		if err != nil {
			return nil, err
		}

		client, err := httpClientProvider.New(opts)
		if err != nil {
			return nil, err
		}

		model := datasourceInfo{
			HTTPClient: client,
			URL:        settings.URL,
			Id:         settings.ID,
		}

		return model, nil
	}
}

func (s *Service) getDSInfo(pluginCtx backend.PluginContext) (*datasourceInfo, error) {
	i, err := s.im.Get(pluginCtx)
	if err != nil {
		return nil, err
	}
	instance := i.(datasourceInfo)
	return &instance, nil
}

func (s *Service) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	if len(req.Queries) == 0 {
		return nil, fmt.Errorf("query contains no queries")
	}

	logger := logger.FromContext(ctx)

	// get datasource info from context
	dsInfo, err := s.getDSInfo(req.PluginContext)
	if err != nil {
		return nil, err
	}

	// take the first query in the request list, since all query should share the same timerange
	q := req.Queries[0]

	/*
		graphite doc about from and until, with sdk we are getting absolute instead of relative time
		https://graphite-api.readthedocs.io/en/latest/api.html#from-until
	*/
	from, until := epochMStoGraphiteTime(q.TimeRange)
	formData := url.Values{
		"from":          []string{from},
		"until":         []string{until},
		"format":        []string{"json"},
		"maxDataPoints": []string{"500"},
	}

	// Calculate and get the last target of Graphite Request
	var target string
	emptyQueries := make([]string, 0)
	for _, query := range req.Queries {
		model, err := simplejson.NewJson(query.JSON)
		if err != nil {
			return nil, err
		}
		logger.Debug("graphite", "query", model)
		currTarget := ""
		if fullTarget, err := model.Get(TargetFullModelField).String(); err == nil {
			currTarget = fullTarget
		} else {
			currTarget = model.Get(TargetModelField).MustString()
		}
		if currTarget == "" {
			logger.Debug("graphite", "empty query target", model)
			emptyQueries = append(emptyQueries, fmt.Sprintf("Query: %v has no target", model))
			continue
		}
		target = fixIntervalFormat(currTarget)
	}

	var result = backend.QueryDataResponse{}

	if target == "" {
		logger.Error("No targets in query model", "models without targets", strings.Join(emptyQueries, "\n"))
		return &result, errors.New("no query target found for the alert rule")
	}

	formData["target"] = []string{target}

	if setting.Env == setting.Dev {
		logger.Debug("Graphite request", "params", formData)
	}

	graphiteReq, err := s.createRequest(ctx, logger, dsInfo, formData)
	if err != nil {
		return &result, err
	}

	ctx, span := s.tracer.Start(ctx, "graphite query")
	defer span.End()

	span.SetAttributes("target", target, attribute.Key("target").String(target))
	span.SetAttributes("from", from, attribute.Key("from").String(from))
	span.SetAttributes("until", until, attribute.Key("until").String(until))
	span.SetAttributes("datasource_id", dsInfo.Id, attribute.Key("datasource_id").Int64(dsInfo.Id))
	span.SetAttributes("org_id", req.PluginContext.OrgID, attribute.Key("org_id").Int64(req.PluginContext.OrgID))

	s.tracer.Inject(ctx, graphiteReq.Header, span)

	//nolint:bodyclose // fixed in main
	res, err := dsInfo.HTTPClient.Do(graphiteReq) //nolint:bodyclose // fixed in main
	if res != nil {
		span.SetAttributes("graphite.response.code", res.StatusCode, attribute.Key("graphite.response.code").Int(res.StatusCode))
	}
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return &result, err
	}

	frames, err := s.toDataFrames(logger, res)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return &result, err
	}

	result = backend.QueryDataResponse{
		Responses: make(backend.Responses),
	}

	result.Responses["A"] = backend.DataResponse{
		Frames: frames,
	}

	return &result, nil
}

func (s *Service) parseResponse(logger log.Logger, res *http.Response) ([]TargetResponseDTO, error) {
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	defer func() {
		if err := res.Body.Close(); err != nil {
			logger.Warn("Failed to close response body", "err", err)
		}
	}()

	if res.StatusCode/100 != 2 {
		logger.Info("Request failed", "status", res.Status, "body", string(body))
		return nil, fmt.Errorf("request failed, status: %s", res.Status)
	}

	var data []TargetResponseDTO
	err = json.Unmarshal(body, &data)
	if err != nil {
		logger.Info("Failed to unmarshal graphite response", "error", err, "status", res.Status, "body", string(body))
		return nil, err
	}

	return data, nil
}

func (s *Service) toDataFrames(logger log.Logger, response *http.Response) (frames data.Frames, error error) {
	responseData, err := s.parseResponse(logger, response)
	if err != nil {
		return nil, err
	}

	frames = data.Frames{}
	for _, series := range responseData {
		timeVector := make([]time.Time, 0, len(series.DataPoints))
		values := make([]*float64, 0, len(series.DataPoints))
		name := series.Target

		for _, dataPoint := range series.DataPoints {
			var timestamp, value, err = parseDataTimePoint(dataPoint)
			if err != nil {
				return nil, err
			}
			timeVector = append(timeVector, timestamp)
			values = append(values, value)
		}

		tags := make(map[string]string)
		for name, value := range series.Tags {
			switch value := value.(type) {
			case string:
				tags[name] = value
			case float64:
				tags[name] = strconv.FormatFloat(value, 'f', -1, 64)
			}
		}

		frames = append(frames, data.NewFrame(name,
			data.NewField("time", nil, timeVector),
			data.NewField("value", tags, values).SetConfig(&data.FieldConfig{DisplayNameFromDS: name})))

		if setting.Env == setting.Dev {
			logger.Debug("Graphite response", "target", series.Target, "datapoints", len(series.DataPoints))
		}
	}
	return frames, nil
}

func (s *Service) createRequest(ctx context.Context, l log.Logger, dsInfo *datasourceInfo, data url.Values) (*http.Request, error) {
	u, err := url.Parse(dsInfo.URL)
	if err != nil {
		return nil, err
	}
	u.Path = path.Join(u.Path, "render")

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, u.String(), strings.NewReader(data.Encode()))
	if err != nil {
		logger.Info("Failed to create request", "error", err)
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	return req, err
}

func fixIntervalFormat(target string) string {
	rMinute := regexp.MustCompile(`'(\d+)m'`)
	target = rMinute.ReplaceAllStringFunc(target, func(m string) string {
		return strings.ReplaceAll(m, "m", "min")
	})
	rMonth := regexp.MustCompile(`'(\d+)M'`)
	target = rMonth.ReplaceAllStringFunc(target, func(M string) string {
		return strings.ReplaceAll(M, "M", "mon")
	})
	return target
}

func epochMStoGraphiteTime(tr backend.TimeRange) (string, string) {
	return fmt.Sprintf("%d", tr.From.UTC().Unix()), fmt.Sprintf("%d", tr.To.UTC().Unix())
}

/**
 * Graphite should always return timestamp as a number but values might be nil when data is missing
 */
func parseDataTimePoint(dataTimePoint legacydata.DataTimePoint) (time.Time, *float64, error) {
	if !dataTimePoint[1].Valid {
		return time.Time{}, nil, errors.New("failed to parse data point timestamp")
	}

	timestamp := time.Unix(int64(dataTimePoint[1].Float64), 0).UTC()

	if dataTimePoint[0].Valid {
		var value = new(float64)
		*value = dataTimePoint[0].Float64
		return timestamp, value, nil
	} else {
		return timestamp, nil, nil
	}
}
