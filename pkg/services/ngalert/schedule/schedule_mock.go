// Code generated by mockery v2.10.0. DO NOT EDIT.

package schedule

import (
	context "context"
	time "time"

	mock "github.com/stretchr/testify/mock"

	models "github.com/grafana/grafana/pkg/services/ngalert/models"
)

// FakeScheduleService is an autogenerated mock type for the ScheduleService type
type FakeScheduleService struct {
	mock.Mock
}

// DeleteAlertRule provides a mock function with given fields: keys
func (_m *FakeScheduleService) DeleteAlertRule(keys ...models.AlertRuleKey) {
	_m.Called(keys)
}

// Run provides a mock function with given fields: _a0
func (_m *FakeScheduleService) Run(_a0 context.Context) error {
	ret := _m.Called(_a0)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context) error); ok {
		r0 = rf(_a0)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// UpdateAlertRule provides a mock function with given fields: key, lastVersion
func (_m *FakeScheduleService) UpdateAlertRule(key models.AlertRuleKey, lastVersion int64, isPaused bool) {
	_m.Called(key, lastVersion, isPaused)
}

// evalApplied provides a mock function with given fields: _a0, _a1
func (_m *FakeScheduleService) evalApplied(_a0 models.AlertRuleKey, _a1 time.Time) {
	_m.Called(_a0, _a1)
}

// overrideCfg provides a mock function with given fields: cfg
func (_m *FakeScheduleService) overrideCfg(cfg SchedulerCfg) {
	_m.Called(cfg)
}

// stopApplied provides a mock function with given fields: _a0
func (_m *FakeScheduleService) stopApplied(_a0 models.AlertRuleKey) {
	_m.Called(_a0)
}
