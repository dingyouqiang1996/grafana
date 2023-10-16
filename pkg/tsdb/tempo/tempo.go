package tempo

import (
	"context"
	"fmt"
	"net/http"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana/pkg/infra/httpclient"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/tsdb/tempo/kinds/dataquery"
	"github.com/grafana/tempo/pkg/tempopb"
)

type Service struct {
	im     instancemgmt.InstanceManager
	logger log.Logger
}

func ProvideService(httpClientProvider httpclient.Provider) *Service {
	return &Service{
		logger: log.New("tsdb.tempo"),
		im:     datasource.NewInstanceManager(newInstanceSettings(httpClientProvider)),
	}
}

type Datasource struct {
	HTTPClient      *http.Client
	StreamingClient tempopb.StreamingQuerierClient
	URL             string
}

func newInstanceSettings(httpClientProvider httpclient.Provider) datasource.InstanceFactoryFunc {
	return func(_ context.Context, settings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
		logger := log.New("tsdb.tempo")
		opts, err := settings.HTTPClientOptions()
		if err != nil {
			logger.Error("Failed to get HTTP client options", "error", err)
			return nil, err
		}

		client, err := httpClientProvider.New(opts)
		if err != nil {
			logger.Error("Failed to get HTTP client provider", "error", err)
			return nil, err
		}

		streamingClient, err := newGrpcClient(settings, opts)
		if err != nil {
			logger.Error("Failed to get gRPC client", "error", err)
			return nil, err
		}

		model := &Datasource{
			HTTPClient:      client,
			StreamingClient: streamingClient,
			URL:             settings.URL,
		}
		return model, nil
	}
}

func (s *Service) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	logger := s.logger.FromContext(ctx)
	logger.Debug("Processing queries", "queryLenght", len(req.Queries))

	// create response struct
	response := backend.NewQueryDataResponse()

	// loop over queries and execute them individually.
	for i, q := range req.Queries {
		logger.Debug("Processing query", "query", q, "counter", i)
		if res, err := s.query(ctx, req.PluginContext, q); err != nil {
			logger.Error("Error processing query", "query", q, "error", err)
			return response, err
		} else {
			if res != nil {
				logger.Debug("Query processed", "query", q)
				response.Responses[q.RefID] = *res
			} else {
				logger.Debug("Query resulted in empty response", "query", q)
			}
		}
	}

	logger.Debug("All queries processed")
	return response, nil
}

func (s *Service) query(ctx context.Context, pCtx backend.PluginContext, query backend.DataQuery) (*backend.DataResponse, error) {
	if query.QueryType == string(dataquery.TempoQueryTypeTraceId) {
		return s.getTrace(ctx, pCtx, query)
	}
	return nil, fmt.Errorf("unsupported query type: '%s' for query with refID '%s'", query.QueryType, query.RefID)
}

func (s *Service) getDSInfo(ctx context.Context, pluginCtx backend.PluginContext) (*Datasource, error) {
	i, err := s.im.Get(ctx, pluginCtx)
	if err != nil {
		return nil, err
	}

	instance, ok := i.(*Datasource)
	if !ok {
		return nil, fmt.Errorf("failed to cast datsource info")
	}

	return instance, nil
}
