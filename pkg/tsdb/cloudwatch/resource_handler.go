package cloudwatch

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"

	"github.com/grafana/grafana/pkg/tsdb/cloudwatch/routes"
)

func (e *cloudWatchExecutor) newResourceMux() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("/regions", handleResourceReq(e.handleGetRegions))
	mux.HandleFunc("/ebs-volume-ids", handleResourceReq(e.handleGetEbsVolumeIds))
	mux.HandleFunc("/ec2-instance-attribute", handleResourceReq(e.handleGetEc2InstanceAttribute))
	mux.HandleFunc("/resource-arns", handleResourceReq(e.handleGetResourceArns))
	mux.HandleFunc("/log-groups", handleResourceReq(e.handleGetLogGroups))
	mux.HandleFunc("/all-log-groups", handleResourceReq(e.handleGetAllLogGroups))
	mux.HandleFunc("/metrics", routes.ResourceRequestMiddleware(routes.MetricsHandler, logger, e.getRequestContext))
	mux.HandleFunc("/dimension-values", routes.ResourceRequestMiddleware(routes.DimensionValuesHandler, logger, e.getRequestContext))
	mux.HandleFunc("/dimension-keys", routes.ResourceRequestMiddleware(routes.DimensionKeysHandler, logger, e.getRequestContext))
	mux.HandleFunc("/accounts", routes.ResourceRequestMiddleware(routes.AccountsHandler, logger, e.getRequestContext))
	return mux
}

type handleFn func(pluginCtx backend.PluginContext, parameters url.Values) ([]suggestData, error)

func handleResourceReq(handleFunc handleFn) func(rw http.ResponseWriter, req *http.Request) {
	return func(rw http.ResponseWriter, req *http.Request) {
		ctx := req.Context()
		pluginContext := httpadapter.PluginConfigFromContext(ctx)
		err := req.ParseForm()
		if err != nil {
			writeResponse(rw, http.StatusBadRequest, fmt.Sprintf("unexpected error %v", err))
		}
		data, err := handleFunc(pluginContext, req.URL.Query())
		if err != nil {
			writeResponse(rw, http.StatusBadRequest, fmt.Sprintf("unexpected error %v", err))
		}
		body, err := json.Marshal(data)
		if err != nil {
			writeResponse(rw, http.StatusBadRequest, fmt.Sprintf("unexpected error %v", err))
		}
		rw.WriteHeader(http.StatusOK)
		_, err = rw.Write(body)
		if err != nil {
			logger.Error("Unable to write HTTP response", "error", err)
		}
	}
}

func writeResponse(rw http.ResponseWriter, code int, msg string) {
	rw.WriteHeader(code)
	_, err := rw.Write([]byte(msg))
	if err != nil {
		logger.Error("Unable to write HTTP response", "error", err)
	}
}
