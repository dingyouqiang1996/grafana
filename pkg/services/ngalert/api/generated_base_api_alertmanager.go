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
	"github.com/grafana/grafana/pkg/models"
	apimodels "github.com/grafana/grafana/pkg/services/ngalert/api/tooling/definitions"
	"github.com/grafana/grafana/pkg/services/ngalert/metrics"
	"github.com/grafana/grafana/pkg/web"
)

type AlertmanagerApiForkingService interface {
	RouteCreateGrafanaSilence(*models.ReqContext) response.Response
	RouteCreateSilence(*models.ReqContext) response.Response
	RouteDeleteAlertingConfig(*models.ReqContext) response.Response
	RouteDeleteGrafanaAlertingConfig(*models.ReqContext) response.Response
	RouteDeleteGrafanaSilence(*models.ReqContext) response.Response
	RouteDeleteSilence(*models.ReqContext) response.Response
	RouteGetAMAlertGroups(*models.ReqContext) response.Response
	RouteGetAMAlerts(*models.ReqContext) response.Response
	RouteGetAMStatus(*models.ReqContext) response.Response
	RouteGetAlertingConfig(*models.ReqContext) response.Response
	RouteGetGrafanaAMAlertGroups(*models.ReqContext) response.Response
	RouteGetGrafanaAMAlerts(*models.ReqContext) response.Response
	RouteGetGrafanaAMStatus(*models.ReqContext) response.Response
	RouteGetGrafanaAlertingConfig(*models.ReqContext) response.Response
	RouteGetGrafanaSilence(*models.ReqContext) response.Response
	RouteGetGrafanaSilences(*models.ReqContext) response.Response
	RouteGetSilence(*models.ReqContext) response.Response
	RouteGetSilences(*models.ReqContext) response.Response
	RoutePostAMAlerts(*models.ReqContext) response.Response
	RoutePostAlertingConfig(*models.ReqContext) response.Response
	RoutePostGrafanaAMAlerts(*models.ReqContext) response.Response
	RoutePostGrafanaAlertingConfig(*models.ReqContext) response.Response
	RoutePostTestGrafanaReceivers(*models.ReqContext) response.Response
	RoutePostTestReceivers(*models.ReqContext) response.Response
}

func (f *ForkedAlertmanagerApi) RouteCreateGrafanaSilence(ctx *models.ReqContext) response.Response {
	conf := apimodels.PostableSilence{}
	if err := web.Bind(ctx.Req, &conf); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	return f.forkRouteCreateGrafanaSilence(ctx, conf)
}
func (f *ForkedAlertmanagerApi) RouteCreateSilence(ctx *models.ReqContext) response.Response {
	conf := apimodels.PostableSilence{}
	if err := web.Bind(ctx.Req, &conf); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	return f.forkRouteCreateSilence(ctx, conf)
}
func (f *ForkedAlertmanagerApi) RouteDeleteAlertingConfig(ctx *models.ReqContext) response.Response {
	return f.forkRouteDeleteAlertingConfig(ctx)
}
func (f *ForkedAlertmanagerApi) RouteDeleteGrafanaAlertingConfig(ctx *models.ReqContext) response.Response {
	return f.forkRouteDeleteGrafanaAlertingConfig(ctx)
}
func (f *ForkedAlertmanagerApi) RouteDeleteGrafanaSilence(ctx *models.ReqContext) response.Response {
	return f.forkRouteDeleteGrafanaSilence(ctx)
}
func (f *ForkedAlertmanagerApi) RouteDeleteSilence(ctx *models.ReqContext) response.Response {
	return f.forkRouteDeleteSilence(ctx)
}
func (f *ForkedAlertmanagerApi) RouteGetAMAlertGroups(ctx *models.ReqContext) response.Response {
	return f.forkRouteGetAMAlertGroups(ctx)
}
func (f *ForkedAlertmanagerApi) RouteGetAMAlerts(ctx *models.ReqContext) response.Response {
	return f.forkRouteGetAMAlerts(ctx)
}
func (f *ForkedAlertmanagerApi) RouteGetAMStatus(ctx *models.ReqContext) response.Response {
	return f.forkRouteGetAMStatus(ctx)
}
func (f *ForkedAlertmanagerApi) RouteGetAlertingConfig(ctx *models.ReqContext) response.Response {
	return f.forkRouteGetAlertingConfig(ctx)
}
func (f *ForkedAlertmanagerApi) RouteGetGrafanaAMAlertGroups(ctx *models.ReqContext) response.Response {
	return f.forkRouteGetGrafanaAMAlertGroups(ctx)
}
func (f *ForkedAlertmanagerApi) RouteGetGrafanaAMAlerts(ctx *models.ReqContext) response.Response {
	return f.forkRouteGetGrafanaAMAlerts(ctx)
}
func (f *ForkedAlertmanagerApi) RouteGetGrafanaAMStatus(ctx *models.ReqContext) response.Response {
	return f.forkRouteGetGrafanaAMStatus(ctx)
}
func (f *ForkedAlertmanagerApi) RouteGetGrafanaAlertingConfig(ctx *models.ReqContext) response.Response {
	return f.forkRouteGetGrafanaAlertingConfig(ctx)
}
func (f *ForkedAlertmanagerApi) RouteGetGrafanaSilence(ctx *models.ReqContext) response.Response {
	return f.forkRouteGetGrafanaSilence(ctx)
}
func (f *ForkedAlertmanagerApi) RouteGetGrafanaSilences(ctx *models.ReqContext) response.Response {
	return f.forkRouteGetGrafanaSilences(ctx)
}
func (f *ForkedAlertmanagerApi) RouteGetSilence(ctx *models.ReqContext) response.Response {
	return f.forkRouteGetSilence(ctx)
}
func (f *ForkedAlertmanagerApi) RouteGetSilences(ctx *models.ReqContext) response.Response {
	return f.forkRouteGetSilences(ctx)
}
func (f *ForkedAlertmanagerApi) RoutePostAMAlerts(ctx *models.ReqContext) response.Response {
	conf := apimodels.PostableAlerts{}
	if err := web.Bind(ctx.Req, &conf); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	return f.forkRoutePostAMAlerts(ctx, conf)
}
func (f *ForkedAlertmanagerApi) RoutePostAlertingConfig(ctx *models.ReqContext) response.Response {
	conf := apimodels.PostableUserConfig{}
	if err := web.Bind(ctx.Req, &conf); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	return f.forkRoutePostAlertingConfig(ctx, conf)
}
func (f *ForkedAlertmanagerApi) RoutePostGrafanaAMAlerts(ctx *models.ReqContext) response.Response {
	conf := apimodels.PostableAlerts{}
	if err := web.Bind(ctx.Req, &conf); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	return f.forkRoutePostGrafanaAMAlerts(ctx, conf)
}
func (f *ForkedAlertmanagerApi) RoutePostGrafanaAlertingConfig(ctx *models.ReqContext) response.Response {
	conf := apimodels.PostableUserConfig{}
	if err := web.Bind(ctx.Req, &conf); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	return f.forkRoutePostGrafanaAlertingConfig(ctx, conf)
}
func (f *ForkedAlertmanagerApi) RoutePostTestGrafanaReceivers(ctx *models.ReqContext) response.Response {
	conf := apimodels.TestReceiversConfigBodyParams{}
	if err := web.Bind(ctx.Req, &conf); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	return f.forkRoutePostTestGrafanaReceivers(ctx, conf)
}
func (f *ForkedAlertmanagerApi) RoutePostTestReceivers(ctx *models.ReqContext) response.Response {
	conf := apimodels.TestReceiversConfigBodyParams{}
	if err := web.Bind(ctx.Req, &conf); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	return f.forkRoutePostTestReceivers(ctx, conf)
}

func (api *API) RegisterAlertmanagerApiEndpoints(srv AlertmanagerApiForkingService, m *metrics.API) {
	api.RouteRegister.Group("", func(group routing.RouteRegister) {
		group.Post(
			toMacaronPath("/api/alertmanager/grafana/api/v2/silences"),
			api.authorize(http.MethodPost, "/api/alertmanager/grafana/api/v2/silences"),
			metrics.Instrument(
				http.MethodPost,
				"/api/alertmanager/grafana/api/v2/silences",
				srv.RouteCreateGrafanaSilence,
				m,
			),
		)
		group.Post(
			toMacaronPath("/api/alertmanager/{DatasourceUID}/api/v2/silences"),
			api.authorize(http.MethodPost, "/api/alertmanager/{DatasourceUID}/api/v2/silences"),
			metrics.Instrument(
				http.MethodPost,
				"/api/alertmanager/{DatasourceUID}/api/v2/silences",
				srv.RouteCreateSilence,
				m,
			),
		)
		group.Delete(
			toMacaronPath("/api/alertmanager/{DatasourceUID}/config/api/v1/alerts"),
			api.authorize(http.MethodDelete, "/api/alertmanager/{DatasourceUID}/config/api/v1/alerts"),
			metrics.Instrument(
				http.MethodDelete,
				"/api/alertmanager/{DatasourceUID}/config/api/v1/alerts",
				srv.RouteDeleteAlertingConfig,
				m,
			),
		)
		group.Delete(
			toMacaronPath("/api/alertmanager/grafana/config/api/v1/alerts"),
			api.authorize(http.MethodDelete, "/api/alertmanager/grafana/config/api/v1/alerts"),
			metrics.Instrument(
				http.MethodDelete,
				"/api/alertmanager/grafana/config/api/v1/alerts",
				srv.RouteDeleteGrafanaAlertingConfig,
				m,
			),
		)
		group.Delete(
			toMacaronPath("/api/alertmanager/grafana/api/v2/silence/{SilenceId}"),
			api.authorize(http.MethodDelete, "/api/alertmanager/grafana/api/v2/silence/{SilenceId}"),
			metrics.Instrument(
				http.MethodDelete,
				"/api/alertmanager/grafana/api/v2/silence/{SilenceId}",
				srv.RouteDeleteGrafanaSilence,
				m,
			),
		)
		group.Delete(
			toMacaronPath("/api/alertmanager/{DatasourceUID}/api/v2/silence/{SilenceId}"),
			api.authorize(http.MethodDelete, "/api/alertmanager/{DatasourceUID}/api/v2/silence/{SilenceId}"),
			metrics.Instrument(
				http.MethodDelete,
				"/api/alertmanager/{DatasourceUID}/api/v2/silence/{SilenceId}",
				srv.RouteDeleteSilence,
				m,
			),
		)
		group.Get(
			toMacaronPath("/api/alertmanager/{DatasourceUID}/api/v2/alerts/groups"),
			api.authorize(http.MethodGet, "/api/alertmanager/{DatasourceUID}/api/v2/alerts/groups"),
			metrics.Instrument(
				http.MethodGet,
				"/api/alertmanager/{DatasourceUID}/api/v2/alerts/groups",
				srv.RouteGetAMAlertGroups,
				m,
			),
		)
		group.Get(
			toMacaronPath("/api/alertmanager/{DatasourceUID}/api/v2/alerts"),
			api.authorize(http.MethodGet, "/api/alertmanager/{DatasourceUID}/api/v2/alerts"),
			metrics.Instrument(
				http.MethodGet,
				"/api/alertmanager/{DatasourceUID}/api/v2/alerts",
				srv.RouteGetAMAlerts,
				m,
			),
		)
		group.Get(
			toMacaronPath("/api/alertmanager/{DatasourceUID}/api/v2/status"),
			api.authorize(http.MethodGet, "/api/alertmanager/{DatasourceUID}/api/v2/status"),
			metrics.Instrument(
				http.MethodGet,
				"/api/alertmanager/{DatasourceUID}/api/v2/status",
				srv.RouteGetAMStatus,
				m,
			),
		)
		group.Get(
			toMacaronPath("/api/alertmanager/{DatasourceUID}/config/api/v1/alerts"),
			api.authorize(http.MethodGet, "/api/alertmanager/{DatasourceUID}/config/api/v1/alerts"),
			metrics.Instrument(
				http.MethodGet,
				"/api/alertmanager/{DatasourceUID}/config/api/v1/alerts",
				srv.RouteGetAlertingConfig,
				m,
			),
		)
		group.Get(
			toMacaronPath("/api/alertmanager/grafana/api/v2/alerts/groups"),
			api.authorize(http.MethodGet, "/api/alertmanager/grafana/api/v2/alerts/groups"),
			metrics.Instrument(
				http.MethodGet,
				"/api/alertmanager/grafana/api/v2/alerts/groups",
				srv.RouteGetGrafanaAMAlertGroups,
				m,
			),
		)
		group.Get(
			toMacaronPath("/api/alertmanager/grafana/api/v2/alerts"),
			api.authorize(http.MethodGet, "/api/alertmanager/grafana/api/v2/alerts"),
			metrics.Instrument(
				http.MethodGet,
				"/api/alertmanager/grafana/api/v2/alerts",
				srv.RouteGetGrafanaAMAlerts,
				m,
			),
		)
		group.Get(
			toMacaronPath("/api/alertmanager/grafana/api/v2/status"),
			api.authorize(http.MethodGet, "/api/alertmanager/grafana/api/v2/status"),
			metrics.Instrument(
				http.MethodGet,
				"/api/alertmanager/grafana/api/v2/status",
				srv.RouteGetGrafanaAMStatus,
				m,
			),
		)
		group.Get(
			toMacaronPath("/api/alertmanager/grafana/config/api/v1/alerts"),
			api.authorize(http.MethodGet, "/api/alertmanager/grafana/config/api/v1/alerts"),
			metrics.Instrument(
				http.MethodGet,
				"/api/alertmanager/grafana/config/api/v1/alerts",
				srv.RouteGetGrafanaAlertingConfig,
				m,
			),
		)
		group.Get(
			toMacaronPath("/api/alertmanager/grafana/api/v2/silence/{SilenceId}"),
			api.authorize(http.MethodGet, "/api/alertmanager/grafana/api/v2/silence/{SilenceId}"),
			metrics.Instrument(
				http.MethodGet,
				"/api/alertmanager/grafana/api/v2/silence/{SilenceId}",
				srv.RouteGetGrafanaSilence,
				m,
			),
		)
		group.Get(
			toMacaronPath("/api/alertmanager/grafana/api/v2/silences"),
			api.authorize(http.MethodGet, "/api/alertmanager/grafana/api/v2/silences"),
			metrics.Instrument(
				http.MethodGet,
				"/api/alertmanager/grafana/api/v2/silences",
				srv.RouteGetGrafanaSilences,
				m,
			),
		)
		group.Get(
			toMacaronPath("/api/alertmanager/{DatasourceUID}/api/v2/silence/{SilenceId}"),
			api.authorize(http.MethodGet, "/api/alertmanager/{DatasourceUID}/api/v2/silence/{SilenceId}"),
			metrics.Instrument(
				http.MethodGet,
				"/api/alertmanager/{DatasourceUID}/api/v2/silence/{SilenceId}",
				srv.RouteGetSilence,
				m,
			),
		)
		group.Get(
			toMacaronPath("/api/alertmanager/{DatasourceUID}/api/v2/silences"),
			api.authorize(http.MethodGet, "/api/alertmanager/{DatasourceUID}/api/v2/silences"),
			metrics.Instrument(
				http.MethodGet,
				"/api/alertmanager/{DatasourceUID}/api/v2/silences",
				srv.RouteGetSilences,
				m,
			),
		)
		group.Post(
			toMacaronPath("/api/alertmanager/{DatasourceUID}/api/v2/alerts"),
			api.authorize(http.MethodPost, "/api/alertmanager/{DatasourceUID}/api/v2/alerts"),
			metrics.Instrument(
				http.MethodPost,
				"/api/alertmanager/{DatasourceUID}/api/v2/alerts",
				srv.RoutePostAMAlerts,
				m,
			),
		)
		group.Post(
			toMacaronPath("/api/alertmanager/{DatasourceUID}/config/api/v1/alerts"),
			api.authorize(http.MethodPost, "/api/alertmanager/{DatasourceUID}/config/api/v1/alerts"),
			metrics.Instrument(
				http.MethodPost,
				"/api/alertmanager/{DatasourceUID}/config/api/v1/alerts",
				srv.RoutePostAlertingConfig,
				m,
			),
		)
		group.Post(
			toMacaronPath("/api/alertmanager/grafana/api/v2/alerts"),
			api.authorize(http.MethodPost, "/api/alertmanager/grafana/api/v2/alerts"),
			metrics.Instrument(
				http.MethodPost,
				"/api/alertmanager/grafana/api/v2/alerts",
				srv.RoutePostGrafanaAMAlerts,
				m,
			),
		)
		group.Post(
			toMacaronPath("/api/alertmanager/grafana/config/api/v1/alerts"),
			api.authorize(http.MethodPost, "/api/alertmanager/grafana/config/api/v1/alerts"),
			metrics.Instrument(
				http.MethodPost,
				"/api/alertmanager/grafana/config/api/v1/alerts",
				srv.RoutePostGrafanaAlertingConfig,
				m,
			),
		)
		group.Post(
			toMacaronPath("/api/alertmanager/grafana/config/api/v1/receivers/test"),
			api.authorize(http.MethodPost, "/api/alertmanager/grafana/config/api/v1/receivers/test"),
			metrics.Instrument(
				http.MethodPost,
				"/api/alertmanager/grafana/config/api/v1/receivers/test",
				srv.RoutePostTestGrafanaReceivers,
				m,
			),
		)
		group.Post(
			toMacaronPath("/api/alertmanager/{DatasourceUID}/config/api/v1/receivers/test"),
			api.authorize(http.MethodPost, "/api/alertmanager/{DatasourceUID}/config/api/v1/receivers/test"),
			metrics.Instrument(
				http.MethodPost,
				"/api/alertmanager/{DatasourceUID}/config/api/v1/receivers/test",
				srv.RoutePostTestReceivers,
				m,
			),
		)
	}, middleware.ReqSignedIn)
}
