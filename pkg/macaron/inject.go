// Copyright 2013 Jeremy Saenz
// Copyright 2015 The Macaron Authors
//
// Licensed under the Apache License, Version 2.0 (the "License"): you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

// Package inject provides utilities for mapping and injecting dependencies in various ways.
package macaron

import (
	"fmt"
	"reflect"
)

// Injector represents an interface for mapping and injecting dependencies into structs
// and function arguments.
type Injector interface {
	Invoker
	TypeMapper
	// SetParent sets the parent of the injector. If the injector cannot find a
	// dependency in its Type map it will check its parent before returning an
	// error.
	SetParent(Injector)
}

// Invoker represents an interface for calling functions via reflection.
type Invoker interface {
	// Invoke attempts to call the interface{} provided as a function,
	// providing dependencies for function arguments based on Type. Returns
	// a slice of reflect.Value representing the returned values of the function.
	// Returns an error if the injection fails.
	Invoke(interface{}) ([]reflect.Value, error)
}

// FastInvoker represents an interface in order to avoid the calling function via reflection.
//
// example:
//	type handlerFuncHandler func(http.ResponseWriter, *http.Request) error
//	func (f handlerFuncHandler)Invoke([]interface{}) ([]reflect.Value, error){
//		ret := f(p[0].(http.ResponseWriter), p[1].(*http.Request))
//		return []reflect.Value{reflect.ValueOf(ret)}, nil
//	}
//
//	type funcHandler func(int, string)
//	func (f funcHandler)Invoke([]interface{}) ([]reflect.Value, error){
//		f(p[0].(int), p[1].(string))
//		return nil, nil
//	}
type FastInvoker interface {
	// Invoke attempts to call the ordinary functions. If f is a function
	// with the appropriate signature, f.Invoke([]interface{}) is a Call that calls f.
	// Returns a slice of reflect.Value representing the returned values of the function.
	// Returns an error if the injection fails.
	Invoke([]interface{}) ([]reflect.Value, error)
}

// IsFastInvoker check interface is FastInvoker
func IsFastInvoker(h interface{}) bool {
	_, ok := h.(FastInvoker)
	return ok
}

// TypeMapper represents an interface for mapping interface{} values based on type.
type TypeMapper interface {
	// Maps the interface{} value based on its immediate type from reflect.TypeOf.
	Map(interface{}) TypeMapper
	// Maps the interface{} value based on the pointer of an Interface provided.
	// This is really only useful for mapping a value as an interface, as interfaces
	// cannot at this time be referenced directly without a pointer.
	MapTo(interface{}, interface{}) TypeMapper
	// Returns the Value that is mapped to the current type. Returns a zeroed Value if
	// the Type has not been mapped.
	GetVal(reflect.Type) reflect.Value
}

type injector struct {
	values map[reflect.Type]reflect.Value
	parent Injector
}

// InterfaceOf dereferences a pointer to an Interface type.
// It panics if value is not an pointer to an interface.
func InterfaceOf(value interface{}) reflect.Type {
	t := reflect.TypeOf(value)

	for t.Kind() == reflect.Ptr {
		t = t.Elem()
	}

	if t.Kind() != reflect.Interface {
		panic("Called inject.InterfaceOf with a value that is not a pointer to an interface. (*MyInterface)(nil)")
	}

	return t
}

// New returns a new Injector.
func NewInjector() Injector {
	return &injector{
		values: make(map[reflect.Type]reflect.Value),
	}
}

// Invoke attempts to call the interface{} provided as a function,
// providing dependencies for function arguments based on Type.
// Returns a slice of reflect.Value representing the returned values of the function.
// Returns an error if the injection fails.
// It panics if f is not a function
func (inj *injector) Invoke(f interface{}) ([]reflect.Value, error) {
	t := reflect.TypeOf(f)
	switch v := f.(type) {
	case FastInvoker:
		return inj.fastInvoke(v, t, t.NumIn())
	default:
		return inj.callInvoke(f, t, t.NumIn())
	}
}

func (inj *injector) fastInvoke(f FastInvoker, t reflect.Type, numIn int) ([]reflect.Value, error) {
	var in []interface{}
	if numIn > 0 {
		in = make([]interface{}, numIn) // Panic if t is not kind of Func
		var argType reflect.Type
		var val reflect.Value
		for i := 0; i < numIn; i++ {
			argType = t.In(i)
			val = inj.GetVal(argType)
			if !val.IsValid() {
				return nil, fmt.Errorf("Value not found for type %v", argType)
			}

			in[i] = val.Interface()
		}
	}
	return f.Invoke(in)
}

// callInvoke reflect.Value.Call
func (inj *injector) callInvoke(f interface{}, t reflect.Type, numIn int) ([]reflect.Value, error) {
	var in []reflect.Value
	if numIn > 0 {
		in = make([]reflect.Value, numIn)
		var argType reflect.Type
		var val reflect.Value
		for i := 0; i < numIn; i++ {
			argType = t.In(i)
			val = inj.GetVal(argType)
			if !val.IsValid() {
				return nil, fmt.Errorf("Value not found for type %v", argType)
			}

			in[i] = val
		}
	}
	return reflect.ValueOf(f).Call(in), nil
}

// Maps the concrete value of val to its dynamic type using reflect.TypeOf,
// It returns the TypeMapper registered in.
func (i *injector) Map(val interface{}) TypeMapper {
	i.values[reflect.TypeOf(val)] = reflect.ValueOf(val)
	return i
}

func (i *injector) MapTo(val interface{}, ifacePtr interface{}) TypeMapper {
	i.values[InterfaceOf(ifacePtr)] = reflect.ValueOf(val)
	return i
}

func (i *injector) GetVal(t reflect.Type) reflect.Value {
	val := i.values[t]

	if val.IsValid() {
		return val
	}

	// no concrete types found, try to find implementors
	// if t is an interface
	if t.Kind() == reflect.Interface {
		for k, v := range i.values {
			if k.Implements(t) {
				val = v
				break
			}
		}
	}

	// Still no type found, try to look it up on the parent
	if !val.IsValid() && i.parent != nil {
		val = i.parent.GetVal(t)
	}

	return val

}

func (i *injector) SetParent(parent Injector) {
	i.parent = parent
}
