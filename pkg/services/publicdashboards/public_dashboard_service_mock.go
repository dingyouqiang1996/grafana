// Code generated by mockery v2.32.0. DO NOT EDIT.

package publicdashboards

import (
	context "context"

	backend "github.com/grafana/grafana-plugin-sdk-go/backend"

	dashboards "github.com/grafana/grafana/pkg/services/dashboards"

	dtos "github.com/grafana/grafana/pkg/api/dtos"

	mock "github.com/stretchr/testify/mock"

	models "github.com/grafana/grafana/pkg/services/publicdashboards/models"

	user "github.com/grafana/grafana/pkg/services/user"
)

// FakePublicDashboardService is an autogenerated mock type for the Service type
type FakePublicDashboardService struct {
	mock.Mock
}

// Create provides a mock function with given fields: ctx, u, dto
func (_m *FakePublicDashboardService) Create(ctx context.Context, u *user.SignedInUser, dto *models.SavePublicDashboardDTO) (*models.PublicDashboard, error) {
	ret := _m.Called(ctx, u, dto)

	var r0 *models.PublicDashboard
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, *user.SignedInUser, *models.SavePublicDashboardDTO) (*models.PublicDashboard, error)); ok {
		return rf(ctx, u, dto)
	}
	if rf, ok := ret.Get(0).(func(context.Context, *user.SignedInUser, *models.SavePublicDashboardDTO) *models.PublicDashboard); ok {
		r0 = rf(ctx, u, dto)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.PublicDashboard)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, *user.SignedInUser, *models.SavePublicDashboardDTO) error); ok {
		r1 = rf(ctx, u, dto)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Delete provides a mock function with given fields: ctx, uid
func (_m *FakePublicDashboardService) Delete(ctx context.Context, uid string, dashboardUid string) error {
	ret := _m.Called(ctx, uid)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, string) error); ok {
		r0 = rf(ctx, uid)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// DeleteByDashboard provides a mock function with given fields: ctx, dashboard
func (_m *FakePublicDashboardService) DeleteByDashboard(ctx context.Context, dashboard *dashboards.Dashboard) error {
	ret := _m.Called(ctx, dashboard)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, *dashboards.Dashboard) error); ok {
		r0 = rf(ctx, dashboard)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// ExistsEnabledByAccessToken provides a mock function with given fields: ctx, accessToken
func (_m *FakePublicDashboardService) ExistsEnabledByAccessToken(ctx context.Context, accessToken string) (bool, error) {
	ret := _m.Called(ctx, accessToken)

	var r0 bool
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, string) (bool, error)); ok {
		return rf(ctx, accessToken)
	}
	if rf, ok := ret.Get(0).(func(context.Context, string) bool); ok {
		r0 = rf(ctx, accessToken)
	} else {
		r0 = ret.Get(0).(bool)
	}

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
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, string) (bool, error)); ok {
		return rf(ctx, dashboardUid)
	}
	if rf, ok := ret.Get(0).(func(context.Context, string) bool); ok {
		r0 = rf(ctx, dashboardUid)
	} else {
		r0 = ret.Get(0).(bool)
	}

	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, dashboardUid)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Find provides a mock function with given fields: ctx, uid
func (_m *FakePublicDashboardService) Find(ctx context.Context, uid string) (*models.PublicDashboard, error) {
	ret := _m.Called(ctx, uid)

	var r0 *models.PublicDashboard
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, string) (*models.PublicDashboard, error)); ok {
		return rf(ctx, uid)
	}
	if rf, ok := ret.Get(0).(func(context.Context, string) *models.PublicDashboard); ok {
		r0 = rf(ctx, uid)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.PublicDashboard)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, uid)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// FindAllWithPagination provides a mock function with given fields: ctx, query
func (_m *FakePublicDashboardService) FindAllWithPagination(ctx context.Context, query *models.PublicDashboardListQuery) (*models.PublicDashboardListResponseWithPagination, error) {
	ret := _m.Called(ctx, query)

	var r0 *models.PublicDashboardListResponseWithPagination
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, *models.PublicDashboardListQuery) (*models.PublicDashboardListResponseWithPagination, error)); ok {
		return rf(ctx, query)
	}
	if rf, ok := ret.Get(0).(func(context.Context, *models.PublicDashboardListQuery) *models.PublicDashboardListResponseWithPagination); ok {
		r0 = rf(ctx, query)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.PublicDashboardListResponseWithPagination)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, *models.PublicDashboardListQuery) error); ok {
		r1 = rf(ctx, query)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// FindAnnotations provides a mock function with given fields: ctx, reqDTO, accessToken
func (_m *FakePublicDashboardService) FindAnnotations(ctx context.Context, reqDTO models.AnnotationsQueryDTO, accessToken string) ([]models.AnnotationEvent, error) {
	ret := _m.Called(ctx, reqDTO, accessToken)

	var r0 []models.AnnotationEvent
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, models.AnnotationsQueryDTO, string) ([]models.AnnotationEvent, error)); ok {
		return rf(ctx, reqDTO, accessToken)
	}
	if rf, ok := ret.Get(0).(func(context.Context, models.AnnotationsQueryDTO, string) []models.AnnotationEvent); ok {
		r0 = rf(ctx, reqDTO, accessToken)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]models.AnnotationEvent)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, models.AnnotationsQueryDTO, string) error); ok {
		r1 = rf(ctx, reqDTO, accessToken)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// FindByAccessToken provides a mock function with given fields: ctx, accessToken
func (_m *FakePublicDashboardService) FindByAccessToken(ctx context.Context, accessToken string) (*models.PublicDashboard, error) {
	ret := _m.Called(ctx, accessToken)

	var r0 *models.PublicDashboard
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, string) (*models.PublicDashboard, error)); ok {
		return rf(ctx, accessToken)
	}
	if rf, ok := ret.Get(0).(func(context.Context, string) *models.PublicDashboard); ok {
		r0 = rf(ctx, accessToken)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.PublicDashboard)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, accessToken)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// FindByDashboardUid provides a mock function with given fields: ctx, orgId, dashboardUid
func (_m *FakePublicDashboardService) FindByDashboardUid(ctx context.Context, orgId int64, dashboardUid string) (*models.PublicDashboard, error) {
	ret := _m.Called(ctx, orgId, dashboardUid)

	var r0 *models.PublicDashboard
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, int64, string) (*models.PublicDashboard, error)); ok {
		return rf(ctx, orgId, dashboardUid)
	}
	if rf, ok := ret.Get(0).(func(context.Context, int64, string) *models.PublicDashboard); ok {
		r0 = rf(ctx, orgId, dashboardUid)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.PublicDashboard)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, int64, string) error); ok {
		r1 = rf(ctx, orgId, dashboardUid)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// FindDashboard provides a mock function with given fields: ctx, orgId, dashboardUid
func (_m *FakePublicDashboardService) FindDashboard(ctx context.Context, orgId int64, dashboardUid string) (*dashboards.Dashboard, error) {
	ret := _m.Called(ctx, orgId, dashboardUid)

	var r0 *dashboards.Dashboard
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, int64, string) (*dashboards.Dashboard, error)); ok {
		return rf(ctx, orgId, dashboardUid)
	}
	if rf, ok := ret.Get(0).(func(context.Context, int64, string) *dashboards.Dashboard); ok {
		r0 = rf(ctx, orgId, dashboardUid)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*dashboards.Dashboard)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, int64, string) error); ok {
		r1 = rf(ctx, orgId, dashboardUid)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// FindEnabledPublicDashboardAndDashboardByAccessToken provides a mock function with given fields: ctx, accessToken
func (_m *FakePublicDashboardService) FindEnabledPublicDashboardAndDashboardByAccessToken(ctx context.Context, accessToken string) (*models.PublicDashboard, *dashboards.Dashboard, error) {
	ret := _m.Called(ctx, accessToken)

	var r0 *models.PublicDashboard
	var r1 *dashboards.Dashboard
	var r2 error
	if rf, ok := ret.Get(0).(func(context.Context, string) (*models.PublicDashboard, *dashboards.Dashboard, error)); ok {
		return rf(ctx, accessToken)
	}
	if rf, ok := ret.Get(0).(func(context.Context, string) *models.PublicDashboard); ok {
		r0 = rf(ctx, accessToken)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.PublicDashboard)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, string) *dashboards.Dashboard); ok {
		r1 = rf(ctx, accessToken)
	} else {
		if ret.Get(1) != nil {
			r1 = ret.Get(1).(*dashboards.Dashboard)
		}
	}

	if rf, ok := ret.Get(2).(func(context.Context, string) error); ok {
		r2 = rf(ctx, accessToken)
	} else {
		r2 = ret.Error(2)
	}

	return r0, r1, r2
}

// FindPublicDashboardAndDashboardByAccessToken provides a mock function with given fields: ctx, accessToken
func (_m *FakePublicDashboardService) FindPublicDashboardAndDashboardByAccessToken(ctx context.Context, accessToken string) (*models.PublicDashboard, *dashboards.Dashboard, error) {
	ret := _m.Called(ctx, accessToken)

	var r0 *models.PublicDashboard
	var r1 *dashboards.Dashboard
	var r2 error
	if rf, ok := ret.Get(0).(func(context.Context, string) (*models.PublicDashboard, *dashboards.Dashboard, error)); ok {
		return rf(ctx, accessToken)
	}
	if rf, ok := ret.Get(0).(func(context.Context, string) *models.PublicDashboard); ok {
		r0 = rf(ctx, accessToken)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.PublicDashboard)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, string) *dashboards.Dashboard); ok {
		r1 = rf(ctx, accessToken)
	} else {
		if ret.Get(1) != nil {
			r1 = ret.Get(1).(*dashboards.Dashboard)
		}
	}

	if rf, ok := ret.Get(2).(func(context.Context, string) error); ok {
		r2 = rf(ctx, accessToken)
	} else {
		r2 = ret.Error(2)
	}

	return r0, r1, r2
}

// GetMetricRequest provides a mock function with given fields: ctx, dashboard, publicDashboard, panelId, reqDTO
func (_m *FakePublicDashboardService) GetMetricRequest(ctx context.Context, dashboard *dashboards.Dashboard, publicDashboard *models.PublicDashboard, panelId int64, reqDTO models.PublicDashboardQueryDTO) (dtos.MetricRequest, error) {
	ret := _m.Called(ctx, dashboard, publicDashboard, panelId, reqDTO)

	var r0 dtos.MetricRequest
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, *dashboards.Dashboard, *models.PublicDashboard, int64, models.PublicDashboardQueryDTO) (dtos.MetricRequest, error)); ok {
		return rf(ctx, dashboard, publicDashboard, panelId, reqDTO)
	}
	if rf, ok := ret.Get(0).(func(context.Context, *dashboards.Dashboard, *models.PublicDashboard, int64, models.PublicDashboardQueryDTO) dtos.MetricRequest); ok {
		r0 = rf(ctx, dashboard, publicDashboard, panelId, reqDTO)
	} else {
		r0 = ret.Get(0).(dtos.MetricRequest)
	}

	if rf, ok := ret.Get(1).(func(context.Context, *dashboards.Dashboard, *models.PublicDashboard, int64, models.PublicDashboardQueryDTO) error); ok {
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
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, string) (int64, error)); ok {
		return rf(ctx, accessToken)
	}
	if rf, ok := ret.Get(0).(func(context.Context, string) int64); ok {
		r0 = rf(ctx, accessToken)
	} else {
		r0 = ret.Get(0).(int64)
	}

	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, accessToken)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetPublicDashboardForView provides a mock function with given fields: ctx, accessToken
func (_m *FakePublicDashboardService) GetPublicDashboardForView(ctx context.Context, accessToken string) (*dtos.DashboardFullWithMeta, error) {
	ret := _m.Called(ctx, accessToken)

	var r0 *dtos.DashboardFullWithMeta
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, string) (*dtos.DashboardFullWithMeta, error)); ok {
		return rf(ctx, accessToken)
	}
	if rf, ok := ret.Get(0).(func(context.Context, string) *dtos.DashboardFullWithMeta); ok {
		r0 = rf(ctx, accessToken)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*dtos.DashboardFullWithMeta)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, accessToken)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetQueryDataResponse provides a mock function with given fields: ctx, skipDSCache, reqDTO, panelId, accessToken
func (_m *FakePublicDashboardService) GetQueryDataResponse(ctx context.Context, skipDSCache bool, reqDTO models.PublicDashboardQueryDTO, panelId int64, accessToken string) (*backend.QueryDataResponse, error) {
	ret := _m.Called(ctx, skipDSCache, reqDTO, panelId, accessToken)

	var r0 *backend.QueryDataResponse
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, bool, models.PublicDashboardQueryDTO, int64, string) (*backend.QueryDataResponse, error)); ok {
		return rf(ctx, skipDSCache, reqDTO, panelId, accessToken)
	}
	if rf, ok := ret.Get(0).(func(context.Context, bool, models.PublicDashboardQueryDTO, int64, string) *backend.QueryDataResponse); ok {
		r0 = rf(ctx, skipDSCache, reqDTO, panelId, accessToken)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*backend.QueryDataResponse)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, bool, models.PublicDashboardQueryDTO, int64, string) error); ok {
		r1 = rf(ctx, skipDSCache, reqDTO, panelId, accessToken)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// NewPublicDashboardAccessToken provides a mock function with given fields: ctx
func (_m *FakePublicDashboardService) NewPublicDashboardAccessToken(ctx context.Context) (string, error) {
	ret := _m.Called(ctx)

	var r0 string
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context) (string, error)); ok {
		return rf(ctx)
	}
	if rf, ok := ret.Get(0).(func(context.Context) string); ok {
		r0 = rf(ctx)
	} else {
		r0 = ret.Get(0).(string)
	}

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
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context) (string, error)); ok {
		return rf(ctx)
	}
	if rf, ok := ret.Get(0).(func(context.Context) string); ok {
		r0 = rf(ctx)
	} else {
		r0 = ret.Get(0).(string)
	}

	if rf, ok := ret.Get(1).(func(context.Context) error); ok {
		r1 = rf(ctx)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Update provides a mock function with given fields: ctx, u, dto
func (_m *FakePublicDashboardService) Update(ctx context.Context, u *user.SignedInUser, dto *models.SavePublicDashboardDTO) (*models.PublicDashboard, error) {
	ret := _m.Called(ctx, u, dto)

	var r0 *models.PublicDashboard
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, *user.SignedInUser, *models.SavePublicDashboardDTO) (*models.PublicDashboard, error)); ok {
		return rf(ctx, u, dto)
	}
	if rf, ok := ret.Get(0).(func(context.Context, *user.SignedInUser, *models.SavePublicDashboardDTO) *models.PublicDashboard); ok {
		r0 = rf(ctx, u, dto)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.PublicDashboard)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, *user.SignedInUser, *models.SavePublicDashboardDTO) error); ok {
		r1 = rf(ctx, u, dto)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// NewFakePublicDashboardService creates a new instance of FakePublicDashboardService. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewFakePublicDashboardService(t interface {
	mock.TestingT
	Cleanup(func())
}) *FakePublicDashboardService {
	mock := &FakePublicDashboardService{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
