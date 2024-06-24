//go:build !ignore_autogenerated
// +build !ignore_autogenerated

// SPDX-License-Identifier: AGPL-3.0-only

// Code generated by deepcopy-gen. DO NOT EDIT.

package v0alpha1

import (
	runtime "k8s.io/apimachinery/pkg/runtime"
)

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *Interval) DeepCopyInto(out *Interval) {
	*out = *in
	if in.DaysOfMonth != nil {
		in, out := &in.DaysOfMonth, &out.DaysOfMonth
		*out = make([]string, len(*in))
		copy(*out, *in)
	}
	if in.Location != nil {
		in, out := &in.Location, &out.Location
		*out = new(string)
		**out = **in
	}
	if in.Months != nil {
		in, out := &in.Months, &out.Months
		*out = make([]string, len(*in))
		copy(*out, *in)
	}
	if in.Times != nil {
		in, out := &in.Times, &out.Times
		*out = make([]TimeRange, len(*in))
		copy(*out, *in)
	}
	if in.Weekdays != nil {
		in, out := &in.Weekdays, &out.Weekdays
		*out = make([]string, len(*in))
		copy(*out, *in)
	}
	if in.Years != nil {
		in, out := &in.Years, &out.Years
		*out = make([]string, len(*in))
		copy(*out, *in)
	}
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new Interval.
func (in *Interval) DeepCopy() *Interval {
	if in == nil {
		return nil
	}
	out := new(Interval)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *TimeInterval) DeepCopyInto(out *TimeInterval) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ObjectMeta.DeepCopyInto(&out.ObjectMeta)
	in.Spec.DeepCopyInto(&out.Spec)
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new TimeInterval.
func (in *TimeInterval) DeepCopy() *TimeInterval {
	if in == nil {
		return nil
	}
	out := new(TimeInterval)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyObject is an autogenerated deepcopy function, copying the receiver, creating a new runtime.Object.
func (in *TimeInterval) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *TimeIntervalList) DeepCopyInto(out *TimeIntervalList) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ListMeta.DeepCopyInto(&out.ListMeta)
	if in.Items != nil {
		in, out := &in.Items, &out.Items
		*out = make([]TimeInterval, len(*in))
		for i := range *in {
			(*in)[i].DeepCopyInto(&(*out)[i])
		}
	}
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new TimeIntervalList.
func (in *TimeIntervalList) DeepCopy() *TimeIntervalList {
	if in == nil {
		return nil
	}
	out := new(TimeIntervalList)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyObject is an autogenerated deepcopy function, copying the receiver, creating a new runtime.Object.
func (in *TimeIntervalList) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *TimeIntervalSpec) DeepCopyInto(out *TimeIntervalSpec) {
	*out = *in
	if in.TimeIntervals != nil {
		in, out := &in.TimeIntervals, &out.TimeIntervals
		*out = make([]Interval, len(*in))
		for i := range *in {
			(*in)[i].DeepCopyInto(&(*out)[i])
		}
	}
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new TimeIntervalSpec.
func (in *TimeIntervalSpec) DeepCopy() *TimeIntervalSpec {
	if in == nil {
		return nil
	}
	out := new(TimeIntervalSpec)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *TimeRange) DeepCopyInto(out *TimeRange) {
	*out = *in
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new TimeRange.
func (in *TimeRange) DeepCopy() *TimeRange {
	if in == nil {
		return nil
	}
	out := new(TimeRange)
	in.DeepCopyInto(out)
	return out
}
