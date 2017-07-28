// Copyright 2012-present Oliver Eilhard. All rights reserved.
// Use of this source code is governed by a MIT-license.
// See http://olivere.mit-license.org/license.txt for details.

package elastic

// MaxAggregation is a single-value metrics aggregation that keeps track and
// returns the maximum value among the numeric values extracted from
// the aggregated documents. These values can be extracted either from
// specific numeric fields in the documents, or be generated by
// a provided script.
// See: https://www.elastic.co/guide/en/elasticsearch/reference/5.2/search-aggregations-metrics-max-aggregation.html
type MaxAggregation struct {
	field           string
	script          *Script
	format          string
	subAggregations map[string]Aggregation
	meta            map[string]interface{}
}

func NewMaxAggregation() *MaxAggregation {
	return &MaxAggregation{
		subAggregations: make(map[string]Aggregation),
	}
}

func (a *MaxAggregation) Field(field string) *MaxAggregation {
	a.field = field
	return a
}

func (a *MaxAggregation) Script(script *Script) *MaxAggregation {
	a.script = script
	return a
}

func (a *MaxAggregation) Format(format string) *MaxAggregation {
	a.format = format
	return a
}

func (a *MaxAggregation) SubAggregation(name string, subAggregation Aggregation) *MaxAggregation {
	a.subAggregations[name] = subAggregation
	return a
}

// Meta sets the meta data to be included in the aggregation response.
func (a *MaxAggregation) Meta(metaData map[string]interface{}) *MaxAggregation {
	a.meta = metaData
	return a
}
func (a *MaxAggregation) Source() (interface{}, error) {
	// Example:
	//	{
	//    "aggs" : {
	//      "max_price" : { "max" : { "field" : "price" } }
	//    }
	//	}
	// This method returns only the { "max" : { "field" : "price" } } part.

	source := make(map[string]interface{})
	opts := make(map[string]interface{})
	source["max"] = opts

	// ValuesSourceAggregationBuilder
	if a.field != "" {
		opts["field"] = a.field
	}
	if a.script != nil {
		src, err := a.script.Source()
		if err != nil {
			return nil, err
		}
		opts["script"] = src
	}
	if a.format != "" {
		opts["format"] = a.format
	}

	// AggregationBuilder (SubAggregations)
	if len(a.subAggregations) > 0 {
		aggsMap := make(map[string]interface{})
		source["aggregations"] = aggsMap
		for name, aggregate := range a.subAggregations {
			src, err := aggregate.Source()
			if err != nil {
				return nil, err
			}
			aggsMap[name] = src
		}
	}

	// Add Meta data if available
	if len(a.meta) > 0 {
		source["meta"] = a.meta
	}

	return source, nil
}
