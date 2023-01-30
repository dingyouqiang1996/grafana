// File taken as a 1:1 copy from: https://github.com/grafana/mimir/blob/main/pkg/util/metrics_helper.go
// Replace by dskit alternative once https://github.com/grafana/dskit/pull/258 is merged.
package metrics

import (
	"bytes"
	"errors"
	"fmt"
	"math"
	"sync"

	"github.com/go-kit/log"

	"github.com/go-kit/log/level"
	"github.com/prometheus/client_golang/prometheus"
	dto "github.com/prometheus/client_model/go"
	"github.com/prometheus/prometheus/pkg/labels"
)

var (
	bytesBufferPool = sync.Pool{
		New: func() interface{} {
			return bytes.NewBuffer(nil)
		},
	}
)

// Data for single value (counter/gauge) with labels.
type singleValueWithLabels struct {
	Value       float64
	LabelValues []string
}

// Key to this map is value unique to label values (generated by getLabelsString function)
type singleValueWithLabelsMap map[string]singleValueWithLabels

// This function is used to aggregate results with different labels into a map. Values for same labels are added together.
func (m singleValueWithLabelsMap) aggregateFn(labelsKey string, labelValues []string, value float64) {
	r := m[labelsKey]
	if r.LabelValues == nil {
		r.LabelValues = labelValues
	}

	r.Value += value
	m[labelsKey] = r
}

func (m singleValueWithLabelsMap) prependUserLabelValue(user string) {
	for key, mlv := range m {
		mlv.LabelValues = append([]string{user}, mlv.LabelValues...)
		m[key] = mlv
	}
}

func (m singleValueWithLabelsMap) WriteToMetricChannel(out chan<- prometheus.Metric, desc *prometheus.Desc, valueType prometheus.ValueType) {
	for _, cr := range m {
		out <- prometheus.MustNewConstMetric(desc, valueType, cr.Value, cr.LabelValues...)
	}
}

// MetricFamilyMap is a map of metric names to their family (metrics with same name, but different labels)
// Keeping map of metric name to its family makes it easier to do searches later.
type MetricFamilyMap map[string]*dto.MetricFamily

// NewMetricFamilyMapFromGatherer is like NewMetricFamilyMap but gets metrics directly from a
// prometheus.Gatherer instance.
func NewMetricFamilyMapFromGatherer(gatherer prometheus.Gatherer) (MetricFamilyMap, error) {
	metrics, err := gatherer.Gather()
	if err != nil {
		return nil, err
	}

	return NewMetricFamilyMap(metrics)
}

// NewMetricFamilyMap sorts output from Gatherer.Gather method into a map.
// Gatherer.Gather specifies that there metric families are uniquely named, and we use that fact here.
// If they are not, this method returns error.
func NewMetricFamilyMap(metrics []*dto.MetricFamily) (MetricFamilyMap, error) {
	perMetricName := MetricFamilyMap{}

	for _, m := range metrics {
		name := m.GetName()
		// these errors should never happen when passing Gatherer.Gather() output.
		if name == "" {
			return nil, errors.New("empty name for metric family")
		}
		if perMetricName[name] != nil {
			return nil, fmt.Errorf("non-unique name for metric family: %q", name)
		}

		perMetricName[name] = m
	}

	return perMetricName, nil
}

func (mfm MetricFamilyMap) SumCounters(name string) float64 {
	return sum(mfm[name], counterValue)
}

func (mfm MetricFamilyMap) SumGauges(name string) float64 {
	return sum(mfm[name], gaugeValue)
}

func (mfm MetricFamilyMap) MaxGauges(name string) float64 {
	return max(mfm[name], gaugeValue)
}

func (mfm MetricFamilyMap) SumHistograms(name string) HistogramData {
	hd := HistogramData{}
	mfm.SumHistogramsTo(name, &hd)
	return hd
}

func (mfm MetricFamilyMap) SumHistogramsTo(name string, output *HistogramData) {
	for _, m := range mfm[name].GetMetric() {
		output.AddHistogram(m.GetHistogram())
	}
}

func (mfm MetricFamilyMap) SumSummaries(name string) SummaryData {
	sd := SummaryData{}
	mfm.SumSummariesTo(name, &sd)
	return sd
}

func (mfm MetricFamilyMap) SumSummariesTo(name string, output *SummaryData) {
	for _, m := range mfm[name].GetMetric() {
		output.AddSummary(m.GetSummary())
	}
}

func (mfm MetricFamilyMap) sumOfSingleValuesWithLabels(metric string, labelNames []string, extractFn func(*dto.Metric) float64, aggregateFn func(labelsKey string, labelValues []string, value float64), skipZeroValue bool) {
	metricsPerLabelValue := getMetricsWithLabelNames(mfm[metric], labelNames)

	for key, mlv := range metricsPerLabelValue {
		for _, m := range mlv.metrics {
			val := extractFn(m)
			if skipZeroValue && val == 0 {
				continue
			}

			aggregateFn(key, mlv.labelValues, val)
		}
	}
}

// MetricFamiliesPerUser is a collection of metrics gathered via calling Gatherer.Gather() method on different
// gatherers, one per user.
type MetricFamiliesPerUser []struct {
	user    string
	metrics MetricFamilyMap
}

func (d MetricFamiliesPerUser) GetSumOfCounters(counter string) float64 {
	result := float64(0)
	for _, userEntry := range d {
		result += userEntry.metrics.SumCounters(counter)
	}
	return result
}

func (d MetricFamiliesPerUser) SendSumOfCounters(out chan<- prometheus.Metric, desc *prometheus.Desc, counter string) {
	out <- prometheus.MustNewConstMetric(desc, prometheus.CounterValue, d.GetSumOfCounters(counter))
}

func (d MetricFamiliesPerUser) SendSumOfCountersWithLabels(out chan<- prometheus.Metric, desc *prometheus.Desc, counter string, labelNames ...string) {
	d.sumOfSingleValuesWithLabels(counter, counterValue, labelNames, false).WriteToMetricChannel(out, desc, prometheus.CounterValue)
}

// SendSumOfCountersPerUser provides metrics on a per-user basis, with additional and optional label names.
// This function assumes that `user` is the first label on the provided metric Desc.
func (d MetricFamiliesPerUser) SendSumOfCountersPerUser(out chan<- prometheus.Metric, desc *prometheus.Desc, metric string, options ...MetricOption) {
	opts := applyMetricOptions(options...)

	for _, userEntry := range d {
		if userEntry.user == "" {
			continue
		}

		result := singleValueWithLabelsMap{}
		userEntry.metrics.sumOfSingleValuesWithLabels(metric, opts.labelNames, counterValue, result.aggregateFn, opts.skipZeroValueMetrics)
		result.prependUserLabelValue(userEntry.user)
		result.WriteToMetricChannel(out, desc, prometheus.CounterValue)
	}
}

func (d MetricFamiliesPerUser) GetSumOfGauges(gauge string) float64 {
	result := float64(0)
	for _, userEntry := range d {
		result += userEntry.metrics.SumGauges(gauge)
	}
	return result
}

func (d MetricFamiliesPerUser) SendSumOfGauges(out chan<- prometheus.Metric, desc *prometheus.Desc, gauge string) {
	out <- prometheus.MustNewConstMetric(desc, prometheus.GaugeValue, d.GetSumOfGauges(gauge))
}

func (d MetricFamiliesPerUser) SendSumOfGaugesWithLabels(out chan<- prometheus.Metric, desc *prometheus.Desc, gauge string, labelNames ...string) {
	d.sumOfSingleValuesWithLabels(gauge, gaugeValue, labelNames, false).WriteToMetricChannel(out, desc, prometheus.GaugeValue)
}

func (d MetricFamiliesPerUser) SendSumOfGaugesPerUser(out chan<- prometheus.Metric, desc *prometheus.Desc, gauge string) {
	d.SendSumOfGaugesPerUserWithLabels(out, desc, gauge)
}

// SendSumOfGaugesPerUserWithLabels provides metrics with the provided label names on a per-user basis. This function assumes that `user` is the
// first label on the provided metric Desc
func (d MetricFamiliesPerUser) SendSumOfGaugesPerUserWithLabels(out chan<- prometheus.Metric, desc *prometheus.Desc, metric string, labelNames ...string) {
	for _, userEntry := range d {
		if userEntry.user == "" {
			continue
		}

		result := singleValueWithLabelsMap{}
		userEntry.metrics.sumOfSingleValuesWithLabels(metric, labelNames, gaugeValue, result.aggregateFn, false)
		result.prependUserLabelValue(userEntry.user)
		result.WriteToMetricChannel(out, desc, prometheus.GaugeValue)
	}
}

func (d MetricFamiliesPerUser) sumOfSingleValuesWithLabels(metric string, fn func(*dto.Metric) float64, labelNames []string, skipZeroValue bool) singleValueWithLabelsMap {
	result := singleValueWithLabelsMap{}
	for _, userEntry := range d {
		userEntry.metrics.sumOfSingleValuesWithLabels(metric, labelNames, fn, result.aggregateFn, skipZeroValue)
	}
	return result
}

func (d MetricFamiliesPerUser) SendMaxOfGauges(out chan<- prometheus.Metric, desc *prometheus.Desc, gauge string) {
	result := math.NaN()
	for _, userEntry := range d {
		if value := userEntry.metrics.MaxGauges(gauge); math.IsNaN(result) || value > result {
			result = value
		}
	}

	// If there's no metric, we do send 0 which is the gauge default.
	if math.IsNaN(result) {
		result = 0
	}

	out <- prometheus.MustNewConstMetric(desc, prometheus.GaugeValue, result)
}

func (d MetricFamiliesPerUser) SendMaxOfGaugesPerUser(out chan<- prometheus.Metric, desc *prometheus.Desc, gauge string) {
	for _, userEntry := range d {
		if userEntry.user == "" {
			continue
		}

		result := userEntry.metrics.MaxGauges(gauge)
		out <- prometheus.MustNewConstMetric(desc, prometheus.GaugeValue, result, userEntry.user)
	}
}

func (d MetricFamiliesPerUser) SendSumOfSummaries(out chan<- prometheus.Metric, desc *prometheus.Desc, summaryName string) {
	summaryData := SummaryData{}
	for _, userEntry := range d {
		userEntry.metrics.SumSummariesTo(summaryName, &summaryData)
	}
	out <- summaryData.Metric(desc)
}

func (d MetricFamiliesPerUser) SendSumOfSummariesWithLabels(out chan<- prometheus.Metric, desc *prometheus.Desc, summaryName string, labelNames ...string) {
	type summaryResult struct {
		data        SummaryData
		labelValues []string
	}

	result := map[string]summaryResult{}

	for _, mfm := range d {
		metricsPerLabelValue := getMetricsWithLabelNames(mfm.metrics[summaryName], labelNames)

		for key, mwl := range metricsPerLabelValue {
			for _, m := range mwl.metrics {
				r := result[key]
				if r.labelValues == nil {
					r.labelValues = mwl.labelValues
				}

				r.data.AddSummary(m.GetSummary())
				result[key] = r
			}
		}
	}

	for _, sr := range result {
		out <- sr.data.Metric(desc, sr.labelValues...)
	}
}

func (d MetricFamiliesPerUser) SendSumOfSummariesPerUser(out chan<- prometheus.Metric, desc *prometheus.Desc, summaryName string) {
	for _, userEntry := range d {
		if userEntry.user == "" {
			continue
		}

		data := userEntry.metrics.SumSummaries(summaryName)
		out <- data.Metric(desc, userEntry.user)
	}
}

func (d MetricFamiliesPerUser) SendSumOfHistograms(out chan<- prometheus.Metric, desc *prometheus.Desc, histogramName string) {
	hd := HistogramData{}
	for _, userEntry := range d {
		userEntry.metrics.SumHistogramsTo(histogramName, &hd)
	}
	out <- hd.Metric(desc)
}

func (d MetricFamiliesPerUser) SendSumOfHistogramsWithLabels(out chan<- prometheus.Metric, desc *prometheus.Desc, histogramName string, labelNames ...string) {
	type histogramResult struct {
		data        HistogramData
		labelValues []string
	}

	result := map[string]histogramResult{}

	for _, mfm := range d {
		metricsPerLabelValue := getMetricsWithLabelNames(mfm.metrics[histogramName], labelNames)

		for key, mwl := range metricsPerLabelValue {
			for _, m := range mwl.metrics {
				r := result[key]
				if r.labelValues == nil {
					r.labelValues = mwl.labelValues
				}

				r.data.AddHistogram(m.GetHistogram())
				result[key] = r
			}
		}
	}

	for _, hg := range result {
		out <- hg.data.Metric(desc, hg.labelValues...)
	}
}

// struct for holding metrics with same label values
type metricsWithLabels struct {
	labelValues []string
	metrics     []*dto.Metric
}

func getMetricsWithLabelNames(mf *dto.MetricFamily, labelNames []string) map[string]metricsWithLabels {
	result := map[string]metricsWithLabels{}

	for _, m := range mf.GetMetric() {
		lbls, include := getLabelValues(m, labelNames)
		if !include {
			continue
		}

		key := getLabelsString(lbls)
		r := result[key]
		if r.labelValues == nil {
			r.labelValues = lbls
		}
		r.metrics = append(r.metrics, m)
		result[key] = r
	}
	return result
}

func getLabelValues(m *dto.Metric, labelNames []string) ([]string, bool) {
	result := make([]string, 0, len(labelNames))

	for _, ln := range labelNames {
		found := false

		// Look for the label among the metric ones. We re-iterate on each metric label
		// which is algorithmically bad, but the main assumption is that the labelNames
		// in input are typically very few units.
		for _, lp := range m.GetLabel() {
			if ln != lp.GetName() {
				continue
			}

			result = append(result, lp.GetValue())
			found = true
			break
		}

		if !found {
			// required labels not found
			return nil, false
		}
	}

	return result, true
}

func getLabelsString(labelValues []string) string {
	// Get a buffer from the pool, reset it and release it at the
	// end of the function.
	buf := bytesBufferPool.Get().(*bytes.Buffer)
	buf.Reset()
	defer bytesBufferPool.Put(buf)

	for _, v := range labelValues {
		buf.WriteString(v)
		buf.WriteByte(0) // separator, not used in prometheus labels
	}
	return buf.String()
}

// sum returns sum of values from all metrics from same metric family (= series with the same metric name, but different labels)
// Supplied function extracts value.
func sum(mf *dto.MetricFamily, fn func(*dto.Metric) float64) float64 {
	result := float64(0)
	for _, m := range mf.GetMetric() {
		result += fn(m)
	}
	return result
}

// max returns the max value from all metrics from same metric family (= series with the same metric name, but different labels)
// Supplied function extracts value.
func max(mf *dto.MetricFamily, fn func(*dto.Metric) float64) float64 {
	result := math.NaN()

	for _, m := range mf.GetMetric() {
		if value := fn(m); math.IsNaN(result) || value > result {
			result = value
		}
	}

	// If there's no metric, we do return 0 which is the gauge default.
	if math.IsNaN(result) {
		return 0
	}

	return result
}

// This works even if m is nil, m.Counter is nil or m.Counter.Value is nil (it returns 0 in those cases)
func counterValue(m *dto.Metric) float64 { return m.GetCounter().GetValue() }
func gaugeValue(m *dto.Metric) float64   { return m.GetGauge().GetValue() }

// SummaryData keeps all data needed to create summary metric
type SummaryData struct {
	sampleCount uint64
	sampleSum   float64
	quantiles   map[float64]float64
}

func (s *SummaryData) AddSummary(sum *dto.Summary) {
	s.sampleCount += sum.GetSampleCount()
	s.sampleSum += sum.GetSampleSum()

	qs := sum.GetQuantile()
	if len(qs) > 0 && s.quantiles == nil {
		s.quantiles = map[float64]float64{}
	}

	for _, q := range qs {
		// we assume that all summaries have same quantiles
		s.quantiles[q.GetQuantile()] += q.GetValue()
	}
}

func (s *SummaryData) Metric(desc *prometheus.Desc, labelValues ...string) prometheus.Metric {
	return prometheus.MustNewConstSummary(desc, s.sampleCount, s.sampleSum, s.quantiles, labelValues...)
}

// HistogramData keeps data required to build histogram Metric.
type HistogramData struct {
	sampleCount uint64
	sampleSum   float64
	buckets     map[float64]uint64
}

// Count returns the histogram count value.
func (d HistogramData) Count() uint64 {
	return d.sampleCount
}

// AddHistogram adds histogram from gathered metrics to this histogram data.
// Do not call this function after Metric() has been invoked, because histogram created by Metric
// is using the buckets map (doesn't make a copy), and it's not allowed to change the buckets
// after they've been passed to a prometheus.Metric.
func (d *HistogramData) AddHistogram(histo *dto.Histogram) {
	d.sampleCount += histo.GetSampleCount()
	d.sampleSum += histo.GetSampleSum()

	histoBuckets := histo.GetBucket()
	if len(histoBuckets) > 0 && d.buckets == nil {
		d.buckets = map[float64]uint64{}
	}

	for _, b := range histoBuckets {
		// we assume that all histograms have same buckets
		d.buckets[b.GetUpperBound()] += b.GetCumulativeCount()
	}
}

// AddHistogramData merges another histogram data into this one.
// Do not call this function after Metric() has been invoked, because histogram created by Metric
// is using the buckets map (doesn't make a copy), and it's not allowed to change the buckets
// after they've been passed to a prometheus.Metric.
func (d *HistogramData) AddHistogramData(histo HistogramData) {
	d.sampleCount += histo.sampleCount
	d.sampleSum += histo.sampleSum

	if len(histo.buckets) > 0 && d.buckets == nil {
		d.buckets = map[float64]uint64{}
	}

	for bound, count := range histo.buckets {
		// we assume that all histograms have same buckets
		d.buckets[bound] += count
	}
}

// Metric returns prometheus metric from this histogram data.
//
// Note that returned metric shares bucket with this HistogramData, so avoid
// doing more modifications to this HistogramData after calling Metric.
func (d *HistogramData) Metric(desc *prometheus.Desc, labelValues ...string) prometheus.Metric {
	return prometheus.MustNewConstHistogram(desc, d.sampleCount, d.sampleSum, d.buckets, labelValues...)
}

// Copy returns a copy of this histogram data.
func (d *HistogramData) Copy() *HistogramData {
	cp := &HistogramData{}
	cp.AddHistogramData(*d)
	return cp
}

// NewHistogramDataCollector creates new histogram data collector.
func NewHistogramDataCollector(desc *prometheus.Desc) *HistogramDataCollector {
	return &HistogramDataCollector{
		desc: desc,
		data: &HistogramData{},
	}
}

// HistogramDataCollector combines histogram data, with prometheus descriptor. It can be registered
// into prometheus to report histogram with stored data. Data can be updated via Add method.
type HistogramDataCollector struct {
	desc *prometheus.Desc

	dataMu sync.RWMutex
	data   *HistogramData
}

func (h *HistogramDataCollector) Describe(out chan<- *prometheus.Desc) {
	out <- h.desc
}

func (h *HistogramDataCollector) Collect(out chan<- prometheus.Metric) {
	h.dataMu.RLock()
	defer h.dataMu.RUnlock()

	// We must create a copy of the HistogramData data structure before calling Metric()
	// to honor its contract.
	out <- h.data.Copy().Metric(h.desc)
}

func (h *HistogramDataCollector) Add(hd HistogramData) {
	h.dataMu.Lock()
	defer h.dataMu.Unlock()

	h.data.AddHistogramData(hd)
}

// UserRegistry holds a Prometheus registry associated to a specific user.
type UserRegistry struct {
	user string               // Set to "" when registry is soft-removed.
	reg  *prometheus.Registry // Set to nil, when registry is soft-removed.

	// Set to last result of Gather() call when removing registry.
	lastGather MetricFamilyMap
}

// UserRegistries holds Prometheus registries for multiple users, guaranteeing
// multi-thread safety and stable ordering.
type UserRegistries struct {
	logger log.Logger

	regsMu sync.Mutex
	regs   []UserRegistry
}

// NewUserRegistries makes new UserRegistries.
func NewUserRegistries(l log.Logger) *UserRegistries {
	return &UserRegistries{
		logger: l,
	}
}

// AddUserRegistry adds an user registry. If user already has a registry,
// previous registry is removed, but latest metric values are preserved
// in order to avoid counter resets.
func (r *UserRegistries) AddUserRegistry(user string, reg *prometheus.Registry) {
	r.regsMu.Lock()
	defer r.regsMu.Unlock()

	// Soft-remove user registry, if user has one already.
	for idx := 0; idx < len(r.regs); {
		if r.regs[idx].user != user {
			idx++
			continue
		}

		if r.softRemoveUserRegistry(&r.regs[idx]) {
			// Keep it.
			idx++
		} else {
			// Remove it.
			r.regs = append(r.regs[:idx], r.regs[idx+1:]...)
		}
	}

	// New registries must be added to the end of the list, to guarantee stability.
	r.regs = append(r.regs, UserRegistry{
		user: user,
		reg:  reg,
	})
}

// RemoveUserRegistry removes all Prometheus registries for a given user.
// If hard is true, registry is removed completely.
// If hard is false, latest registry values are preserved for future aggregations.
func (r *UserRegistries) RemoveUserRegistry(user string, hard bool) {
	r.regsMu.Lock()
	defer r.regsMu.Unlock()

	for idx := 0; idx < len(r.regs); {
		if user != r.regs[idx].user {
			idx++
			continue
		}

		if !hard && r.softRemoveUserRegistry(&r.regs[idx]) {
			idx++ // keep it
		} else {
			r.regs = append(r.regs[:idx], r.regs[idx+1:]...) // remove it.
		}
	}
}

// Returns true, if we should keep latest metrics. Returns false if we failed to gather latest metrics,
// and this can be removed completely.
func (r *UserRegistries) softRemoveUserRegistry(ur *UserRegistry) bool {
	last, err := ur.reg.Gather()
	if err != nil {
		level.Warn(r.logger).Log("msg", "failed to gather metrics from registry", "user", ur.user, "err", err)
		return false
	}

	for ix := 0; ix < len(last); {
		// Only keep metrics for which we don't want to go down, since that indicates reset (counter, summary, histogram).
		switch last[ix].GetType() {
		case dto.MetricType_COUNTER, dto.MetricType_SUMMARY, dto.MetricType_HISTOGRAM:
			ix++
		default:
			// Remove gauges and unknowns.
			last = append(last[:ix], last[ix+1:]...)
		}
	}

	// No metrics left.
	if len(last) == 0 {
		return false
	}

	ur.lastGather, err = NewMetricFamilyMap(last)
	if err != nil {
		level.Warn(r.logger).Log("msg", "failed to gather metrics from registry", "user", ur.user, "err", err)
		return false
	}

	ur.user = ""
	ur.reg = nil
	return true
}

// Registries returns a copy of the user registries list.
func (r *UserRegistries) Registries() []UserRegistry {
	r.regsMu.Lock()
	defer r.regsMu.Unlock()

	out := make([]UserRegistry, 0, len(r.regs))
	out = append(out, r.regs...)

	return out
}

// GetRegistryForUser returns currently active registry for given user, or nil, if there is no such registry.
func (r *UserRegistries) GetRegistryForUser(user string) *prometheus.Registry {
	r.regsMu.Lock()
	defer r.regsMu.Unlock()

	for idx := 0; idx < len(r.regs); idx++ {
		if user != r.regs[idx].user {
			continue
		}

		return r.regs[idx].reg
	}
	return nil
}

func (r *UserRegistries) BuildMetricFamiliesPerUser() MetricFamiliesPerUser {
	data := MetricFamiliesPerUser{}
	for _, entry := range r.Registries() {
		// Set for removed users.
		if entry.reg == nil {
			if entry.lastGather != nil {
				data = append(data, struct {
					user    string
					metrics MetricFamilyMap
				}{user: "", metrics: entry.lastGather})
			}

			continue
		}

		m, err := entry.reg.Gather()
		if err == nil {
			var mfm MetricFamilyMap // := would shadow err from outer block, and single err check will not work
			mfm, err = NewMetricFamilyMap(m)
			if err == nil {
				data = append(data, struct {
					user    string
					metrics MetricFamilyMap
				}{
					user:    entry.user,
					metrics: mfm,
				})
			}
		}

		if err != nil {
			level.Warn(r.logger).Log("msg", "failed to gather metrics from registry", "user", entry.user, "err", err)
			continue
		}
	}
	return data
}

// FromLabelPairsToLabels converts dto.LabelPair into labels.Labels.
func FromLabelPairsToLabels(pairs []*dto.LabelPair) labels.Labels {
	builder := labels.NewBuilder(nil)
	for _, pair := range pairs {
		builder.Set(pair.GetName(), pair.GetValue())
	}
	return builder.Labels()
}

// GetSumOfHistogramSampleCount returns the sum of samples count of histograms matching the provided metric name
// and optional label matchers. Returns 0 if no metric matches.
func GetSumOfHistogramSampleCount(families []*dto.MetricFamily, metricName string, matchers labels.Selector) uint64 {
	sum := uint64(0)

	for _, metric := range families {
		if metric.GetName() != metricName {
			continue
		}

		if metric.GetType() != dto.MetricType_HISTOGRAM {
			continue
		}

		for _, series := range metric.GetMetric() {
			if !matchers.Matches(FromLabelPairsToLabels(series.GetLabel())) {
				continue
			}

			histogram := series.GetHistogram()
			sum += histogram.GetSampleCount()
		}
	}

	return sum
}

// MetricOption defines a functional-style option for metrics aggregation.
type MetricOption func(options *metricOptions)

// WithSkipZeroValueMetrics controls whether metrics aggregation should skip zero value metrics.
func WithSkipZeroValueMetrics(options *metricOptions) {
	options.skipZeroValueMetrics = true
}

// WithLabels set labels to use for aggregations.
func WithLabels(labelNames ...string) MetricOption {
	return func(options *metricOptions) {
		options.labelNames = labelNames
	}
}

// applyMetricOptions returns a metricOptions with all the input options applied.
func applyMetricOptions(options ...MetricOption) *metricOptions {
	actual := &metricOptions{}
	for _, option := range options {
		option(actual)
	}

	return actual
}

type metricOptions struct {
	skipZeroValueMetrics bool
	labelNames           []string
}
