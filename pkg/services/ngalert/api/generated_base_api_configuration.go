/*Package api contains base API implementation of unified alerting
 *
 *Generated by: Swagger Codegen (https://github.com/swagger-api/swagger-codegen.git)
 *
 *Do not manually edit these files, please find ngalert/api/swagger-codegen/ for commands on how to generate them.
 */
package api

import (
	"net/http"

	"github.com/go-macaron/binding"

	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/middleware"
	"github.com/grafana/grafana/pkg/models"
	apimodels "github.com/grafana/grafana/pkg/services/ngalert/api/tooling/definitions"
	"github.com/grafana/grafana/pkg/services/ngalert/metrics"
)

type ConfigurationApiService interface {
	RouteDeleteNGalertConfig(*models.ReqContext) response.Response
	RouteGetAlertmanagers(*models.ReqContext) response.Response
	RouteGetNGalertConfig(*models.ReqContext) response.Response
	RoutePostNGalertConfig(*models.ReqContext, apimodels.PostableNGalertConfig) response.Response
}

func (api *API) RegisterConfigurationApiEndpoints(srv ConfigurationApiService, m *metrics.Metrics) {
	api.RouteRegister.Group("", func(group routing.RouteRegister) {
		group.Delete(
			toMacaronPath("/api/v1/ngalert/admin_config"),
			metrics.Instrument(
				http.MethodDelete,
				"/api/v1/ngalert/admin_config",
				srv.RouteDeleteNGalertConfig,
				m,
			),
		)
		group.Get(
			toMacaronPath("/api/v1/ngalert/alertmanagers"),
			metrics.Instrument(
				http.MethodGet,
				"/api/v1/ngalert/alertmanagers",
				srv.RouteGetAlertmanagers,
				m,
			),
		)
		group.Get(
			toMacaronPath("/api/v1/ngalert/admin_config"),
			metrics.Instrument(
				http.MethodGet,
				"/api/v1/ngalert/admin_config",
				srv.RouteGetNGalertConfig,
				m,
			),
		)
		group.Post(
			toMacaronPath("/api/v1/ngalert/admin_config"),
			binding.Bind(apimodels.PostableNGalertConfig{}),
			metrics.Instrument(
				http.MethodPost,
				"/api/v1/ngalert/admin_config",
				srv.RoutePostNGalertConfig,
				m,
			),
		)
	}, middleware.ReqSignedIn)
}
