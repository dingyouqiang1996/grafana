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
	"github.com/grafana/grafana/pkg/middleware/requestmeta"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/ngalert/metrics"
	"github.com/grafana/grafana/pkg/web"
)

type NotificationsApi interface {
	RouteNotificationsGetTimeInterval(*contextmodel.ReqContext) response.Response
	RouteNotificationsGetTimeIntervals(*contextmodel.ReqContext) response.Response
}

func (f *NotificationsApiHandler) RouteNotificationsGetTimeInterval(ctx *contextmodel.ReqContext) response.Response {
	// Parse Path Parameters
	nameParam := web.Params(ctx.Req)[":name"]
	return f.handleRouteNotificationsGetTimeInterval(ctx, nameParam)
}
func (f *NotificationsApiHandler) RouteNotificationsGetTimeIntervals(ctx *contextmodel.ReqContext) response.Response {
	return f.handleRouteNotificationsGetTimeIntervals(ctx)
}

func (api *API) RegisterNotificationsApiEndpoints(srv NotificationsApi, m *metrics.API) {
	api.RouteRegister.Group("", func(group routing.RouteRegister) {
		group.Get(
			toMacaronPath("/api/v1/notifications/time-intervals/{name}"),
			requestmeta.SetOwner(requestmeta.TeamAlerting),
			requestmeta.SetSLOGroup(requestmeta.SLOGroupHighSlow),
			api.authorize(http.MethodGet, "/api/v1/notifications/time-intervals/{name}"),
			metrics.Instrument(
				http.MethodGet,
				"/api/v1/notifications/time-intervals/{name}",
				api.Hooks.Wrap(srv.RouteNotificationsGetTimeInterval),
				m,
			),
		)
		group.Get(
			toMacaronPath("/api/v1/notifications/time-intervals"),
			requestmeta.SetOwner(requestmeta.TeamAlerting),
			requestmeta.SetSLOGroup(requestmeta.SLOGroupHighSlow),
			api.authorize(http.MethodGet, "/api/v1/notifications/time-intervals"),
			metrics.Instrument(
				http.MethodGet,
				"/api/v1/notifications/time-intervals",
				api.Hooks.Wrap(srv.RouteNotificationsGetTimeIntervals),
				m,
			),
		)
	}, middleware.ReqSignedIn)
}
