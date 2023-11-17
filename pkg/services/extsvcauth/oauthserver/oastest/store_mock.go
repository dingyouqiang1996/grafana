// Code generated by mockery v2.35.2. DO NOT EDIT.

package oastest

import (
	context "context"

	mock "github.com/stretchr/testify/mock"
	jose "gopkg.in/square/go-jose.v2"

	oauthserver "github.com/grafana/grafana/pkg/services/extsvcauth/oauthserver"
)

// MockStore is an autogenerated mock type for the Store type
type MockStore struct {
	mock.Mock
}

// DeleteExternalService provides a mock function with given fields: ctx, id
func (_m *MockStore) DeleteExternalService(ctx context.Context, id string) error {
	ret := _m.Called(ctx, id)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, string) error); ok {
		r0 = rf(ctx, id)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// GetExternalService provides a mock function with given fields: ctx, id
func (_m *MockStore) GetExternalService(ctx context.Context, id string) (*oauthserver.OAuthExternalService, error) {
	ret := _m.Called(ctx, id)

	var r0 *oauthserver.OAuthExternalService
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, string) (*oauthserver.OAuthExternalService, error)); ok {
		return rf(ctx, id)
	}
	if rf, ok := ret.Get(0).(func(context.Context, string) *oauthserver.OAuthExternalService); ok {
		r0 = rf(ctx, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*oauthserver.OAuthExternalService)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetExternalServiceByName provides a mock function with given fields: ctx, name
func (_m *MockStore) GetExternalServiceByName(ctx context.Context, name string) (*oauthserver.OAuthExternalService, error) {
	ret := _m.Called(ctx, name)

	var r0 *oauthserver.OAuthExternalService
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, string) (*oauthserver.OAuthExternalService, error)); ok {
		return rf(ctx, name)
	}
	if rf, ok := ret.Get(0).(func(context.Context, string) *oauthserver.OAuthExternalService); ok {
		r0 = rf(ctx, name)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*oauthserver.OAuthExternalService)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, name)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetExternalServiceNames provides a mock function with given fields: ctx
func (_m *MockStore) GetExternalServiceNames(ctx context.Context) ([]string, error) {
	ret := _m.Called(ctx)

	var r0 []string
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context) ([]string, error)); ok {
		return rf(ctx)
	}
	if rf, ok := ret.Get(0).(func(context.Context) []string); ok {
		r0 = rf(ctx)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]string)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context) error); ok {
		r1 = rf(ctx)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetExternalServicePublicKey provides a mock function with given fields: ctx, clientID
func (_m *MockStore) GetExternalServicePublicKey(ctx context.Context, clientID string) (*jose.JSONWebKey, error) {
	ret := _m.Called(ctx, clientID)

	var r0 *jose.JSONWebKey
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, string) (*jose.JSONWebKey, error)); ok {
		return rf(ctx, clientID)
	}
	if rf, ok := ret.Get(0).(func(context.Context, string) *jose.JSONWebKey); ok {
		r0 = rf(ctx, clientID)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*jose.JSONWebKey)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, clientID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// RegisterExternalService provides a mock function with given fields: ctx, client
func (_m *MockStore) RegisterExternalService(ctx context.Context, client *oauthserver.OAuthExternalService) error {
	ret := _m.Called(ctx, client)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, *oauthserver.OAuthExternalService) error); ok {
		r0 = rf(ctx, client)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// SaveExternalService provides a mock function with given fields: ctx, client
func (_m *MockStore) SaveExternalService(ctx context.Context, client *oauthserver.OAuthExternalService) error {
	ret := _m.Called(ctx, client)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, *oauthserver.OAuthExternalService) error); ok {
		r0 = rf(ctx, client)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// UpdateExternalServiceGrantTypes provides a mock function with given fields: ctx, clientID, grantTypes
func (_m *MockStore) UpdateExternalServiceGrantTypes(ctx context.Context, clientID string, grantTypes string) error {
	ret := _m.Called(ctx, clientID, grantTypes)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, string, string) error); ok {
		r0 = rf(ctx, clientID, grantTypes)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// NewMockStore creates a new instance of MockStore. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewMockStore(t interface {
	mock.TestingT
	Cleanup(func())
}) *MockStore {
	mock := &MockStore{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
