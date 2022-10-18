package models

import (
	"github.com/aws/aws-sdk-go/service/cloudwatch"
)

type ListMetricsProvider interface {
	GetDimensionKeysByDimensionFilter(*DimensionKeysQuery) ([]string, error)
	GetHardCodedDimensionKeysByNamespace(string) ([]string, error)
	GetDimensionKeysByNamespace(string) ([]string, error)
}

type MetricsClientProvider interface {
	ListMetricsWithPageLimit(params *cloudwatch.ListMetricsInput) ([]*cloudwatch.Metric, error)
}

