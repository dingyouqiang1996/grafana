// Code generated by mockery v2.14.0. DO NOT EDIT.

package publicdashboards

import (
	context "context"

	backend "github.com/grafana/grafana-plugin-sdk-go/backend"

	dtos "github.com/grafana/grafana/pkg/api/dtos"

	mock "github.com/stretchr/testify/mock"

	models "github.com/grafana/grafana/pkg/models"

	publicdashboardsmodels "github.com/grafana/grafana/pkg/services/publicdashboards/models"

	user "github.com/grafana/grafana/pkg/services/user"
)

// FakePublicDashboardService is an autogenerated mock type for the Service type
type FakePublicDashboardService struct {
	mock.Mock
}

// AccessTokenExists provides a mock function with given fields: ctx, accessToken
func (_m *FakePublicDashboardService) AccessTokenExists(ctx context.Context, accessToken string) (bool, error) {
	ret := _m.Called(ctx, accessToken)

	var r0 bool
	if rf, ok := ret.Get(0).(func(context.Context, string) bool); ok {
		r0 = rf(ctx, accessToken)
	} else {
		r0 = ret.Get(0).(bool)
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, accessToken)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// BuildAnonymousUser provides a mock function with given fields: ctx, dashboard
func (_m *FakePublicDashboardService) BuildAnonymousUser(ctx context.Context, dashboard *models.Dashboard) *user.SignedInUser {
	ret := _m.Called(ctx, dashboard)

	var r0 *user.SignedInUser
	if rf, ok := ret.Get(0).(func(context.Context, *models.Dashboard) *user.SignedInUser); ok {
		r0 = rf(ctx, dashboard)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*user.SignedInUser)
		}
	}

	return r0
}

// GetAnnotations provides a mock function with given fields: ctx, reqDTO, accessToken
func (_m *FakePublicDashboardService) GetAnnotations(ctx context.Context, reqDTO publicdashboardsmodels.AnnotationsQueryDTO, accessToken string) ([]publicdashboardsmodels.AnnotationEvent, error) {
	ret := _m.Called(ctx, reqDTO, accessToken)

	var r0 []publicdashboardsmodels.AnnotationEvent
	if rf, ok := ret.Get(0).(func(context.Context, publicdashboardsmodels.AnnotationsQueryDTO, string) []publicdashboardsmodels.AnnotationEvent); ok {
		r0 = rf(ctx, reqDTO, accessToken)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]publicdashboardsmodels.AnnotationEvent)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, publicdashboardsmodels.AnnotationsQueryDTO, string) error); ok {
		r1 = rf(ctx, reqDTO, accessToken)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetDashboard provides a mock function with given fields: ctx, dashboardUid
func (_m *FakePublicDashboardService) GetDashboard(ctx context.Context, dashboardUid string) (*models.Dashboard, error) {
	ret := _m.Called(ctx, dashboardUid)

	var r0 *models.Dashboard
	if rf, ok := ret.Get(0).(func(context.Context, string) *models.Dashboard); ok {
		r0 = rf(ctx, dashboardUid)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.Dashboard)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, dashboardUid)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetMetricRequest provides a mock function with given fields: ctx, dashboard, publicDashboard, panelId, reqDTO
func (_m *FakePublicDashboardService) GetMetricRequest(ctx context.Context, dashboard *models.Dashboard, publicDashboard *publicdashboardsmodels.PublicDashboard, panelId int64, reqDTO publicdashboardsmodels.PublicDashboardQueryDTO) (dtos.MetricRequest, error) {
	ret := _m.Called(ctx, dashboard, publicDashboard, panelId, reqDTO)

	var r0 dtos.MetricRequest
	if rf, ok := ret.Get(0).(func(context.Context, *models.Dashboard, *publicdashboardsmodels.PublicDashboard, int64, publicdashboardsmodels.PublicDashboardQueryDTO) dtos.MetricRequest); ok {
		r0 = rf(ctx, dashboard, publicDashboard, panelId, reqDTO)
	} else {
		r0 = ret.Get(0).(dtos.MetricRequest)
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, *models.Dashboard, *publicdashboardsmodels.PublicDashboard, int64, publicdashboardsmodels.PublicDashboardQueryDTO) error); ok {
		r1 = rf(ctx, dashboard, publicDashboard, panelId, reqDTO)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetPublicDashboard provides a mock function with given fields: ctx, accessToken
func (_m *FakePublicDashboardService) GetPublicDashboard(ctx context.Context, accessToken string) (*publicdashboardsmodels.PublicDashboard, *models.Dashboard, error) {
	ret := _m.Called(ctx, accessToken)

	var r0 *publicdashboardsmodels.PublicDashboard
	if rf, ok := ret.Get(0).(func(context.Context, string) *publicdashboardsmodels.PublicDashboard); ok {
		r0 = rf(ctx, accessToken)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*publicdashboardsmodels.PublicDashboard)
		}
	}

	var r1 *models.Dashboard
	if rf, ok := ret.Get(1).(func(context.Context, string) *models.Dashboard); ok {
		r1 = rf(ctx, accessToken)
	} else {
		if ret.Get(1) != nil {
			r1 = ret.Get(1).(*models.Dashboard)
		}
	}

	var r2 error
	if rf, ok := ret.Get(2).(func(context.Context, string) error); ok {
		r2 = rf(ctx, accessToken)
	} else {
		r2 = ret.Error(2)
	}

	return r0, r1, r2
}

// GetPublicDashboardConfig provides a mock function with given fields: ctx, orgId, dashboardUid
func (_m *FakePublicDashboardService) GetPublicDashboardConfig(ctx context.Context, orgId int64, dashboardUid string) (*publicdashboardsmodels.PublicDashboard, error) {
	ret := _m.Called(ctx, orgId, dashboardUid)

	var r0 *publicdashboardsmodels.PublicDashboard
	if rf, ok := ret.Get(0).(func(context.Context, int64, string) *publicdashboardsmodels.PublicDashboard); ok {
		r0 = rf(ctx, orgId, dashboardUid)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*publicdashboardsmodels.PublicDashboard)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, int64, string) error); ok {
		r1 = rf(ctx, orgId, dashboardUid)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetPublicDashboardOrgId provides a mock function with given fields: ctx, accessToken
func (_m *FakePublicDashboardService) GetPublicDashboardOrgId(ctx context.Context, accessToken string) (int64, error) {
	ret := _m.Called(ctx, accessToken)

	var r0 int64
	if rf, ok := ret.Get(0).(func(context.Context, string) int64); ok {
		r0 = rf(ctx, accessToken)
	} else {
		r0 = ret.Get(0).(int64)
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, accessToken)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetQueryDataResponse provides a mock function with given fields: ctx, skipCache, reqDTO, panelId, accessToken
func (_m *FakePublicDashboardService) GetQueryDataResponse(ctx context.Context, skipCache bool, reqDTO publicdashboardsmodels.PublicDashboardQueryDTO, panelId int64, accessToken string) (*backend.QueryDataResponse, error) {
	ret := _m.Called(ctx, skipCache, reqDTO, panelId, accessToken)

	var r0 *backend.QueryDataResponse
	if rf, ok := ret.Get(0).(func(context.Context, bool, publicdashboardsmodels.PublicDashboardQueryDTO, int64, string) *backend.QueryDataResponse); ok {
		r0 = rf(ctx, skipCache, reqDTO, panelId, accessToken)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*backend.QueryDataResponse)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, bool, publicdashboardsmodels.PublicDashboardQueryDTO, int64, string) error); ok {
		r1 = rf(ctx, skipCache, reqDTO, panelId, accessToken)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// ListPublicDashboards provides a mock function with given fields: ctx, u, orgId
func (_m *FakePublicDashboardService) ListPublicDashboards(ctx context.Context, u *user.SignedInUser, orgId int64) ([]publicdashboardsmodels.PublicDashboardListResponse, error) {
	ret := _m.Called(ctx, u, orgId)

	var r0 []publicdashboardsmodels.PublicDashboardListResponse
	if rf, ok := ret.Get(0).(func(context.Context, *user.SignedInUser, int64) []publicdashboardsmodels.PublicDashboardListResponse); ok {
		r0 = rf(ctx, u, orgId)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]publicdashboardsmodels.PublicDashboardListResponse)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, *user.SignedInUser, int64) error); ok {
		r1 = rf(ctx, u, orgId)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// PublicDashboardEnabled provides a mock function with given fields: ctx, dashboardUid
func (_m *FakePublicDashboardService) PublicDashboardEnabled(ctx context.Context, dashboardUid string) (bool, error) {
	ret := _m.Called(ctx, dashboardUid)

	var r0 bool
	if rf, ok := ret.Get(0).(func(context.Context, string) bool); ok {
		r0 = rf(ctx, dashboardUid)
	} else {
		r0 = ret.Get(0).(bool)
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, dashboardUid)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// SavePublicDashboardConfig provides a mock function with given fields: ctx, u, dto
func (_m *FakePublicDashboardService) SavePublicDashboardConfig(ctx context.Context, u *user.SignedInUser, dto *publicdashboardsmodels.SavePublicDashboardConfigDTO) (*publicdashboardsmodels.PublicDashboard, error) {
	ret := _m.Called(ctx, u, dto)

	var r0 *publicdashboardsmodels.PublicDashboard
	if rf, ok := ret.Get(0).(func(context.Context, *user.SignedInUser, *publicdashboardsmodels.SavePublicDashboardConfigDTO) *publicdashboardsmodels.PublicDashboard); ok {
		r0 = rf(ctx, u, dto)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*publicdashboardsmodels.PublicDashboard)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, *user.SignedInUser, *publicdashboardsmodels.SavePublicDashboardConfigDTO) error); ok {
		r1 = rf(ctx, u, dto)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

type mockConstructorTestingTNewFakePublicDashboardService interface {
	mock.TestingT
	Cleanup(func())
}

// NewFakePublicDashboardService creates a new instance of FakePublicDashboardService. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
func NewFakePublicDashboardService(t mockConstructorTestingTNewFakePublicDashboardService) *FakePublicDashboardService {
	mock := &FakePublicDashboardService{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
