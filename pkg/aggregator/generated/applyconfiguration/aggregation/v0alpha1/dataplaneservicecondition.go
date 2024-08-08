// SPDX-License-Identifier: AGPL-3.0-only

// Code generated by applyconfiguration-gen. DO NOT EDIT.

package v0alpha1

import (
	v0alpha1 "github.com/grafana/grafana/pkg/aggregator/apis/aggregation/v0alpha1"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// DataPlaneServiceConditionApplyConfiguration represents an declarative configuration of the DataPlaneServiceCondition type for use
// with apply.
type DataPlaneServiceConditionApplyConfiguration struct {
	Type               *v0alpha1.DataPlaneServiceConditionType `json:"type,omitempty"`
	Status             *v0alpha1.ConditionStatus               `json:"status,omitempty"`
	LastTransitionTime *v1.Time                                `json:"lastTransitionTime,omitempty"`
	Reason             *string                                 `json:"reason,omitempty"`
	Message            *string                                 `json:"message,omitempty"`
}

// DataPlaneServiceConditionApplyConfiguration constructs an declarative configuration of the DataPlaneServiceCondition type for use with
// apply.
func DataPlaneServiceCondition() *DataPlaneServiceConditionApplyConfiguration {
	return &DataPlaneServiceConditionApplyConfiguration{}
}

// WithType sets the Type field in the declarative configuration to the given value
// and returns the receiver, so that objects can be built by chaining "With" function invocations.
// If called multiple times, the Type field is set to the value of the last call.
func (b *DataPlaneServiceConditionApplyConfiguration) WithType(value v0alpha1.DataPlaneServiceConditionType) *DataPlaneServiceConditionApplyConfiguration {
	b.Type = &value
	return b
}

// WithStatus sets the Status field in the declarative configuration to the given value
// and returns the receiver, so that objects can be built by chaining "With" function invocations.
// If called multiple times, the Status field is set to the value of the last call.
func (b *DataPlaneServiceConditionApplyConfiguration) WithStatus(value v0alpha1.ConditionStatus) *DataPlaneServiceConditionApplyConfiguration {
	b.Status = &value
	return b
}

// WithLastTransitionTime sets the LastTransitionTime field in the declarative configuration to the given value
// and returns the receiver, so that objects can be built by chaining "With" function invocations.
// If called multiple times, the LastTransitionTime field is set to the value of the last call.
func (b *DataPlaneServiceConditionApplyConfiguration) WithLastTransitionTime(value v1.Time) *DataPlaneServiceConditionApplyConfiguration {
	b.LastTransitionTime = &value
	return b
}

// WithReason sets the Reason field in the declarative configuration to the given value
// and returns the receiver, so that objects can be built by chaining "With" function invocations.
// If called multiple times, the Reason field is set to the value of the last call.
func (b *DataPlaneServiceConditionApplyConfiguration) WithReason(value string) *DataPlaneServiceConditionApplyConfiguration {
	b.Reason = &value
	return b
}

// WithMessage sets the Message field in the declarative configuration to the given value
// and returns the receiver, so that objects can be built by chaining "With" function invocations.
// If called multiple times, the Message field is set to the value of the last call.
func (b *DataPlaneServiceConditionApplyConfiguration) WithMessage(value string) *DataPlaneServiceConditionApplyConfiguration {
	b.Message = &value
	return b
}
