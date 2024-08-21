// Code generated by mockery v2.43.1. DO NOT EDIT.

package mocks

import (
	reflect "reflect"

	mock "github.com/stretchr/testify/mock"

	sqltemplate "github.com/grafana/grafana/pkg/storage/unified/sql/sqltemplate"
)

// SQLTemplate is an autogenerated mock type for the SQLTemplate type
type SQLTemplate struct {
	mock.Mock
}

type SQLTemplate_Expecter struct {
	mock *mock.Mock
}

func (_m *SQLTemplate) EXPECT() *SQLTemplate_Expecter {
	return &SQLTemplate_Expecter{mock: &_m.Mock}
}

// Arg provides a mock function with given fields: x
func (_m *SQLTemplate) Arg(x interface{}) string {
	ret := _m.Called(x)

	if len(ret) == 0 {
		panic("no return value specified for Arg")
	}

	var r0 string
	if rf, ok := ret.Get(0).(func(interface{}) string); ok {
		r0 = rf(x)
	} else {
		r0 = ret.Get(0).(string)
	}

	return r0
}

// SQLTemplate_Arg_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Arg'
type SQLTemplate_Arg_Call struct {
	*mock.Call
}

// Arg is a helper method to define mock.On call
//   - x interface{}
func (_e *SQLTemplate_Expecter) Arg(x interface{}) *SQLTemplate_Arg_Call {
	return &SQLTemplate_Arg_Call{Call: _e.mock.On("Arg", x)}
}

func (_c *SQLTemplate_Arg_Call) Run(run func(x interface{})) *SQLTemplate_Arg_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(interface{}))
	})
	return _c
}

func (_c *SQLTemplate_Arg_Call) Return(_a0 string) *SQLTemplate_Arg_Call {
	_c.Call.Return(_a0)
	return _c
}

func (_c *SQLTemplate_Arg_Call) RunAndReturn(run func(interface{}) string) *SQLTemplate_Arg_Call {
	_c.Call.Return(run)
	return _c
}

// ArgList provides a mock function with given fields: slice
func (_m *SQLTemplate) ArgList(slice reflect.Value) (string, error) {
	ret := _m.Called(slice)

	if len(ret) == 0 {
		panic("no return value specified for ArgList")
	}

	var r0 string
	var r1 error
	if rf, ok := ret.Get(0).(func(reflect.Value) (string, error)); ok {
		return rf(slice)
	}
	if rf, ok := ret.Get(0).(func(reflect.Value) string); ok {
		r0 = rf(slice)
	} else {
		r0 = ret.Get(0).(string)
	}

	if rf, ok := ret.Get(1).(func(reflect.Value) error); ok {
		r1 = rf(slice)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// SQLTemplate_ArgList_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'ArgList'
type SQLTemplate_ArgList_Call struct {
	*mock.Call
}

// ArgList is a helper method to define mock.On call
//   - slice reflect.Value
func (_e *SQLTemplate_Expecter) ArgList(slice interface{}) *SQLTemplate_ArgList_Call {
	return &SQLTemplate_ArgList_Call{Call: _e.mock.On("ArgList", slice)}
}

func (_c *SQLTemplate_ArgList_Call) Run(run func(slice reflect.Value)) *SQLTemplate_ArgList_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(reflect.Value))
	})
	return _c
}

func (_c *SQLTemplate_ArgList_Call) Return(_a0 string, _a1 error) *SQLTemplate_ArgList_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *SQLTemplate_ArgList_Call) RunAndReturn(run func(reflect.Value) (string, error)) *SQLTemplate_ArgList_Call {
	_c.Call.Return(run)
	return _c
}

// ArgPlaceholder provides a mock function with given fields: argNum
func (_m *SQLTemplate) ArgPlaceholder(argNum int) string {
	ret := _m.Called(argNum)

	if len(ret) == 0 {
		panic("no return value specified for ArgPlaceholder")
	}

	var r0 string
	if rf, ok := ret.Get(0).(func(int) string); ok {
		r0 = rf(argNum)
	} else {
		r0 = ret.Get(0).(string)
	}

	return r0
}

// SQLTemplate_ArgPlaceholder_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'ArgPlaceholder'
type SQLTemplate_ArgPlaceholder_Call struct {
	*mock.Call
}

// ArgPlaceholder is a helper method to define mock.On call
//   - argNum int
func (_e *SQLTemplate_Expecter) ArgPlaceholder(argNum interface{}) *SQLTemplate_ArgPlaceholder_Call {
	return &SQLTemplate_ArgPlaceholder_Call{Call: _e.mock.On("ArgPlaceholder", argNum)}
}

func (_c *SQLTemplate_ArgPlaceholder_Call) Run(run func(argNum int)) *SQLTemplate_ArgPlaceholder_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(int))
	})
	return _c
}

func (_c *SQLTemplate_ArgPlaceholder_Call) Return(_a0 string) *SQLTemplate_ArgPlaceholder_Call {
	_c.Call.Return(_a0)
	return _c
}

func (_c *SQLTemplate_ArgPlaceholder_Call) RunAndReturn(run func(int) string) *SQLTemplate_ArgPlaceholder_Call {
	_c.Call.Return(run)
	return _c
}

// DialectName provides a mock function with given fields:
func (_m *SQLTemplate) DialectName() string {
	ret := _m.Called()

	if len(ret) == 0 {
		panic("no return value specified for DialectName")
	}

	var r0 string
	if rf, ok := ret.Get(0).(func() string); ok {
		r0 = rf()
	} else {
		r0 = ret.Get(0).(string)
	}

	return r0
}

// SQLTemplate_DialectName_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'DialectName'
type SQLTemplate_DialectName_Call struct {
	*mock.Call
}

// DialectName is a helper method to define mock.On call
func (_e *SQLTemplate_Expecter) DialectName() *SQLTemplate_DialectName_Call {
	return &SQLTemplate_DialectName_Call{Call: _e.mock.On("DialectName")}
}

func (_c *SQLTemplate_DialectName_Call) Run(run func()) *SQLTemplate_DialectName_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run()
	})
	return _c
}

func (_c *SQLTemplate_DialectName_Call) Return(_a0 string) *SQLTemplate_DialectName_Call {
	_c.Call.Return(_a0)
	return _c
}

func (_c *SQLTemplate_DialectName_Call) RunAndReturn(run func() string) *SQLTemplate_DialectName_Call {
	_c.Call.Return(run)
	return _c
}

// GetArgs provides a mock function with given fields:
func (_m *SQLTemplate) GetArgs() []interface{} {
	ret := _m.Called()

	if len(ret) == 0 {
		panic("no return value specified for GetArgs")
	}

	var r0 []interface{}
	if rf, ok := ret.Get(0).(func() []interface{}); ok {
		r0 = rf()
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]interface{})
		}
	}

	return r0
}

// SQLTemplate_GetArgs_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetArgs'
type SQLTemplate_GetArgs_Call struct {
	*mock.Call
}

// GetArgs is a helper method to define mock.On call
func (_e *SQLTemplate_Expecter) GetArgs() *SQLTemplate_GetArgs_Call {
	return &SQLTemplate_GetArgs_Call{Call: _e.mock.On("GetArgs")}
}

func (_c *SQLTemplate_GetArgs_Call) Run(run func()) *SQLTemplate_GetArgs_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run()
	})
	return _c
}

func (_c *SQLTemplate_GetArgs_Call) Return(_a0 []interface{}) *SQLTemplate_GetArgs_Call {
	_c.Call.Return(_a0)
	return _c
}

func (_c *SQLTemplate_GetArgs_Call) RunAndReturn(run func() []interface{}) *SQLTemplate_GetArgs_Call {
	_c.Call.Return(run)
	return _c
}

// GetColNames provides a mock function with given fields:
func (_m *SQLTemplate) GetColNames() []string {
	ret := _m.Called()

	if len(ret) == 0 {
		panic("no return value specified for GetColNames")
	}

	var r0 []string
	if rf, ok := ret.Get(0).(func() []string); ok {
		r0 = rf()
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]string)
		}
	}

	return r0
}

// SQLTemplate_GetColNames_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetColNames'
type SQLTemplate_GetColNames_Call struct {
	*mock.Call
}

// GetColNames is a helper method to define mock.On call
func (_e *SQLTemplate_Expecter) GetColNames() *SQLTemplate_GetColNames_Call {
	return &SQLTemplate_GetColNames_Call{Call: _e.mock.On("GetColNames")}
}

func (_c *SQLTemplate_GetColNames_Call) Run(run func()) *SQLTemplate_GetColNames_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run()
	})
	return _c
}

func (_c *SQLTemplate_GetColNames_Call) Return(_a0 []string) *SQLTemplate_GetColNames_Call {
	_c.Call.Return(_a0)
	return _c
}

func (_c *SQLTemplate_GetColNames_Call) RunAndReturn(run func() []string) *SQLTemplate_GetColNames_Call {
	_c.Call.Return(run)
	return _c
}

// GetScanDest provides a mock function with given fields:
func (_m *SQLTemplate) GetScanDest() []interface{} {
	ret := _m.Called()

	if len(ret) == 0 {
		panic("no return value specified for GetScanDest")
	}

	var r0 []interface{}
	if rf, ok := ret.Get(0).(func() []interface{}); ok {
		r0 = rf()
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]interface{})
		}
	}

	return r0
}

// SQLTemplate_GetScanDest_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetScanDest'
type SQLTemplate_GetScanDest_Call struct {
	*mock.Call
}

// GetScanDest is a helper method to define mock.On call
func (_e *SQLTemplate_Expecter) GetScanDest() *SQLTemplate_GetScanDest_Call {
	return &SQLTemplate_GetScanDest_Call{Call: _e.mock.On("GetScanDest")}
}

func (_c *SQLTemplate_GetScanDest_Call) Run(run func()) *SQLTemplate_GetScanDest_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run()
	})
	return _c
}

func (_c *SQLTemplate_GetScanDest_Call) Return(_a0 []interface{}) *SQLTemplate_GetScanDest_Call {
	_c.Call.Return(_a0)
	return _c
}

func (_c *SQLTemplate_GetScanDest_Call) RunAndReturn(run func() []interface{}) *SQLTemplate_GetScanDest_Call {
	_c.Call.Return(run)
	return _c
}

// Ident provides a mock function with given fields: _a0
func (_m *SQLTemplate) Ident(_a0 string) (string, error) {
	ret := _m.Called(_a0)

	if len(ret) == 0 {
		panic("no return value specified for Ident")
	}

	var r0 string
	var r1 error
	if rf, ok := ret.Get(0).(func(string) (string, error)); ok {
		return rf(_a0)
	}
	if rf, ok := ret.Get(0).(func(string) string); ok {
		r0 = rf(_a0)
	} else {
		r0 = ret.Get(0).(string)
	}

	if rf, ok := ret.Get(1).(func(string) error); ok {
		r1 = rf(_a0)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// SQLTemplate_Ident_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Ident'
type SQLTemplate_Ident_Call struct {
	*mock.Call
}

// Ident is a helper method to define mock.On call
//   - _a0 string
func (_e *SQLTemplate_Expecter) Ident(_a0 interface{}) *SQLTemplate_Ident_Call {
	return &SQLTemplate_Ident_Call{Call: _e.mock.On("Ident", _a0)}
}

func (_c *SQLTemplate_Ident_Call) Run(run func(_a0 string)) *SQLTemplate_Ident_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(string))
	})
	return _c
}

func (_c *SQLTemplate_Ident_Call) Return(_a0 string, _a1 error) *SQLTemplate_Ident_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *SQLTemplate_Ident_Call) RunAndReturn(run func(string) (string, error)) *SQLTemplate_Ident_Call {
	_c.Call.Return(run)
	return _c
}

// Into provides a mock function with given fields: v, colName
func (_m *SQLTemplate) Into(v reflect.Value, colName string) (string, error) {
	ret := _m.Called(v, colName)

	if len(ret) == 0 {
		panic("no return value specified for Into")
	}

	var r0 string
	var r1 error
	if rf, ok := ret.Get(0).(func(reflect.Value, string) (string, error)); ok {
		return rf(v, colName)
	}
	if rf, ok := ret.Get(0).(func(reflect.Value, string) string); ok {
		r0 = rf(v, colName)
	} else {
		r0 = ret.Get(0).(string)
	}

	if rf, ok := ret.Get(1).(func(reflect.Value, string) error); ok {
		r1 = rf(v, colName)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// SQLTemplate_Into_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Into'
type SQLTemplate_Into_Call struct {
	*mock.Call
}

// Into is a helper method to define mock.On call
//   - v reflect.Value
//   - colName string
func (_e *SQLTemplate_Expecter) Into(v interface{}, colName interface{}) *SQLTemplate_Into_Call {
	return &SQLTemplate_Into_Call{Call: _e.mock.On("Into", v, colName)}
}

func (_c *SQLTemplate_Into_Call) Run(run func(v reflect.Value, colName string)) *SQLTemplate_Into_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(reflect.Value), args[1].(string))
	})
	return _c
}

func (_c *SQLTemplate_Into_Call) Return(_a0 string, _a1 error) *SQLTemplate_Into_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *SQLTemplate_Into_Call) RunAndReturn(run func(reflect.Value, string) (string, error)) *SQLTemplate_Into_Call {
	_c.Call.Return(run)
	return _c
}

// Reset provides a mock function with given fields:
func (_m *SQLTemplate) Reset() {
	_m.Called()
}

// SQLTemplate_Reset_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Reset'
type SQLTemplate_Reset_Call struct {
	*mock.Call
}

// Reset is a helper method to define mock.On call
func (_e *SQLTemplate_Expecter) Reset() *SQLTemplate_Reset_Call {
	return &SQLTemplate_Reset_Call{Call: _e.mock.On("Reset")}
}

func (_c *SQLTemplate_Reset_Call) Run(run func()) *SQLTemplate_Reset_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run()
	})
	return _c
}

func (_c *SQLTemplate_Reset_Call) Return() *SQLTemplate_Reset_Call {
	_c.Call.Return()
	return _c
}

func (_c *SQLTemplate_Reset_Call) RunAndReturn(run func()) *SQLTemplate_Reset_Call {
	_c.Call.Return(run)
	return _c
}

// SelectFor provides a mock function with given fields: _a0
func (_m *SQLTemplate) SelectFor(_a0 ...string) (string, error) {
	_va := make([]interface{}, len(_a0))
	for _i := range _a0 {
		_va[_i] = _a0[_i]
	}
	var _ca []interface{}
	_ca = append(_ca, _va...)
	ret := _m.Called(_ca...)

	if len(ret) == 0 {
		panic("no return value specified for SelectFor")
	}

	var r0 string
	var r1 error
	if rf, ok := ret.Get(0).(func(...string) (string, error)); ok {
		return rf(_a0...)
	}
	if rf, ok := ret.Get(0).(func(...string) string); ok {
		r0 = rf(_a0...)
	} else {
		r0 = ret.Get(0).(string)
	}

	if rf, ok := ret.Get(1).(func(...string) error); ok {
		r1 = rf(_a0...)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// SQLTemplate_SelectFor_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'SelectFor'
type SQLTemplate_SelectFor_Call struct {
	*mock.Call
}

// SelectFor is a helper method to define mock.On call
//   - _a0 ...string
func (_e *SQLTemplate_Expecter) SelectFor(_a0 ...interface{}) *SQLTemplate_SelectFor_Call {
	return &SQLTemplate_SelectFor_Call{Call: _e.mock.On("SelectFor",
		append([]interface{}{}, _a0...)...)}
}

func (_c *SQLTemplate_SelectFor_Call) Run(run func(_a0 ...string)) *SQLTemplate_SelectFor_Call {
	_c.Call.Run(func(args mock.Arguments) {
		variadicArgs := make([]string, len(args)-0)
		for i, a := range args[0:] {
			if a != nil {
				variadicArgs[i] = a.(string)
			}
		}
		run(variadicArgs...)
	})
	return _c
}

func (_c *SQLTemplate_SelectFor_Call) Return(_a0 string, _a1 error) *SQLTemplate_SelectFor_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *SQLTemplate_SelectFor_Call) RunAndReturn(run func(...string) (string, error)) *SQLTemplate_SelectFor_Call {
	_c.Call.Return(run)
	return _c
}

// SetDialect provides a mock function with given fields: _a0
func (_m *SQLTemplate) SetDialect(_a0 sqltemplate.Dialect) {
	_m.Called(_a0)
}

// SQLTemplate_SetDialect_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'SetDialect'
type SQLTemplate_SetDialect_Call struct {
	*mock.Call
}

// SetDialect is a helper method to define mock.On call
//   - _a0 sqltemplate.Dialect
func (_e *SQLTemplate_Expecter) SetDialect(_a0 interface{}) *SQLTemplate_SetDialect_Call {
	return &SQLTemplate_SetDialect_Call{Call: _e.mock.On("SetDialect", _a0)}
}

func (_c *SQLTemplate_SetDialect_Call) Run(run func(_a0 sqltemplate.Dialect)) *SQLTemplate_SetDialect_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(sqltemplate.Dialect))
	})
	return _c
}

func (_c *SQLTemplate_SetDialect_Call) Return() *SQLTemplate_SetDialect_Call {
	_c.Call.Return()
	return _c
}

func (_c *SQLTemplate_SetDialect_Call) RunAndReturn(run func(sqltemplate.Dialect)) *SQLTemplate_SetDialect_Call {
	_c.Call.Return(run)
	return _c
}

// Validate provides a mock function with given fields:
func (_m *SQLTemplate) Validate() error {
	ret := _m.Called()

	if len(ret) == 0 {
		panic("no return value specified for Validate")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func() error); ok {
		r0 = rf()
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// SQLTemplate_Validate_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Validate'
type SQLTemplate_Validate_Call struct {
	*mock.Call
}

// Validate is a helper method to define mock.On call
func (_e *SQLTemplate_Expecter) Validate() *SQLTemplate_Validate_Call {
	return &SQLTemplate_Validate_Call{Call: _e.mock.On("Validate")}
}

func (_c *SQLTemplate_Validate_Call) Run(run func()) *SQLTemplate_Validate_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run()
	})
	return _c
}

func (_c *SQLTemplate_Validate_Call) Return(_a0 error) *SQLTemplate_Validate_Call {
	_c.Call.Return(_a0)
	return _c
}

func (_c *SQLTemplate_Validate_Call) RunAndReturn(run func() error) *SQLTemplate_Validate_Call {
	_c.Call.Return(run)
	return _c
}

// NewSQLTemplate creates a new instance of SQLTemplate. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewSQLTemplate(t interface {
	mock.TestingT
	Cleanup(func())
}) *SQLTemplate {
	mock := &SQLTemplate{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
