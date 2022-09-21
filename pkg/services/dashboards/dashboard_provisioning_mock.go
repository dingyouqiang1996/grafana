// Code generated by mockery v2.12.1. DO NOT EDIT.

package dashboards

import (
	context "context"

	models "github.com/grafana/grafana/pkg/models"
	mock "github.com/stretchr/testify/mock"

	testing "testing"
)

// FakeDashboardProvisioning is an autogenerated mock type for the DashboardProvisioningService type
type FakeDashboardProvisioning struct {
	mock.Mock
}

// DeleteOrphanedProvisionedDashboards provides a mock function with given fields: ctx, cmd
func (_m *FakeDashboardProvisioning) DeleteOrphanedProvisionedDashboards(ctx context.Context, cmd *models.DeleteOrphanedProvisionedDashboardsCommand) error {
	ret := _m.Called(ctx, cmd)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, *models.DeleteOrphanedProvisionedDashboardsCommand) error); ok {
		r0 = rf(ctx, cmd)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// DeleteProvisionedDashboard provides a mock function with given fields: ctx, dashboardID, orgID
func (_m *FakeDashboardProvisioning) DeleteProvisionedDashboard(ctx context.Context, dashboardID int64, orgID int64) error {
	ret := _m.Called(ctx, dashboardID, orgID)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, int64, int64) error); ok {
		r0 = rf(ctx, dashboardID, orgID)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// GetProvisionedDashboardData provides a mock function with given fields: name
func (_m *FakeDashboardProvisioning) GetProvisionedDashboardData(ctx context.Context, name string) ([]*models.DashboardProvisioning, error) {
	ret := _m.Called(name)

	var r0 []*models.DashboardProvisioning
	if rf, ok := ret.Get(0).(func(string) []*models.DashboardProvisioning); ok {
		r0 = rf(name)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]*models.DashboardProvisioning)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(string) error); ok {
		r1 = rf(name)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetProvisionedDashboardDataByDashboardID provides a mock function with given fields: dashboardID
func (_m *FakeDashboardProvisioning) GetProvisionedDashboardDataByDashboardID(ctx context.Context, dashboardID int64) (*models.DashboardProvisioning, error) {
	ret := _m.Called(dashboardID)

	var r0 *models.DashboardProvisioning
	if rf, ok := ret.Get(0).(func(int64) *models.DashboardProvisioning); ok {
		r0 = rf(dashboardID)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.DashboardProvisioning)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(int64) error); ok {
		r1 = rf(dashboardID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetProvisionedDashboardDataByDashboardUID provides a mock function with given fields: orgID, dashboardUID
func (_m *FakeDashboardProvisioning) GetProvisionedDashboardDataByDashboardUID(ctx context.Context, orgID int64, dashboardUID string) (*models.DashboardProvisioning, error) {
	ret := _m.Called(orgID, dashboardUID)

	var r0 *models.DashboardProvisioning
	if rf, ok := ret.Get(0).(func(int64, string) *models.DashboardProvisioning); ok {
		r0 = rf(orgID, dashboardUID)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.DashboardProvisioning)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(int64, string) error); ok {
		r1 = rf(orgID, dashboardUID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// SaveFolderForProvisionedDashboards provides a mock function with given fields: _a0, _a1
func (_m *FakeDashboardProvisioning) SaveFolderForProvisionedDashboards(_a0 context.Context, _a1 *SaveDashboardDTO) (*models.Dashboard, error) {
	ret := _m.Called(_a0, _a1)

	var r0 *models.Dashboard
	if rf, ok := ret.Get(0).(func(context.Context, *SaveDashboardDTO) *models.Dashboard); ok {
		r0 = rf(_a0, _a1)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.Dashboard)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, *SaveDashboardDTO) error); ok {
		r1 = rf(_a0, _a1)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// SaveProvisionedDashboard provides a mock function with given fields: ctx, dto, provisioning
func (_m *FakeDashboardProvisioning) SaveProvisionedDashboard(ctx context.Context, dto *SaveDashboardDTO, provisioning *models.DashboardProvisioning) (*models.Dashboard, error) {
	ret := _m.Called(ctx, dto, provisioning)

	var r0 *models.Dashboard
	if rf, ok := ret.Get(0).(func(context.Context, *SaveDashboardDTO, *models.DashboardProvisioning) *models.Dashboard); ok {
		r0 = rf(ctx, dto, provisioning)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.Dashboard)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, *SaveDashboardDTO, *models.DashboardProvisioning) error); ok {
		r1 = rf(ctx, dto, provisioning)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// UnprovisionDashboard provides a mock function with given fields: ctx, dashboardID
func (_m *FakeDashboardProvisioning) UnprovisionDashboard(ctx context.Context, dashboardID int64) error {
	ret := _m.Called(ctx, dashboardID)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, int64) error); ok {
		r0 = rf(ctx, dashboardID)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// NewFakeDashboardProvisioning creates a new instance of FakeDashboardProvisioning. It also registers the testing.TB interface on the mock and a cleanup function to assert the mocks expectations.
func NewFakeDashboardProvisioning(t testing.TB) *FakeDashboardProvisioning {
	mock := &FakeDashboardProvisioning{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
