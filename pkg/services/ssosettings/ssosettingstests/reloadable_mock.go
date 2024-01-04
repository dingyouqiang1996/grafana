// Code generated by mockery v2.37.1. DO NOT EDIT.

package ssosettingstests

import (
	context "context"

	models "github.com/grafana/grafana/pkg/services/ssosettings/models"
	mock "github.com/stretchr/testify/mock"
)

// MockReloadable is an autogenerated mock type for the Reloadable type
type MockReloadable struct {
	mock.Mock
}

// Reload provides a mock function with given fields: ctx, settings
func (_m *MockReloadable) Reload(ctx context.Context, settings models.SSOSettings) error {
	ret := _m.Called(ctx, settings)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, models.SSOSettings) error); ok {
		r0 = rf(ctx, settings)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// Validate provides a mock function with given fields: ctx, settings
func (_m *MockReloadable) Validate(ctx context.Context, settings models.SSOSettings) error {
	ret := _m.Called(ctx, settings)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, models.SSOSettings) error); ok {
		r0 = rf(ctx, settings)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// NewMockReloadable creates a new instance of MockReloadable. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewMockReloadable(t interface {
	mock.TestingT
	Cleanup(func())
}) *MockReloadable {
	mock := &MockReloadable{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
