// Code generated by mockery v2.14.0. DO NOT EDIT.

package publicdashboards

import (
	context "context"

	backend "github.com/grafana/grafana-plugin-sdk-go/backend"

	dtos "github.com/grafana/grafana/pkg/api/dtos"

	mock "github.com/stretchr/testify/mock"

	models "github.com/grafana/grafana/pkg/services/publicdashboards/models"

	pkgmodels "github.com/grafana/grafana/pkg/models"

	user "github.com/grafana/grafana/pkg/services/user"
)

// FakePublicDashboardService is an autogenerated mock type for the Service type
type FakePublicDashboardService struct {
	mock.Mock
}

// ExistsEnabledByAccessToken provides a mock function with given fields: ctx, accessToken
func (_m *FakePublicDashboardService) ExistsEnabledByAccessToken(ctx context.Context, accessToken string) (bool, error) {
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

// ExistsEnabledByDashboardUid provides a mock function with given fields: ctx, dashboardUid
func (_m *FakePublicDashboardService) ExistsEnabledByDashboardUid(ctx context.Context, dashboardUid string) (bool, error) {
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

// FindAll provides a mock function with given fields: ctx, u, orgId
func (_m *FakePublicDashboardService) FindAll(ctx context.Context, u *user.SignedInUser, orgId int64) ([]models.PublicDashboardListResponse, error) {
	ret := _m.Called(ctx, u, orgId)

	var r0 []models.PublicDashboardListResponse
	if rf, ok := ret.Get(0).(func(context.Context, *user.SignedInUser, int64) []models.PublicDashboardListResponse); ok {
		r0 = rf(ctx, u, orgId)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]models.PublicDashboardListResponse)
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

// FindAnnotations provides a mock function with given fields: ctx, reqDTO, accessToken
func (_m *FakePublicDashboardService) FindAnnotations(ctx context.Context, reqDTO models.AnnotationsQueryDTO, accessToken string) ([]models.AnnotationEvent, error) {
	ret := _m.Called(ctx, reqDTO, accessToken)

	var r0 []models.AnnotationEvent
	if rf, ok := ret.Get(0).(func(context.Context, models.AnnotationsQueryDTO, string) []models.AnnotationEvent); ok {
		r0 = rf(ctx, reqDTO, accessToken)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]models.AnnotationEvent)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, models.AnnotationsQueryDTO, string) error); ok {
		r1 = rf(ctx, reqDTO, accessToken)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// FindByDashboardUid provides a mock function with given fields: ctx, orgId, dashboardUid
func (_m *FakePublicDashboardService) FindByDashboardUid(ctx context.Context, orgId int64, dashboardUid string) (*models.PublicDashboard, error) {
	ret := _m.Called(ctx, orgId, dashboardUid)

	var r0 *models.PublicDashboard
	if rf, ok := ret.Get(0).(func(context.Context, int64, string) *models.PublicDashboard); ok {
		r0 = rf(ctx, orgId, dashboardUid)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.PublicDashboard)
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

// FindDashboard provides a mock function with given fields: ctx, dashboardUid, orgId
func (_m *FakePublicDashboardService) FindDashboard(ctx context.Context, dashboardUid string, orgId int64) (*pkgmodels.Dashboard, error) {
	ret := _m.Called(ctx, dashboardUid, orgId)

	var r0 *pkgmodels.Dashboard
	if rf, ok := ret.Get(0).(func(context.Context, string, int64) *pkgmodels.Dashboard); ok {
		r0 = rf(ctx, dashboardUid, orgId)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*pkgmodels.Dashboard)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string, int64) error); ok {
		r1 = rf(ctx, dashboardUid, orgId)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// FindPublicDashboardAndDashboardByAccessToken provides a mock function with given fields: ctx, accessToken
func (_m *FakePublicDashboardService) FindPublicDashboardAndDashboardByAccessToken(ctx context.Context, accessToken string) (*models.PublicDashboard, *pkgmodels.Dashboard, error) {
	ret := _m.Called(ctx, accessToken)

	var r0 *models.PublicDashboard
	if rf, ok := ret.Get(0).(func(context.Context, string) *models.PublicDashboard); ok {
		r0 = rf(ctx, accessToken)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.PublicDashboard)
		}
	}

	var r1 *pkgmodels.Dashboard
	if rf, ok := ret.Get(1).(func(context.Context, string) *pkgmodels.Dashboard); ok {
		r1 = rf(ctx, accessToken)
	} else {
		if ret.Get(1) != nil {
			r1 = ret.Get(1).(*pkgmodels.Dashboard)
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

// GetMetricRequest provides a mock function with given fields: ctx, dashboard, publicDashboard, panelId, reqDTO
func (_m *FakePublicDashboardService) GetMetricRequest(ctx context.Context, dashboard *pkgmodels.Dashboard, publicDashboard *models.PublicDashboard, panelId int64, reqDTO models.PublicDashboardQueryDTO) (dtos.MetricRequest, error) {
	ret := _m.Called(ctx, dashboard, publicDashboard, panelId, reqDTO)

	var r0 dtos.MetricRequest
	if rf, ok := ret.Get(0).(func(context.Context, *pkgmodels.Dashboard, *models.PublicDashboard, int64, models.PublicDashboardQueryDTO) dtos.MetricRequest); ok {
		r0 = rf(ctx, dashboard, publicDashboard, panelId, reqDTO)
	} else {
		r0 = ret.Get(0).(dtos.MetricRequest)
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, *pkgmodels.Dashboard, *models.PublicDashboard, int64, models.PublicDashboardQueryDTO) error); ok {
		r1 = rf(ctx, dashboard, publicDashboard, panelId, reqDTO)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetOrgIdByAccessToken provides a mock function with given fields: ctx, accessToken
func (_m *FakePublicDashboardService) GetOrgIdByAccessToken(ctx context.Context, accessToken string) (int64, error) {
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
func (_m *FakePublicDashboardService) GetQueryDataResponse(ctx context.Context, skipCache bool, reqDTO models.PublicDashboardQueryDTO, panelId int64, accessToken string) (*backend.QueryDataResponse, error) {
	ret := _m.Called(ctx, skipCache, reqDTO, panelId, accessToken)

	var r0 *backend.QueryDataResponse
	if rf, ok := ret.Get(0).(func(context.Context, bool, models.PublicDashboardQueryDTO, int64, string) *backend.QueryDataResponse); ok {
		r0 = rf(ctx, skipCache, reqDTO, panelId, accessToken)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*backend.QueryDataResponse)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, bool, models.PublicDashboardQueryDTO, int64, string) error); ok {
		r1 = rf(ctx, skipCache, reqDTO, panelId, accessToken)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// NewPublicDashboardAccessToken provides a mock function with given fields: ctx
func (_m *FakePublicDashboardService) NewPublicDashboardAccessToken(ctx context.Context) (string, error) {
	ret := _m.Called(ctx)

	var r0 string
	if rf, ok := ret.Get(0).(func(context.Context) string); ok {
		r0 = rf(ctx)
	} else {
		r0 = ret.Get(0).(string)
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context) error); ok {
		r1 = rf(ctx)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// NewPublicDashboardUid provides a mock function with given fields: ctx
func (_m *FakePublicDashboardService) NewPublicDashboardUid(ctx context.Context) (string, error) {
	ret := _m.Called(ctx)

	var r0 string
	if rf, ok := ret.Get(0).(func(context.Context) string); ok {
		r0 = rf(ctx)
	} else {
		r0 = ret.Get(0).(string)
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context) error); ok {
		r1 = rf(ctx)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Save provides a mock function with given fields: ctx, u, dto
func (_m *FakePublicDashboardService) Save(ctx context.Context, u *user.SignedInUser, dto *models.SavePublicDashboardConfigDTO) (*models.PublicDashboard, error) {
	ret := _m.Called(ctx, u, dto)

	var r0 *models.PublicDashboard
	if rf, ok := ret.Get(0).(func(context.Context, *user.SignedInUser, *models.SavePublicDashboardConfigDTO) *models.PublicDashboard); ok {
		r0 = rf(ctx, u, dto)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.PublicDashboard)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, *user.SignedInUser, *models.SavePublicDashboardConfigDTO) error); ok {
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
