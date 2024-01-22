package query

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"

	"github.com/grafana/grafana/pkg/apis/query/v0alpha1"
	"github.com/grafana/grafana/pkg/expr"
	"github.com/grafana/grafana/pkg/tsdb/legacydata"
)

type parsedQueryRequest struct {
	// The queries broken into requests
	Requests []groupedQueries

	// Optionally show the additional query properties
	Expressions []v0alpha1.GenericDataQuery
}

type groupedQueries struct {
	// the plugin type
	pluginId string

	// The datasource name/uid
	uid string

	// The raw backend query objects
	query []backend.DataQuery
}

func (d *groupedQueries) key() string {
	return fmt.Sprintf("%s/%s", d.pluginId, d.uid)
}

func ParseQueryRequest(raw v0alpha1.QueryRequest) (parsedQueryRequest, error) {
	mixed := make(map[string]*groupedQueries)
	parsed := parsedQueryRequest{}
	byRefID := make(map[string]*v0alpha1.GenericDataQuery)

	var err error
	tr := legacydata.NewDataTimeRange(raw.From, raw.To)
	backendTr := backend.TimeRange{
		From: tr.GetFromAsTimeUTC(),
		To:   tr.GetToAsTimeUTC(),
	}

	for idx, q := range raw.Queries {
		if byRefID[q.RefID] != nil {
			return parsed, fmt.Errorf("invalid query, duplicate refId: " + q.RefID)
		}
		ptr := &raw.Queries[idx]
		byRefID[q.RefID] = ptr

		// Extract out the expressions queries earlier
		if expr.IsDataSource(q.Datasource.Type) || expr.IsDataSource(q.Datasource.UID) {
			parsed.Expressions = append(parsed.Expressions, q)
			continue
		}

		// Convert to a backend DataQuery
		dq := backend.DataQuery{
			RefID:         q.RefID,
			QueryType:     q.QueryType,
			MaxDataPoints: q.MaxDataPoints,
			TimeRange:     backendTr,
		}
		dq.JSON, err = json.Marshal(q)
		if err != nil {
			return parsed, err
		}
		if dq.RefID == "" {
			dq.RefID = "A"
		}
		if dq.MaxDataPoints == 0 {
			dq.MaxDataPoints = 100
		}
		if q.IntervalMS > 0 {
			dq.Interval = time.Duration(q.IntervalMS) * time.Millisecond
		} else {
			dq.Interval = time.Duration(time.Second)
		}

		g := &groupedQueries{pluginId: q.Datasource.Type, uid: q.Datasource.UID}
		group, ok := mixed[g.key()]
		if !ok || group == nil {
			group = g
			mixed[g.key()] = g
		}
		group.query = append(group.query, dq)
	}

	for _, q := range parsed.Expressions {
		// TODO: parse and build tree, for now just fail fast on unknown commands
		_, err := expr.GetExpressionCommandType(q.AdditionalProperties())
		if err != nil {
			return parsed, err
		}
	}

	// Add each request
	for _, v := range mixed {
		parsed.Requests = append(parsed.Requests, *v)
	}

	return parsed, nil
}
