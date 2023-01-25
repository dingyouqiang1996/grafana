/*Package api contains base API implementation of unified alerting
 *
 *Generated by: Swagger Codegen (https://github.com/swagger-api/swagger-codegen.git)
 *
 *Do not manually edit these files, please find ngalert/api/swagger-codegen/ for commands on how to generate them.
 */
package api

import (
	"net/http"

	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/middleware"
	"github.com/grafana/grafana/pkg/services/contexthandler/model"
	apimodels "github.com/grafana/grafana/pkg/services/ngalert/api/tooling/definitions"
	"github.com/grafana/grafana/pkg/services/ngalert/metrics"
	"github.com/grafana/grafana/pkg/web"
)

type TestingApi interface {
	BacktestConfig(*model.ReqContext) response.Response
	RouteEvalQueries(*model.ReqContext) response.Response
	RouteTestRuleConfig(*model.ReqContext) response.Response
	RouteTestRuleGrafanaConfig(*model.ReqContext) response.Response
}

func (f *TestingApiHandler) BacktestConfig(ctx *model.ReqContext) response.Response {
	// Parse Request Body
	conf := apimodels.BacktestConfig{}
	if err := web.Bind(ctx.Req, &conf); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	return f.handleBacktestingConfig(ctx, conf)
}
func (f *TestingApiHandler) RouteEvalQueries(ctx *model.ReqContext) response.Response {
	// Parse Request Body
	conf := apimodels.EvalQueriesPayload{}
	if err := web.Bind(ctx.Req, &conf); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	return f.handleRouteEvalQueries(ctx, conf)
}
func (f *TestingApiHandler) RouteTestRuleConfig(ctx *model.ReqContext) response.Response {
	// Parse Path Parameters
	datasourceUIDParam := web.Params(ctx.Req)[":DatasourceUID"]
	// Parse Request Body
	conf := apimodels.TestRulePayload{}
	if err := web.Bind(ctx.Req, &conf); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	return f.handleRouteTestRuleConfig(ctx, conf, datasourceUIDParam)
}
func (f *TestingApiHandler) RouteTestRuleGrafanaConfig(ctx *model.ReqContext) response.Response {
	// Parse Request Body
	conf := apimodels.TestRulePayload{}
	if err := web.Bind(ctx.Req, &conf); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	return f.handleRouteTestRuleGrafanaConfig(ctx, conf)
}

func (api *API) RegisterTestingApiEndpoints(srv TestingApi, m *metrics.API) {
	api.RouteRegister.Group("", func(group routing.RouteRegister) {
		group.Post(
			toMacaronPath("/api/v1/rule/backtest"),
			api.authorize(http.MethodPost, "/api/v1/rule/backtest"),
			metrics.Instrument(
				http.MethodPost,
				"/api/v1/rule/backtest",
				srv.BacktestConfig,
				m,
			),
		)
		group.Post(
			toMacaronPath("/api/v1/eval"),
			api.authorize(http.MethodPost, "/api/v1/eval"),
			metrics.Instrument(
				http.MethodPost,
				"/api/v1/eval",
				srv.RouteEvalQueries,
				m,
			),
		)
		group.Post(
			toMacaronPath("/api/v1/rule/test/{DatasourceUID}"),
			api.authorize(http.MethodPost, "/api/v1/rule/test/{DatasourceUID}"),
			metrics.Instrument(
				http.MethodPost,
				"/api/v1/rule/test/{DatasourceUID}",
				srv.RouteTestRuleConfig,
				m,
			),
		)
		group.Post(
			toMacaronPath("/api/v1/rule/test/grafana"),
			api.authorize(http.MethodPost, "/api/v1/rule/test/grafana"),
			metrics.Instrument(
				http.MethodPost,
				"/api/v1/rule/test/grafana",
				srv.RouteTestRuleGrafanaConfig,
				m,
			),
		)
	}, middleware.ReqSignedIn)
}
