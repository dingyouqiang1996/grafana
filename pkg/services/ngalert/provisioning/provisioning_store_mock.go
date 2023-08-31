// Code generated by mockery v2.12.0. DO NOT EDIT.

package provisioning

import (
	context "context"
	testing "testing"

	mock "github.com/stretchr/testify/mock"

	models "github.com/grafana/grafana/pkg/services/ngalert/models"
)

// MockProvisioningStore is an autogenerated mock type for the ProvisioningStore type
type MockProvisioningStore struct {
	mock.Mock
}

type MockProvisioningStore_Expecter struct {
	mock *mock.Mock
}

func (_m *MockProvisioningStore) EXPECT() *MockProvisioningStore_Expecter {
	return &MockProvisioningStore_Expecter{mock: &_m.Mock}
}

// DeleteProvenance provides a mock function with given fields: ctx, o, org
func (_m *MockProvisioningStore) DeleteProvenance(ctx context.Context, o models.Provisionable, org int64) error {
	ret := _m.Called(ctx, o, org)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, models.Provisionable, int64) error); ok {
		r0 = rf(ctx, o, org)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// MockProvisioningStore_DeleteProvenance_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'DeleteProvenance'
type MockProvisioningStore_DeleteProvenance_Call struct {
	*mock.Call
}

// DeleteProvenance is a helper method to define mock.On call
//   - ctx context.Context
//   - o models.Provisionable
//   - org int64
func (_e *MockProvisioningStore_Expecter) DeleteProvenance(ctx any, o any, org any) *MockProvisioningStore_DeleteProvenance_Call {
	return &MockProvisioningStore_DeleteProvenance_Call{Call: _e.mock.On("DeleteProvenance", ctx, o, org)}
}

func (_c *MockProvisioningStore_DeleteProvenance_Call) Run(run func(ctx context.Context, o models.Provisionable, org int64)) *MockProvisioningStore_DeleteProvenance_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(models.Provisionable), args[2].(int64))
	})
	return _c
}

func (_c *MockProvisioningStore_DeleteProvenance_Call) Return(_a0 error) *MockProvisioningStore_DeleteProvenance_Call {
	_c.Call.Return(_a0)
	return _c
}

// GetProvenance provides a mock function with given fields: ctx, o, org
func (_m *MockProvisioningStore) GetProvenance(ctx context.Context, o models.Provisionable, org int64) (models.Provenance, error) {
	ret := _m.Called(ctx, o, org)

	var r0 models.Provenance
	if rf, ok := ret.Get(0).(func(context.Context, models.Provisionable, int64) models.Provenance); ok {
		r0 = rf(ctx, o, org)
	} else {
		r0 = ret.Get(0).(models.Provenance)
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, models.Provisionable, int64) error); ok {
		r1 = rf(ctx, o, org)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockProvisioningStore_GetProvenance_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetProvenance'
type MockProvisioningStore_GetProvenance_Call struct {
	*mock.Call
}

// GetProvenance is a helper method to define mock.On call
//   - ctx context.Context
//   - o models.Provisionable
//   - org int64
func (_e *MockProvisioningStore_Expecter) GetProvenance(ctx any, o any, org any) *MockProvisioningStore_GetProvenance_Call {
	return &MockProvisioningStore_GetProvenance_Call{Call: _e.mock.On("GetProvenance", ctx, o, org)}
}

func (_c *MockProvisioningStore_GetProvenance_Call) Run(run func(ctx context.Context, o models.Provisionable, org int64)) *MockProvisioningStore_GetProvenance_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(models.Provisionable), args[2].(int64))
	})
	return _c
}

func (_c *MockProvisioningStore_GetProvenance_Call) Return(_a0 models.Provenance, _a1 error) *MockProvisioningStore_GetProvenance_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

// GetProvenances provides a mock function with given fields: ctx, org, resourceType
func (_m *MockProvisioningStore) GetProvenances(ctx context.Context, org int64, resourceType string) (map[string]models.Provenance, error) {
	ret := _m.Called(ctx, org, resourceType)

	var r0 map[string]models.Provenance
	if rf, ok := ret.Get(0).(func(context.Context, int64, string) map[string]models.Provenance); ok {
		r0 = rf(ctx, org, resourceType)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(map[string]models.Provenance)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, int64, string) error); ok {
		r1 = rf(ctx, org, resourceType)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockProvisioningStore_GetProvenances_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetProvenances'
type MockProvisioningStore_GetProvenances_Call struct {
	*mock.Call
}

// GetProvenances is a helper method to define mock.On call
//   - ctx context.Context
//   - org int64
//   - resourceType string
func (_e *MockProvisioningStore_Expecter) GetProvenances(ctx any, org any, resourceType any) *MockProvisioningStore_GetProvenances_Call {
	return &MockProvisioningStore_GetProvenances_Call{Call: _e.mock.On("GetProvenances", ctx, org, resourceType)}
}

func (_c *MockProvisioningStore_GetProvenances_Call) Run(run func(ctx context.Context, org int64, resourceType string)) *MockProvisioningStore_GetProvenances_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(int64), args[2].(string))
	})
	return _c
}

func (_c *MockProvisioningStore_GetProvenances_Call) Return(_a0 map[string]models.Provenance, _a1 error) *MockProvisioningStore_GetProvenances_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

// SetProvenance provides a mock function with given fields: ctx, o, org, p
func (_m *MockProvisioningStore) SetProvenance(ctx context.Context, o models.Provisionable, org int64, p models.Provenance) error {
	ret := _m.Called(ctx, o, org, p)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, models.Provisionable, int64, models.Provenance) error); ok {
		r0 = rf(ctx, o, org, p)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// MockProvisioningStore_SetProvenance_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'SetProvenance'
type MockProvisioningStore_SetProvenance_Call struct {
	*mock.Call
}

// SetProvenance is a helper method to define mock.On call
//   - ctx context.Context
//   - o models.Provisionable
//   - org int64
//   - p models.Provenance
func (_e *MockProvisioningStore_Expecter) SetProvenance(ctx any, o any, org any, p any) *MockProvisioningStore_SetProvenance_Call {
	return &MockProvisioningStore_SetProvenance_Call{Call: _e.mock.On("SetProvenance", ctx, o, org, p)}
}

func (_c *MockProvisioningStore_SetProvenance_Call) Run(run func(ctx context.Context, o models.Provisionable, org int64, p models.Provenance)) *MockProvisioningStore_SetProvenance_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(models.Provisionable), args[2].(int64), args[3].(models.Provenance))
	})
	return _c
}

func (_c *MockProvisioningStore_SetProvenance_Call) Return(_a0 error) *MockProvisioningStore_SetProvenance_Call {
	_c.Call.Return(_a0)
	return _c
}

// NewMockProvisioningStore creates a new instance of MockProvisioningStore. It also registers the testing.TB interface on the mock and a cleanup function to assert the mocks expectations.
func NewMockProvisioningStore(t testing.TB) *MockProvisioningStore {
	mock := &MockProvisioningStore{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
