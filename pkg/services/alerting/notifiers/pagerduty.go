package notifiers

import (
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/components/simplejson"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/alerting"
)

func init() {
	alerting.RegisterNotifier(&alerting.NotifierPlugin{
		Type:        "pagerduty",
		Name:        "PagerDuty",
		Description: "Sends notifications to PagerDuty",
		Heading:     "PagerDuty settings",
		Factory:     NewPagerdutyNotifier,
		OptionsTemplate: `
      <h3 class="page-heading">PagerDuty settings</h3>
      <div class="gf-form">
        <span class="gf-form-label width-14">Integration Key</span>
		<div class="gf-form gf-form--grow" ng-if="!ctrl.model.secureFields.integrationKey">
			<input type="text"
				class="gf-form-input max-width-22"
				ng-init="ctrl.model.secureSettings.integrationKey = ctrl.model.settings.integrationKey || null; ctrl.model.settings.integrationKey = null;"
				ng-model="ctrl.model.secureSettings.integrationKey"
				placeholder="Pagerduty Integration Key"
				data-placement="right">
			</input>
		</div>
		<div class="gf-form" ng-if="ctrl.model.secureFields.integrationKey">
			<input type="text" class="gf-form-input max-width-18" disabled="disabled" value="configured" />
			<a class="btn btn-secondary gf-form-btn" href="#" ng-click="ctrl.model.secureFields.integrationKey = false">reset</a>
		</div>
      </div>
      <div class="gf-form">
        <span class="gf-form-label width-14">Severity</span>
        <div class="gf-form-select-wrapper width-14">
          <select
            class="gf-form-input"
            ng-model="ctrl.model.settings.severity"
            ng-options="s for s in ['critical', 'error', 'warning', 'info']">
          </select>
        </div>
      </div>
      <div class="gf-form">
        <gf-form-switch
           class="gf-form"
           label="Auto resolve incidents"
           label-class="width-14"
           checked="ctrl.model.settings.autoResolve"
           tooltip="Resolve incidents in pagerduty once the alert goes back to ok.">
        </gf-form-switch>
      </div>
      <div class="gf-form">
        <gf-form-switch
           class="gf-form"
           label="Include message in details"
           label-class="width-14"
           checked="ctrl.model.settings.messageInDetails"
           tooltip="Move the alert message from the PD summary into the custom details. This changes the custom details object and may break event rules you have configured">
        </gf-form-switch>
      </div>
    `,
		Options: []alerting.NotifierOption{
			{
				Label:        "Integration Key",
				Element:      alerting.ElementTypeInput,
				InputType:    alerting.InputTypeText,
				Placeholder:  "Pagerduty Integration Key",
				PropertyName: "integrationKey",
				Required:     true,
			},
			{
				Label:   "Severity",
				Element: alerting.ElementTypeSelect,
				SelectOptions: []alerting.SelectOption{
					{
						Value: "critical",
						Label: "Critical",
					},
					{
						Value: "error",
						Label: "Error",
					},
					{
						Value: "warning",
						Label: "Warning",
					},
					{
						Value: "info",
						Label: "Info",
					},
				},
				PropertyName: "severity",
			},
			{
				Label:        "Auto resolve incidents",
				Element:      alerting.ElementTypeSwitch,
				Description:  "Resolve incidents in pagerduty once the alert goes back to ok.",
				PropertyName: "autoResolve",
			},
		},
	})
}

var (
	pagerdutyEventAPIURL = "https://events.pagerduty.com/v2/enqueue"
)

// NewPagerdutyNotifier is the constructor for the PagerDuty notifier
func NewPagerdutyNotifier(model *models.AlertNotification) (alerting.Notifier, error) {
	severity := model.Settings.Get("severity").MustString("critical")
	autoResolve := model.Settings.Get("autoResolve").MustBool(false)
	key := model.DecryptedValue("integrationKey", model.Settings.Get("integrationKey").MustString())
	messageInDetails := model.Settings.Get("messageInDetails").MustBool(false)
	if key == "" {
		return nil, alerting.ValidationError{Reason: "Could not find integration key property in settings"}
	}

	return &PagerdutyNotifier{
		NotifierBase:     NewNotifierBase(model),
		Key:              key,
		Severity:         severity,
		AutoResolve:      autoResolve,
		MessageInDetails: messageInDetails,
		log:              log.New("alerting.notifier.pagerduty"),
	}, nil
}

// PagerdutyNotifier is responsible for sending
// alert notifications to pagerduty
type PagerdutyNotifier struct {
	NotifierBase
	Key              string
	Severity         string
	AutoResolve      bool
	MessageInDetails bool
	log              log.Logger
}

// buildEventPayload is responsible for building the event payload body for sending to Pagerduty v2 API
func (pn *PagerdutyNotifier) buildEventPayload(evalContext *alerting.EvalContext) ([]byte, error) {
	eventType := "trigger"
	if evalContext.Rule.State == models.AlertStateOK {
		eventType = "resolve"
	}
	customData := simplejson.New()
	if pn.MessageInDetails {
		queries := make(map[string]interface{})
		for _, evt := range evalContext.EvalMatches {
			queries[evt.Metric] = evt.Value
		}
		customData.Set("queries", queries)
		customData.Set("message", evalContext.Rule.Message)
	} else {
		for _, evt := range evalContext.EvalMatches {
			customData.Set(evt.Metric, evt.Value)
		}
	}

	pn.log.Info("Notifying Pagerduty", "event_type", eventType)

	payloadJSON := simplejson.New()

	// set default, override in following case switch if defined
	payloadJSON.Set("component", "Grafana")
	payloadJSON.Set("severity", pn.Severity)

	for _, tag := range evalContext.Rule.AlertRuleTags {
		customData.Set(tag.Key, tag.Value)

		// Override tags appropriately if they are in the PagerDuty v2 API
		switch strings.ToLower(tag.Key) {
		case "group":
			payloadJSON.Set("group", tag.Value)
		case "class":
			payloadJSON.Set("class", tag.Value)
		case "component":
			payloadJSON.Set("component", tag.Value)
		case "severity":
			// Only set severity if it's one of the PD supported enum values
			// Info, Warning, Error, or Critical (case insensitive)
			switch sev := strings.ToLower(tag.Value); sev {
			case "info":
				fallthrough
			case "warning":
				fallthrough
			case "error":
				fallthrough
			case "critical":
				payloadJSON.Set("severity", sev)
			default:
				pn.log.Warn("Ignoring invalid severity tag", "severity", sev)
			}
		}
	}

	var summary string
	if pn.MessageInDetails {
		summary = evalContext.Rule.Name
	} else {
		summary = evalContext.Rule.Name + " - " + evalContext.Rule.Message
	}
	if len(summary) > 1024 {
		summary = summary[0:1024]
	}
	payloadJSON.Set("summary", summary)

	if hostname, err := os.Hostname(); err == nil {
		payloadJSON.Set("source", hostname)
	}
	payloadJSON.Set("timestamp", time.Now())
	payloadJSON.Set("custom_details", customData)
	bodyJSON := simplejson.New()
	bodyJSON.Set("routing_key", pn.Key)
	bodyJSON.Set("event_action", eventType)
	bodyJSON.Set("dedup_key", "alertId-"+strconv.FormatInt(evalContext.Rule.ID, 10))
	bodyJSON.Set("payload", payloadJSON)

	ruleURL, err := evalContext.GetRuleURL()
	if err != nil {
		pn.log.Error("Failed get rule link", "error", err)
		return []byte{}, err
	}
	links := make([]interface{}, 1)
	linkJSON := simplejson.New()
	linkJSON.Set("href", ruleURL)
	bodyJSON.Set("client_url", ruleURL)
	bodyJSON.Set("client", "Grafana")

	links[0] = linkJSON
	bodyJSON.Set("links", links)

	if pn.NeedsImage() && evalContext.ImagePublicURL != "" {
		contexts := make([]interface{}, 1)
		imageJSON := simplejson.New()
		imageJSON.Set("src", evalContext.ImagePublicURL)
		contexts[0] = imageJSON
		bodyJSON.Set("images", contexts)
	}

	body, _ := bodyJSON.MarshalJSON()

	return body, nil
}

// Notify sends an alert notification to PagerDuty
func (pn *PagerdutyNotifier) Notify(evalContext *alerting.EvalContext) error {
	if evalContext.Rule.State == models.AlertStateOK && !pn.AutoResolve {
		pn.log.Info("Not sending a trigger to Pagerduty", "state", evalContext.Rule.State, "auto resolve", pn.AutoResolve)
		return nil
	}

	body, err := pn.buildEventPayload(evalContext)
	if err != nil {
		pn.log.Error("Unable to build PagerDuty event payload", "error", err)
		return err
	}

	cmd := &models.SendWebhookSync{
		Url:        pagerdutyEventAPIURL,
		Body:       string(body),
		HttpMethod: "POST",
		HttpHeader: map[string]string{
			"Content-Type": "application/json",
		},
	}

	if err := bus.DispatchCtx(evalContext.Ctx, cmd); err != nil {
		pn.log.Error("Failed to send notification to Pagerduty", "error", err, "body", string(body))
		return err
	}
	return nil
}
