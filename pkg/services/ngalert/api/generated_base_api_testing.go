/*Package api contains base API implementation of unified alerting
 *
 *Generated by: Swagger Codegen (https://github.com/swagger-api/swagger-codegen.git)
 *
 *Do not manually edit these files, please find ngalert/api/swagger-codegen/ for commands on how to generate them.
 */

package api

import (
	"github.com/go-macaron/binding"

	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/middleware"
	"github.com/grafana/grafana/pkg/models"
	apimodels "github.com/grafana/grafana/pkg/services/ngalert/api/tooling/definitions"
)

type TestingApiService interface {
	RouteEvalQueries(*models.ReqContext, apimodels.EvalQueriesPayload) response.Response
	RouteTestReceiverConfig(*models.ReqContext, apimodels.ExtendedReceiver) response.Response
	RouteTestRuleConfig(*models.ReqContext, apimodels.TestRulePayload) response.Response
}

func (api *API) RegisterTestingApiEndpoints(srv TestingApiService) {
	api.RouteRegister.Group("", func(group routing.RouteRegister) {
		group.Post(toMacaronPath("/api/v1/eval"), binding.Bind(apimodels.EvalQueriesPayload{}), routing.Wrap(srv.RouteEvalQueries))
		group.Post(toMacaronPath("/api/v1/receiver/test/{Recipient}"), binding.Bind(apimodels.ExtendedReceiver{}), routing.Wrap(srv.RouteTestReceiverConfig))
		group.Post(toMacaronPath("/api/v1/rule/test/{Recipient}"), binding.Bind(apimodels.TestRulePayload{}), routing.Wrap(srv.RouteTestRuleConfig))
	}, middleware.ReqSignedIn)
}
