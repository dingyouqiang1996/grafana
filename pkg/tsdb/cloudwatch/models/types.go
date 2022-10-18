package models

import (
	"net/http"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type ClientsProvider interface {
	MetricsClientProvider
}

type ClientsFactoryFunc func(pluginCtx backend.PluginContext, region string) (clients ClientsProvider, err error)

type RouteHandlerFunc func(http.ResponseWriter, *http.Request, ClientsFactoryFunc, backend.PluginContext)

type cloudWatchLink struct {
	View    string        `json:"view"`
	Stacked bool          `json:"stacked"`
	Title   string        `json:"title"`
	Start   string        `json:"start"`
	End     string        `json:"end"`
	Region  string        `json:"region"`
	Metrics []interface{} `json:"metrics"`
}

type metricExpression struct {
	Expression string `json:"expression"`
	Label      string `json:"label,omitempty"`
}

type metricStatMeta struct {
	Stat   string `json:"stat"`
	Period int    `json:"period"`
	Label  string `json:"label,omitempty"`
}
