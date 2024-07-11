// SPDX-License-Identifier: AGPL-3.0-only

// Code generated by applyconfiguration-gen. DO NOT EDIT.

package v0alpha1

// TimeRangeApplyConfiguration represents an declarative configuration of the TimeRange type for use
// with apply.
type TimeRangeApplyConfiguration struct {
	EndTime   *string `json:"end_time,omitempty"`
	StartTime *string `json:"start_time,omitempty"`
}

// TimeRangeApplyConfiguration constructs an declarative configuration of the TimeRange type for use with
// apply.
func TimeRange() *TimeRangeApplyConfiguration {
	return &TimeRangeApplyConfiguration{}
}

// WithEndTime sets the EndTime field in the declarative configuration to the given value
// and returns the receiver, so that objects can be built by chaining "With" function invocations.
// If called multiple times, the EndTime field is set to the value of the last call.
func (b *TimeRangeApplyConfiguration) WithEndTime(value string) *TimeRangeApplyConfiguration {
	b.EndTime = &value
	return b
}

// WithStartTime sets the StartTime field in the declarative configuration to the given value
// and returns the receiver, so that objects can be built by chaining "With" function invocations.
// If called multiple times, the StartTime field is set to the value of the last call.
func (b *TimeRangeApplyConfiguration) WithStartTime(value string) *TimeRangeApplyConfiguration {
	b.StartTime = &value
	return b
}
