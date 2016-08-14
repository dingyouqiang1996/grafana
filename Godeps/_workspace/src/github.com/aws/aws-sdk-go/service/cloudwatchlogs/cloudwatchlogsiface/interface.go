// THIS FILE IS AUTOMATICALLY GENERATED. DO NOT EDIT.

// Package cloudwatchlogsiface provides an interface for the Amazon CloudWatch Logs.
package cloudwatchlogsiface

import (
	"github.com/aws/aws-sdk-go/aws/request"
	"github.com/aws/aws-sdk-go/service/cloudwatchlogs"
)

// CloudWatchLogsAPI is the interface type for cloudwatchlogs.CloudWatchLogs.
type CloudWatchLogsAPI interface {
	CancelExportTaskRequest(*cloudwatchlogs.CancelExportTaskInput) (*request.Request, *cloudwatchlogs.CancelExportTaskOutput)

	CancelExportTask(*cloudwatchlogs.CancelExportTaskInput) (*cloudwatchlogs.CancelExportTaskOutput, error)

	CreateExportTaskRequest(*cloudwatchlogs.CreateExportTaskInput) (*request.Request, *cloudwatchlogs.CreateExportTaskOutput)

	CreateExportTask(*cloudwatchlogs.CreateExportTaskInput) (*cloudwatchlogs.CreateExportTaskOutput, error)

	CreateLogGroupRequest(*cloudwatchlogs.CreateLogGroupInput) (*request.Request, *cloudwatchlogs.CreateLogGroupOutput)

	CreateLogGroup(*cloudwatchlogs.CreateLogGroupInput) (*cloudwatchlogs.CreateLogGroupOutput, error)

	CreateLogStreamRequest(*cloudwatchlogs.CreateLogStreamInput) (*request.Request, *cloudwatchlogs.CreateLogStreamOutput)

	CreateLogStream(*cloudwatchlogs.CreateLogStreamInput) (*cloudwatchlogs.CreateLogStreamOutput, error)

	DeleteDestinationRequest(*cloudwatchlogs.DeleteDestinationInput) (*request.Request, *cloudwatchlogs.DeleteDestinationOutput)

	DeleteDestination(*cloudwatchlogs.DeleteDestinationInput) (*cloudwatchlogs.DeleteDestinationOutput, error)

	DeleteLogGroupRequest(*cloudwatchlogs.DeleteLogGroupInput) (*request.Request, *cloudwatchlogs.DeleteLogGroupOutput)

	DeleteLogGroup(*cloudwatchlogs.DeleteLogGroupInput) (*cloudwatchlogs.DeleteLogGroupOutput, error)

	DeleteLogStreamRequest(*cloudwatchlogs.DeleteLogStreamInput) (*request.Request, *cloudwatchlogs.DeleteLogStreamOutput)

	DeleteLogStream(*cloudwatchlogs.DeleteLogStreamInput) (*cloudwatchlogs.DeleteLogStreamOutput, error)

	DeleteMetricFilterRequest(*cloudwatchlogs.DeleteMetricFilterInput) (*request.Request, *cloudwatchlogs.DeleteMetricFilterOutput)

	DeleteMetricFilter(*cloudwatchlogs.DeleteMetricFilterInput) (*cloudwatchlogs.DeleteMetricFilterOutput, error)

	DeleteRetentionPolicyRequest(*cloudwatchlogs.DeleteRetentionPolicyInput) (*request.Request, *cloudwatchlogs.DeleteRetentionPolicyOutput)

	DeleteRetentionPolicy(*cloudwatchlogs.DeleteRetentionPolicyInput) (*cloudwatchlogs.DeleteRetentionPolicyOutput, error)

	DeleteSubscriptionFilterRequest(*cloudwatchlogs.DeleteSubscriptionFilterInput) (*request.Request, *cloudwatchlogs.DeleteSubscriptionFilterOutput)

	DeleteSubscriptionFilter(*cloudwatchlogs.DeleteSubscriptionFilterInput) (*cloudwatchlogs.DeleteSubscriptionFilterOutput, error)

	DescribeDestinationsRequest(*cloudwatchlogs.DescribeDestinationsInput) (*request.Request, *cloudwatchlogs.DescribeDestinationsOutput)

	DescribeDestinations(*cloudwatchlogs.DescribeDestinationsInput) (*cloudwatchlogs.DescribeDestinationsOutput, error)

	DescribeDestinationsPages(*cloudwatchlogs.DescribeDestinationsInput, func(*cloudwatchlogs.DescribeDestinationsOutput, bool) bool) error

	DescribeExportTasksRequest(*cloudwatchlogs.DescribeExportTasksInput) (*request.Request, *cloudwatchlogs.DescribeExportTasksOutput)

	DescribeExportTasks(*cloudwatchlogs.DescribeExportTasksInput) (*cloudwatchlogs.DescribeExportTasksOutput, error)

	DescribeLogGroupsRequest(*cloudwatchlogs.DescribeLogGroupsInput) (*request.Request, *cloudwatchlogs.DescribeLogGroupsOutput)

	DescribeLogGroups(*cloudwatchlogs.DescribeLogGroupsInput) (*cloudwatchlogs.DescribeLogGroupsOutput, error)

	DescribeLogGroupsPages(*cloudwatchlogs.DescribeLogGroupsInput, func(*cloudwatchlogs.DescribeLogGroupsOutput, bool) bool) error

	DescribeLogStreamsRequest(*cloudwatchlogs.DescribeLogStreamsInput) (*request.Request, *cloudwatchlogs.DescribeLogStreamsOutput)

	DescribeLogStreams(*cloudwatchlogs.DescribeLogStreamsInput) (*cloudwatchlogs.DescribeLogStreamsOutput, error)

	DescribeLogStreamsPages(*cloudwatchlogs.DescribeLogStreamsInput, func(*cloudwatchlogs.DescribeLogStreamsOutput, bool) bool) error

	DescribeMetricFiltersRequest(*cloudwatchlogs.DescribeMetricFiltersInput) (*request.Request, *cloudwatchlogs.DescribeMetricFiltersOutput)

	DescribeMetricFilters(*cloudwatchlogs.DescribeMetricFiltersInput) (*cloudwatchlogs.DescribeMetricFiltersOutput, error)

	DescribeMetricFiltersPages(*cloudwatchlogs.DescribeMetricFiltersInput, func(*cloudwatchlogs.DescribeMetricFiltersOutput, bool) bool) error

	DescribeSubscriptionFiltersRequest(*cloudwatchlogs.DescribeSubscriptionFiltersInput) (*request.Request, *cloudwatchlogs.DescribeSubscriptionFiltersOutput)

	DescribeSubscriptionFilters(*cloudwatchlogs.DescribeSubscriptionFiltersInput) (*cloudwatchlogs.DescribeSubscriptionFiltersOutput, error)

	DescribeSubscriptionFiltersPages(*cloudwatchlogs.DescribeSubscriptionFiltersInput, func(*cloudwatchlogs.DescribeSubscriptionFiltersOutput, bool) bool) error

	FilterLogEventsRequest(*cloudwatchlogs.FilterLogEventsInput) (*request.Request, *cloudwatchlogs.FilterLogEventsOutput)

	FilterLogEvents(*cloudwatchlogs.FilterLogEventsInput) (*cloudwatchlogs.FilterLogEventsOutput, error)

	FilterLogEventsPages(*cloudwatchlogs.FilterLogEventsInput, func(*cloudwatchlogs.FilterLogEventsOutput, bool) bool) error

	GetLogEventsRequest(*cloudwatchlogs.GetLogEventsInput) (*request.Request, *cloudwatchlogs.GetLogEventsOutput)

	GetLogEvents(*cloudwatchlogs.GetLogEventsInput) (*cloudwatchlogs.GetLogEventsOutput, error)

	GetLogEventsPages(*cloudwatchlogs.GetLogEventsInput, func(*cloudwatchlogs.GetLogEventsOutput, bool) bool) error

	PutDestinationRequest(*cloudwatchlogs.PutDestinationInput) (*request.Request, *cloudwatchlogs.PutDestinationOutput)

	PutDestination(*cloudwatchlogs.PutDestinationInput) (*cloudwatchlogs.PutDestinationOutput, error)

	PutDestinationPolicyRequest(*cloudwatchlogs.PutDestinationPolicyInput) (*request.Request, *cloudwatchlogs.PutDestinationPolicyOutput)

	PutDestinationPolicy(*cloudwatchlogs.PutDestinationPolicyInput) (*cloudwatchlogs.PutDestinationPolicyOutput, error)

	PutLogEventsRequest(*cloudwatchlogs.PutLogEventsInput) (*request.Request, *cloudwatchlogs.PutLogEventsOutput)

	PutLogEvents(*cloudwatchlogs.PutLogEventsInput) (*cloudwatchlogs.PutLogEventsOutput, error)

	PutMetricFilterRequest(*cloudwatchlogs.PutMetricFilterInput) (*request.Request, *cloudwatchlogs.PutMetricFilterOutput)

	PutMetricFilter(*cloudwatchlogs.PutMetricFilterInput) (*cloudwatchlogs.PutMetricFilterOutput, error)

	PutRetentionPolicyRequest(*cloudwatchlogs.PutRetentionPolicyInput) (*request.Request, *cloudwatchlogs.PutRetentionPolicyOutput)

	PutRetentionPolicy(*cloudwatchlogs.PutRetentionPolicyInput) (*cloudwatchlogs.PutRetentionPolicyOutput, error)

	PutSubscriptionFilterRequest(*cloudwatchlogs.PutSubscriptionFilterInput) (*request.Request, *cloudwatchlogs.PutSubscriptionFilterOutput)

	PutSubscriptionFilter(*cloudwatchlogs.PutSubscriptionFilterInput) (*cloudwatchlogs.PutSubscriptionFilterOutput, error)

	TestMetricFilterRequest(*cloudwatchlogs.TestMetricFilterInput) (*request.Request, *cloudwatchlogs.TestMetricFilterOutput)

	TestMetricFilter(*cloudwatchlogs.TestMetricFilterInput) (*cloudwatchlogs.TestMetricFilterOutput, error)
}

var _ CloudWatchLogsAPI = (*cloudwatchlogs.CloudWatchLogs)(nil)
