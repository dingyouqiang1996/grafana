// Code generated by mockery v2.10.6. DO NOT EDIT.

package searchV2

import (
	context "context"

	backend "github.com/grafana/grafana-plugin-sdk-go/backend"

	mock "github.com/stretchr/testify/mock"
)

// MockSearchService is an autogenerated mock type for the SearchService type
type MockSearchService struct {
	mock.Mock
}

// DoDashboardQuery provides a mock function with given fields: ctx, user, orgId, query
func (_m *MockSearchService) DoDashboardQuery(ctx context.Context, user *backend.User, orgId int64, query DashboardQuery) *backend.DataResponse {
	ret := _m.Called(ctx, user, orgId, query)

	var r0 *backend.DataResponse
	if rf, ok := ret.Get(0).(func(context.Context, *backend.User, int64, DashboardQuery) *backend.DataResponse); ok {
		r0 = rf(ctx, user, orgId, query)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*backend.DataResponse)
		}
	}

	return r0
}

// IsDisabled provides a mock function with given fields:
func (_m *MockSearchService) IsDisabled() bool {
	ret := _m.Called()

	var r0 bool
	if rf, ok := ret.Get(0).(func() bool); ok {
		r0 = rf()
	} else {
		r0 = ret.Get(0).(bool)
	}

	return r0
}

// RegisterDashboardIndexExtender provides a mock function with given fields: ext
func (_m *MockSearchService) RegisterDashboardIndexExtender(ext DashboardIndexExtender) {
	_m.Called(ext)
}

// Run provides a mock function with given fields: ctx
func (_m *MockSearchService) Run(ctx context.Context) error {
	ret := _m.Called(ctx)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context) error); ok {
		r0 = rf(ctx)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// TriggerReIndex provides a mock function with given fields:
func (_m *MockSearchService) TriggerReIndex() {
	_m.Called()
}
