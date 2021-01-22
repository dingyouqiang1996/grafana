package testdatasource

import (
	"context"
	"fmt"
	"math"
	"math/rand"
	"strconv"
	"strings"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/grafana/pkg/components/null"
	"github.com/grafana/grafana/pkg/components/simplejson"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/tsdb"
	"github.com/grafana/grafana/pkg/util/errutil"
)

func (p *testDataPlugin) registerScenarioQueryHandlers(mux *datasource.QueryTypeMux) {
	mux.HandleFunc(string(randowWalkQuery), p.handleRandomWalkScenario)
	mux.HandleFunc(string(randowWalkTableQuery), p.handleRandomWalkTableScenario)

	mux.HandleFunc("", p.handleFallbackScenario)
}

func (p *testDataPlugin) handleFallbackScenario(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	resp := backend.NewQueryDataResponse()

	tsdbQuery := &tsdb.TsdbQuery{
		TimeRange: tsdb.NewTimeRange(strconv.FormatInt(req.Queries[0].TimeRange.From.UnixNano()/int64(time.Millisecond), 10), strconv.FormatInt(req.Queries[0].TimeRange.To.UnixNano()/int64(time.Millisecond), 10)),
		Headers:   map[string]string{},
		Queries:   []*tsdb.Query{},
	}

	if req.PluginContext.User != nil {
		tsdbQuery.User = &models.SignedInUser{
			OrgId:   req.PluginContext.OrgID,
			Name:    req.PluginContext.User.Name,
			Login:   req.PluginContext.User.Login,
			Email:   req.PluginContext.User.Email,
			OrgRole: models.RoleType(req.PluginContext.User.Role),
		}
	}

	for _, q := range req.Queries {
		model, err := simplejson.NewJson(q.JSON)
		if err != nil {
			p.logger.Error("Failed to unmarschal query model to JSON", "error", err)
			continue
		}
		tsdbQuery.Queries = append(tsdbQuery.Queries, &tsdb.Query{
			DataSource:    &models.DataSource{},
			IntervalMs:    q.Interval.Milliseconds(),
			MaxDataPoints: q.MaxDataPoints,
			QueryType:     "",
			RefId:         q.RefID,
			Model:         model,
		})
	}

	result := &tsdb.Response{}
	result.Results = make(map[string]*tsdb.QueryResult)

	for _, query := range tsdbQuery.Queries {
		scenarioId := query.Model.Get("scenarioId").MustString("random_walk")
		if scenario, exist := ScenarioRegistry[scenarioId]; exist {
			result.Results[query.RefId] = scenario.Handler(query, tsdbQuery)
			result.Results[query.RefId].RefId = query.RefId
		} else {
			p.logger.Error("Scenario not found", "scenarioId", scenarioId)
		}
	}

	for refID, r := range result.Results {
		for _, series := range r.Series {
			frame, err := tsdb.SeriesToFrame(series)
			frame.RefID = refID
			if err != nil {
				return nil, err
			}
			respD := resp.Responses[refID]
			respD.Frames = append(respD.Frames, frame)
			resp.Responses[refID] = respD
		}
	}

	return resp, nil
}

func (p *testDataPlugin) handleRandomWalkScenario(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	resp := backend.NewQueryDataResponse()

	for _, q := range req.Queries {
		model, err := simplejson.NewJson(q.JSON)
		if err != nil {
			continue
		}
		seriesCount := model.Get("seriesCount").MustInt(1)

		for i := 0; i < seriesCount; i++ {
			respD := resp.Responses[q.RefID]
			respD.Frames = append(respD.Frames, getRandomWalkV2(q, model, i))
			resp.Responses[q.RefID] = respD
		}
	}

	return resp, nil
}

func (p *testDataPlugin) handleRandomWalkTableScenario(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	resp := backend.NewQueryDataResponse()

	for _, q := range req.Queries {
		model, err := simplejson.NewJson(q.JSON)
		if err != nil {
			continue
		}

		respD := resp.Responses[q.RefID]
		respD.Frames = append(respD.Frames, getRandomWalkTableV2(q, model))
		resp.Responses[q.RefID] = respD
	}

	return resp, nil
}

func getRandomWalkV2(query backend.DataQuery, model *simplejson.Json, index int) *data.Frame {
	timeWalkerMs := query.TimeRange.From.UnixNano() / int64(time.Millisecond)
	to := query.TimeRange.To.UnixNano() / int64(time.Millisecond)
	startValue := model.Get("startValue").MustFloat64(rand.Float64() * 100)
	spread := model.Get("spread").MustFloat64(1)
	noise := model.Get("noise").MustFloat64(0)

	min, err := model.Get("min").Float64()
	hasMin := err == nil
	max, err := model.Get("max").Float64()
	hasMax := err == nil

	timeVec := make([]*time.Time, 0)
	floatVec := make([]*float64, 0)

	walker := startValue

	for i := int64(0); i < 10000 && timeWalkerMs < to; i++ {
		nextValue := walker + (rand.Float64() * noise)

		if hasMin && nextValue < min {
			nextValue = min
			walker = min
		}

		if hasMax && nextValue > max {
			nextValue = max
			walker = max
		}

		t := time.Unix(timeWalkerMs/int64(1e+3), (timeWalkerMs%int64(1e+3))*int64(1e+6))
		timeVec = append(timeVec, &t)
		floatVec = append(floatVec, &nextValue)

		walker += (rand.Float64() - 0.5) * spread
		timeWalkerMs += query.Interval.Milliseconds()
	}

	return data.NewFrame(frameNameForQuery(query, model, index),
		data.NewField("time", nil, timeVec),
		data.NewField("value", parseLabelsV2(model), floatVec),
	)
}

func getRandomWalkTableV2(query backend.DataQuery, model *simplejson.Json) *data.Frame {
	timeWalkerMs := query.TimeRange.From.UnixNano() / int64(time.Millisecond)
	to := query.TimeRange.To.UnixNano() / int64(time.Millisecond)
	withNil := model.Get("withNil").MustBool(false)
	walker := model.Get("startValue").MustFloat64(rand.Float64() * 100)
	spread := 2.5

	// Name of the frame?
	frame := data.NewFrame(query.RefID,
		data.NewField("Time", nil, []*time.Time{}),
		data.NewField("Value", nil, []*float64{}),
		data.NewField("Min", nil, []*float64{}),
		data.NewField("Max", nil, []*float64{}),
		data.NewField("Info", nil, []*string{}),
	)

	var info strings.Builder

	for i := int64(0); i < query.MaxDataPoints && timeWalkerMs < to; i++ {
		delta := rand.Float64() - 0.5
		walker += delta

		info.Reset()
		if delta > 0 {
			info.WriteString("up")
		} else {
			info.WriteString("down")
		}
		if math.Abs(delta) > .4 {
			info.WriteString(" fast")
		}

		t := time.Unix(timeWalkerMs/int64(1e+3), (timeWalkerMs%int64(1e+3))*int64(1e+6))
		val := walker
		min := walker - ((rand.Float64() * spread) + 0.01)
		max := walker + ((rand.Float64() * spread) + 0.01)
		infoString := info.String()

		vals := []*float64{&val, &min, &max}
		// Add some random null values
		if withNil && rand.Float64() > 0.8 {
			for i := range vals {
				if rand.Float64() > .2 {
					vals[i] = nil
				}
			}
		}

		frame.AppendRow(&t, vals[0], vals[1], vals[2], &infoString)

		timeWalkerMs += query.Interval.Milliseconds()
	}

	return frame
}

func getPredictableCSVWaveV2(query backend.DataQuery, model *simplejson.Json) (*data.Frame, error) {
	// Process Input
	var timeStep int64

	options := model.Get("csvWave")

	var err error
	if timeStep, err = options.Get("timeStep").Int64(); err != nil {
		return nil, fmt.Errorf("failed to parse timeStep value '%v' into integer: %v", options.Get("timeStep"), err)
	}
	rawValues := options.Get("valuesCSV").MustString()
	rawValues = strings.TrimRight(strings.TrimSpace(rawValues), ",") // Strip Trailing Comma
	rawValesCSV := strings.Split(rawValues, ",")
	values := make([]null.Float, len(rawValesCSV))
	for i, rawValue := range rawValesCSV {
		val, err := null.FloatFromString(strings.TrimSpace(rawValue), "null")
		if err != nil {
			return nil, errutil.Wrapf(err, "failed to parse value '%v' into nullable float", rawValue)
		}
		values[i] = val
	}

	timeStep *= 1000 // Seconds to Milliseconds
	valuesLen := int64(len(values))
	getValue := func(mod int64) (null.Float, error) {
		var i int64
		for i = 0; i < valuesLen; i++ {
			if mod == i*timeStep {
				return values[i], nil
			}
		}
		return null.Float{}, fmt.Errorf("did not get value at point in waveform - should not be here")
	}
	fields, err := predictableSeriesV2(query.TimeRange, timeStep, valuesLen, getValue)
	if err != nil {
		return nil, err
	}

	frame := newSeriesForQueryV2(query, model, 0)
	frame.Fields = fields
	frame.Fields[1].Labels = parseLabelsV2(model)

	return frame, nil
}

func predictableSeriesV2(timeRange backend.TimeRange, timeStep, length int64, getValue func(mod int64) (null.Float, error)) (data.Fields, error) {
	from := timeRange.From.UnixNano() / int64(time.Millisecond)
	to := timeRange.To.UnixNano() / int64(time.Millisecond)

	timeCursor := from - (from % timeStep) // Truncate Start
	wavePeriod := timeStep * length
	maxPoints := 10000 // Don't return too many points

	timeVec := make([]*time.Time, 0)
	floatVec := make([]*float64, 0)

	for i := 0; i < maxPoints && timeCursor < to; i++ {
		val, err := getValue(timeCursor % wavePeriod)
		if err != nil {
			return nil, err
		}

		t := time.Unix(timeCursor/int64(1e+3), (timeCursor%int64(1e+3))*int64(1e+6))
		timeVec = append(timeVec, &t)
		floatVec = append(floatVec, &val.Float64)

		timeCursor += timeStep
	}

	return data.Fields{
		data.NewField("time", nil, timeVec),
		data.NewField("value", nil, floatVec),
	}, nil
}

func newSeriesForQueryV2(query backend.DataQuery, model *simplejson.Json, index int) *data.Frame {
	alias := model.Get("alias").MustString("")
	suffix := ""

	if index > 0 {
		suffix = strconv.Itoa(index)
	}

	if alias == "" {
		alias = fmt.Sprintf("%s-series%s", query.RefID, suffix)
	}

	if alias == "__server_names" && len(serverNames) > index {
		alias = serverNames[index]
	}

	if alias == "__house_locations" && len(houseLocations) > index {
		alias = houseLocations[index]
	}

	return data.NewFrame(alias)
}

/**
 * Looks for a labels request and adds them as tags
 *
 * '{job="foo", instance="bar"} => {job: "foo", instance: "bar"}`
 */
func parseLabelsV2(model *simplejson.Json) data.Labels {
	tags := data.Labels{}

	labelText := model.Get("labels").MustString("")
	if labelText == "" {
		return data.Labels{}
	}

	text := strings.Trim(labelText, `{}`)
	if len(text) < 2 {
		return tags
	}

	tags = make(data.Labels)

	for _, keyval := range strings.Split(text, ",") {
		idx := strings.Index(keyval, "=")
		key := strings.TrimSpace(keyval[:idx])
		val := strings.TrimSpace(keyval[idx+1:])
		val = strings.Trim(val, "\"")
		tags[key] = val
	}

	return tags
}
