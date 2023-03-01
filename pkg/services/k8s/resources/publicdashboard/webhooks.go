package publicdashboard

import (
	"io"

	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/featuremgmt"
)

type WebhooksAPI struct {
	RouteRegister routing.RouteRegister
	AccessControl accesscontrol.AccessControl
	Features      *featuremgmt.FeatureManager
	Log           log.Logger
}

func ProvideWebhooks(
	rr routing.RouteRegister,
	ac accesscontrol.AccessControl,
	features *featuremgmt.FeatureManager,
) *WebhooksAPI {
	webhooksAPI := &WebhooksAPI{
		RouteRegister: rr,
		AccessControl: ac,
		Log:           log.New("k8s.publicdashboard.webhooks.admission.create"),
	}

	webhooksAPI.RegisterAPIEndpoints()

	return webhooksAPI
}

func (api *WebhooksAPI) RegisterAPIEndpoints() {
	api.RouteRegister.Post("/k8s/publicdashboards/admission/create", api.Create)
}

func (api *WebhooksAPI) Create(c *contextmodel.ReqContext) response.Response {
	api.Log.Debug("admission controller create fired")
	body, err := io.ReadAll(c.Req.Body)
	if err != nil {
		api.Log.Error("error reading request body")
	}
	api.Log.Debug("create", "body", body)
	return response.Success("worked!")
}
