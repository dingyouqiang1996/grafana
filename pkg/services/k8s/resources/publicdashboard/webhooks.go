package publicdashboard

import (
	"context"
	"encoding/json"
	"io"

	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/featuremgmt"
	"github.com/grafana/grafana/pkg/services/k8s/admission"
	"github.com/grafana/grafana/pkg/services/k8s/client"
	k8sAdmission "k8s.io/api/admission/v1"
	admissionregistrationV1 "k8s.io/api/admissionregistration/v1"
)

type WebhooksAPI struct {
	RouteRegister        routing.RouteRegister
	AccessControl        accesscontrol.AccessControl
	Features             *featuremgmt.FeatureManager
	Log                  log.Logger
	ValidationController admission.ValidatingAdmissionController
}

func ProvideWebhooks(
	rr routing.RouteRegister,
	clientset *client.Clientset,
	ac accesscontrol.AccessControl,
	features *featuremgmt.FeatureManager,
	vc admission.ValidatingAdmissionController,
) *WebhooksAPI {
	webhooksAPI := &WebhooksAPI{
		RouteRegister:        rr,
		AccessControl:        ac,
		Log:                  log.New("k8s.publicdashboard.webhooks.admission.create"),
		ValidationController: vc,
	}

	webhooksAPI.RegisterAPIEndpoints()
	err := clientset.RegisterValidation(context.Background(), []client.ShortWebhookConfig{})

	// TODO do better
	if err != nil {
		panic(err)
	}
	return webhooksAPI
}

func (api *WebhooksAPI) RegisterAPIEndpoints() {
	api.RouteRegister.Post("/k8s/publicdashboards/admission/create", api.Create)
}

func GetWebhookConfigs() []client.ShortWebhookConfig {
	return []client.ShortWebhookConfig{
		{
			Resource:   "publicdashboard",
			Operations: []admissionregistrationV1.OperationType{admissionregistrationV1.Create},
			Url:        "https://host.docker.internal:3443/k8s/publicdashboards/admission/create",
			Timeout:    int32(5),
		},
	}

}

func (api *WebhooksAPI) Create(c *contextmodel.ReqContext) response.Response {
	api.Log.Debug("admission controller create fired")
	body, err := io.ReadAll(c.Req.Body)
	if err != nil {
		api.Log.Error("error reading request body")
	}
	api.Log.Debug("create", "body", string(body))

	var rev k8sAdmission.AdmissionReview
	err = json.Unmarshal(body, &rev)
	if err != nil {
		api.Log.Error("error unmarshalling request body")
		return response.Error(500, "error unmarshalling request body", err)
	}

	obj := &PublicDashboard{}
	err = obj.UnmarshalJSON(rev.Request.Object.Raw)
	if err != nil {
		api.Log.Error("error unmarshalling request body")
		return response.Error(500, "error unmarshalling request body", err)
	}

	oldObj := &PublicDashboard{}
	err = oldObj.UnmarshalJSON(rev.Request.OldObject.Raw)
	if err != nil {
		api.Log.Error("error unmarshalling request body")
		return response.Error(500, "error unmarshalling request body", err)
	}

	// THIS IS BROKEN
	// TODO: convert error to k8sAdmission.AdmissionResponse and then to response.Response
	err = api.ValidationController.Validate(c.Req.Context(), &admission.AdmissionRequest{
		Action:  c.Req.Method,
		Kind:    rev.Kind,
		Group:   rev.GroupVersionKind().Group,
		Version: rev.GroupVersionKind().Version,
		UserInfo: admission.AdmissionUserInfo{
			Username: rev.Request.UserInfo.Username,
			UID:      rev.Request.UserInfo.UID,
			Groups:   rev.Request.UserInfo.Groups,
		},
		Object:    obj,
		OldObject: oldObj,
	})

	if err != nil {
		api.Log.Error("error validating request body")
		return response.Error(500, "error validating request body", err)
	}

	return response.JSON(200, "ok")
}
