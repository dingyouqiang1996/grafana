package v0alpha1

import (
	"encoding/json"
	"fmt"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	runtime "k8s.io/apimachinery/pkg/runtime"
)

// Generic query request with shared time across all values
// Copied from: https://github.com/grafana/grafana/blob/main/pkg/api/dtos/models.go#L62
type GenericQueryRequest struct {
	metav1.TypeMeta `json:",inline"`

	// From Start time in epoch timestamps in milliseconds or relative using Grafana time units.
	// example: now-1h
	From string `json:"from,omitempty"`

	// To End time in epoch timestamps in milliseconds or relative using Grafana time units.
	// example: now
	To string `json:"to,omitempty"`

	// queries.refId – Specifies an identifier of the query. Is optional and default to “A”.
	// queries.datasourceId – Specifies the data source to be queried. Each query in the request must have an unique datasourceId.
	// queries.maxDataPoints - Species maximum amount of data points that dashboard panel can render. Is optional and default to 100.
	// queries.intervalMs - Specifies the time interval in milliseconds of time series. Is optional and defaults to 1000.
	// required: true
	// example: [ { "refId": "A", "intervalMs": 86400000, "maxDataPoints": 1092, "datasource":{ "uid":"PD8C576611E62080A" }, "rawSql": "SELECT 1 as valueOne, 2 as valueTwo", "format": "table" } ]
	Queries []GenericDataQuery `json:"queries"`

	// required: false
	Debug bool `json:"debug,omitempty"`
}

type DataSourceRef struct {
	// The datasource plugin type
	Type string `json:"type"`

	// Datasource UID
	UID string `json:"uid"`
}

// GenericDataQuery is a replacement for `dtos.MetricRequest` that provides more explicit types
type GenericDataQuery struct {
	// RefID is the unique identifier of the query, set by the frontend call.
	RefID string `json:"refId"`

	// TimeRange represents the query range
	// NOTE: unlike generic /ds/query, we can now send explicit time values in each query
	TimeRange *TimeRange `json:"timeRange,omitempty"`

	// The datasource
	Datasource *DataSourceRef `json:"datasource,omitempty"`

	// Deprecated -- use datasource ref instead
	DatasourceId int64 `json:"datasourceId,omitempty"`

	// QueryType is an optional identifier for the type of query.
	// It can be used to distinguish different types of queries.
	QueryType string `json:"queryType,omitempty"`

	// MaxDataPoints is the maximum number of data points that should be returned from a time series query.
	MaxDataPoints int64 `json:"maxDataPoints,omitempty"`

	// Interval is the suggested duration between time points in a time series query.
	IntervalMS float64 `json:"intervalMs,omitempty"`

	// true if query is disabled (ie should not be returned to the dashboard)
	// Note this does not always imply that the query should not be executed since
	// the results from a hidden query may be used as the input to other queries (SSE etc)
	Hide bool `json:"hide,omitempty"`

	// Additional Properties (that live at the root)
	props map[string]any `json:"-"`
}

// TimeRange represents a time range for a query and is a property of DataQuery.
type TimeRange struct {
	// From is the start time of the query.
	From string `json:"from"`

	// To is the end time of the query.
	To string `json:"to"`
}

func (g *GenericDataQuery) AdditionalProperties() map[string]any {
	if g.props == nil {
		g.props = make(map[string]any)
	}
	return g.props
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (g *GenericDataQuery) DeepCopyInto(out *GenericDataQuery) {
	*out = *g
	if g.props != nil {
		out.props = runtime.DeepCopyJSON(g.props)
	}
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new GenericDataQuery.
func (g *GenericDataQuery) DeepCopy() *GenericDataQuery {
	if g == nil {
		return nil
	}
	out := new(GenericDataQuery)
	g.DeepCopyInto(out)
	return out
}

// MarshalJSON ensures that the unstructured object produces proper
// JSON when passed to Go's standard JSON library.
func (g GenericDataQuery) MarshalJSON() ([]byte, error) {
	vals := map[string]any{}
	if g.props != nil {
		for k, v := range g.props {
			vals[k] = v
		}
	}

	vals["refId"] = g.RefID
	if g.Datasource.Type != "" || g.Datasource.UID != "" {
		vals["datasource"] = g.Datasource
	}
	if g.DatasourceId > 0 {
		vals["datasourceId"] = g.DatasourceId
	}
	if g.IntervalMS > 0 {
		vals["intervalMs"] = g.IntervalMS
	}
	if g.MaxDataPoints > 0 {
		vals["maxDataPoints"] = g.MaxDataPoints
	}
	return json.Marshal(vals)
}

// UnmarshalJSON ensures that the unstructured object properly decodes
// JSON when passed to Go's standard JSON library.
func (g *GenericDataQuery) UnmarshalJSON(b []byte) error {
	vals := map[string]any{}
	err := json.Unmarshal(b, &vals)
	if err != nil {
		return err
	}
	key := "refId"
	v, ok := vals[key]
	if ok {
		g.RefID, ok = v.(string)
		if !ok {
			return fmt.Errorf("expected string refid (got: %t)", v)
		}
		delete(vals, key)
	}

	key = "datasource"
	v, ok = vals[key]
	if ok {
		wrap, ok := v.(map[string]any)
		if ok {
			g.Datasource = &DataSourceRef{}
			g.Datasource.Type, _ = wrap["type"].(string)
			g.Datasource.UID, _ = wrap["uid"].(string)
			delete(vals, key)
		} else {
			// Old old queries may arrive with just the name
			name, ok := v.(string)
			if !ok {
				return fmt.Errorf("expected datasource as object (got: %t)", v)
			}
			g.Datasource = &DataSourceRef{}
			g.Datasource.UID = name // Not great, but the lookup function will try its best to resolve
			delete(vals, key)
		}
	}

	key = "intervalMs"
	v, ok = vals[key]
	if ok {
		g.IntervalMS, ok = v.(float64)
		if !ok {
			return fmt.Errorf("expected intervalMs as float (got: %t)", v)
		}
		delete(vals, key)
	}

	key = "maxDataPoints"
	v, ok = vals[key]
	if ok {
		count, ok := v.(float64)
		if !ok {
			return fmt.Errorf("expected maxDataPoints as number (got: %t)", v)
		}
		g.MaxDataPoints = int64(count)
		delete(vals, key)
	}

	key = "datasourceId"
	v, ok = vals[key]
	if ok {
		count, ok := v.(float64)
		if !ok {
			return fmt.Errorf("expected datasourceId as number (got: %t)", v)
		}
		g.DatasourceId = int64(count)
		delete(vals, key)
	}

	g.props = vals
	return nil
}
