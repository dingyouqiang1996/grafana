// This file was automatically generated by genny.
// Any changes will be lost if this file is regenerated.
// see https://github.com/cheekybits/genny

package data

import "time"

//go:Uint8erate uint8ny -in=$GOFILE -out=nullable_vector.Uint8.go uint8 "Uint8=uint8,uint16,uint32,uint64,int8,int16,int32,int64,float32,float64,string,bool,time.Time"

type nullableUint8Vector []*uint8

func newNullableUint8Vector(n int) *nullableUint8Vector {
	v := nullableUint8Vector(make([]*uint8, n))
	return &v
}

func (v *nullableUint8Vector) Set(idx int, i interface{}) {
	if i == nil {
		(*v)[idx] = nil
		return
	}
	(*v)[idx] = i.(*uint8)
}

func (v *nullableUint8Vector) SetConcreteAt(idx int, i interface{}) {
	val := i.(uint8)
	(*v)[idx] = &val
}

func (v *nullableUint8Vector) Append(i interface{}) {
	if i == nil {
		(*v) = append((*v), nil)
		return
	}
	(*v) = append((*v), i.(*uint8))
}

func (v *nullableUint8Vector) At(i int) interface{} {
	return (*v)[i]
}

func (v *nullableUint8Vector) CopyAt(i int) interface{} {
	if (*v)[i] == nil {
		var g *uint8
		return g
	}
	var g uint8
	g = *(*v)[i]
	return &g
}

func (v *nullableUint8Vector) ConcreteAt(i int) (interface{}, bool) {
	var g uint8
	val := (*v)[i]
	if val == nil {
		return g, false
	}
	g = *val
	return g, true
}

func (v *nullableUint8Vector) PointerAt(i int) interface{} {
	return &(*v)[i]
}

func (v *nullableUint8Vector) Len() int {
	return len((*v))
}

func (v *nullableUint8Vector) Type() FieldType {
	return vectorFieldType(v)
}

func (v *nullableUint8Vector) Extend(i int) {
	(*v) = append((*v), make([]*uint8, i)...)
}

//go:Uint16erate uint16ny -in=$GOFILE -out=nullable_vector.Uint16.go uint16 "Uint16=uint8,uint16,uint32,uint64,int8,int16,int32,int64,float32,float64,string,bool,time.Time"

type nullableUint16Vector []*uint16

func newNullableUint16Vector(n int) *nullableUint16Vector {
	v := nullableUint16Vector(make([]*uint16, n))
	return &v
}

func (v *nullableUint16Vector) Set(idx int, i interface{}) {
	if i == nil {
		(*v)[idx] = nil
		return
	}
	(*v)[idx] = i.(*uint16)
}

func (v *nullableUint16Vector) SetConcreteAt(idx int, i interface{}) {
	val := i.(uint16)
	(*v)[idx] = &val
}

func (v *nullableUint16Vector) Append(i interface{}) {
	if i == nil {
		(*v) = append((*v), nil)
		return
	}
	(*v) = append((*v), i.(*uint16))
}

func (v *nullableUint16Vector) At(i int) interface{} {
	return (*v)[i]
}

func (v *nullableUint16Vector) CopyAt(i int) interface{} {
	if (*v)[i] == nil {
		var g *uint16
		return g
	}
	var g uint16
	g = *(*v)[i]
	return &g
}

func (v *nullableUint16Vector) ConcreteAt(i int) (interface{}, bool) {
	var g uint16
	val := (*v)[i]
	if val == nil {
		return g, false
	}
	g = *val
	return g, true
}

func (v *nullableUint16Vector) PointerAt(i int) interface{} {
	return &(*v)[i]
}

func (v *nullableUint16Vector) Len() int {
	return len((*v))
}

func (v *nullableUint16Vector) Type() FieldType {
	return vectorFieldType(v)
}

func (v *nullableUint16Vector) Extend(i int) {
	(*v) = append((*v), make([]*uint16, i)...)
}

//go:Uint32erate uint32ny -in=$GOFILE -out=nullable_vector.Uint32.go uint32 "Uint32=uint8,uint16,uint32,uint64,int8,int16,int32,int64,float32,float64,string,bool,time.Time"

type nullableUint32Vector []*uint32

func newNullableUint32Vector(n int) *nullableUint32Vector {
	v := nullableUint32Vector(make([]*uint32, n))
	return &v
}

func (v *nullableUint32Vector) Set(idx int, i interface{}) {
	if i == nil {
		(*v)[idx] = nil
		return
	}
	(*v)[idx] = i.(*uint32)
}

func (v *nullableUint32Vector) SetConcreteAt(idx int, i interface{}) {
	val := i.(uint32)
	(*v)[idx] = &val
}

func (v *nullableUint32Vector) Append(i interface{}) {
	if i == nil {
		(*v) = append((*v), nil)
		return
	}
	(*v) = append((*v), i.(*uint32))
}

func (v *nullableUint32Vector) At(i int) interface{} {
	return (*v)[i]
}

func (v *nullableUint32Vector) CopyAt(i int) interface{} {
	if (*v)[i] == nil {
		var g *uint32
		return g
	}
	var g uint32
	g = *(*v)[i]
	return &g
}

func (v *nullableUint32Vector) ConcreteAt(i int) (interface{}, bool) {
	var g uint32
	val := (*v)[i]
	if val == nil {
		return g, false
	}
	g = *val
	return g, true
}

func (v *nullableUint32Vector) PointerAt(i int) interface{} {
	return &(*v)[i]
}

func (v *nullableUint32Vector) Len() int {
	return len((*v))
}

func (v *nullableUint32Vector) Type() FieldType {
	return vectorFieldType(v)
}

func (v *nullableUint32Vector) Extend(i int) {
	(*v) = append((*v), make([]*uint32, i)...)
}

//go:Uint64erate uint64ny -in=$GOFILE -out=nullable_vector.Uint64.go uint64 "Uint64=uint8,uint16,uint32,uint64,int8,int16,int32,int64,float32,float64,string,bool,time.Time"

type nullableUint64Vector []*uint64

func newNullableUint64Vector(n int) *nullableUint64Vector {
	v := nullableUint64Vector(make([]*uint64, n))
	return &v
}

func (v *nullableUint64Vector) Set(idx int, i interface{}) {
	if i == nil {
		(*v)[idx] = nil
		return
	}
	(*v)[idx] = i.(*uint64)
}

func (v *nullableUint64Vector) SetConcreteAt(idx int, i interface{}) {
	val := i.(uint64)
	(*v)[idx] = &val
}

func (v *nullableUint64Vector) Append(i interface{}) {
	if i == nil {
		(*v) = append((*v), nil)
		return
	}
	(*v) = append((*v), i.(*uint64))
}

func (v *nullableUint64Vector) At(i int) interface{} {
	return (*v)[i]
}

func (v *nullableUint64Vector) CopyAt(i int) interface{} {
	if (*v)[i] == nil {
		var g *uint64
		return g
	}
	var g uint64
	g = *(*v)[i]
	return &g
}

func (v *nullableUint64Vector) ConcreteAt(i int) (interface{}, bool) {
	var g uint64
	val := (*v)[i]
	if val == nil {
		return g, false
	}
	g = *val
	return g, true
}

func (v *nullableUint64Vector) PointerAt(i int) interface{} {
	return &(*v)[i]
}

func (v *nullableUint64Vector) Len() int {
	return len((*v))
}

func (v *nullableUint64Vector) Type() FieldType {
	return vectorFieldType(v)
}

func (v *nullableUint64Vector) Extend(i int) {
	(*v) = append((*v), make([]*uint64, i)...)
}

//go:Int8erate int8ny -in=$GOFILE -out=nullable_vector.Int8.go int8 "Int8=uint8,uint16,uint32,uint64,int8,int16,int32,int64,float32,float64,string,bool,time.Time"

type nullableInt8Vector []*int8

func newNullableInt8Vector(n int) *nullableInt8Vector {
	v := nullableInt8Vector(make([]*int8, n))
	return &v
}

func (v *nullableInt8Vector) Set(idx int, i interface{}) {
	if i == nil {
		(*v)[idx] = nil
		return
	}
	(*v)[idx] = i.(*int8)
}

func (v *nullableInt8Vector) SetConcreteAt(idx int, i interface{}) {
	val := i.(int8)
	(*v)[idx] = &val
}

func (v *nullableInt8Vector) Append(i interface{}) {
	if i == nil {
		(*v) = append((*v), nil)
		return
	}
	(*v) = append((*v), i.(*int8))
}

func (v *nullableInt8Vector) At(i int) interface{} {
	return (*v)[i]
}

func (v *nullableInt8Vector) CopyAt(i int) interface{} {
	if (*v)[i] == nil {
		var g *int8
		return g
	}
	var g int8
	g = *(*v)[i]
	return &g
}

func (v *nullableInt8Vector) ConcreteAt(i int) (interface{}, bool) {
	var g int8
	val := (*v)[i]
	if val == nil {
		return g, false
	}
	g = *val
	return g, true
}

func (v *nullableInt8Vector) PointerAt(i int) interface{} {
	return &(*v)[i]
}

func (v *nullableInt8Vector) Len() int {
	return len((*v))
}

func (v *nullableInt8Vector) Type() FieldType {
	return vectorFieldType(v)
}

func (v *nullableInt8Vector) Extend(i int) {
	(*v) = append((*v), make([]*int8, i)...)
}

//go:Int16erate int16ny -in=$GOFILE -out=nullable_vector.Int16.go int16 "Int16=uint8,uint16,uint32,uint64,int8,int16,int32,int64,float32,float64,string,bool,time.Time"

type nullableInt16Vector []*int16

func newNullableInt16Vector(n int) *nullableInt16Vector {
	v := nullableInt16Vector(make([]*int16, n))
	return &v
}

func (v *nullableInt16Vector) Set(idx int, i interface{}) {
	if i == nil {
		(*v)[idx] = nil
		return
	}
	(*v)[idx] = i.(*int16)
}

func (v *nullableInt16Vector) SetConcreteAt(idx int, i interface{}) {
	val := i.(int16)
	(*v)[idx] = &val
}

func (v *nullableInt16Vector) Append(i interface{}) {
	if i == nil {
		(*v) = append((*v), nil)
		return
	}
	(*v) = append((*v), i.(*int16))
}

func (v *nullableInt16Vector) At(i int) interface{} {
	return (*v)[i]
}

func (v *nullableInt16Vector) CopyAt(i int) interface{} {
	if (*v)[i] == nil {
		var g *int16
		return g
	}
	var g int16
	g = *(*v)[i]
	return &g
}

func (v *nullableInt16Vector) ConcreteAt(i int) (interface{}, bool) {
	var g int16
	val := (*v)[i]
	if val == nil {
		return g, false
	}
	g = *val
	return g, true
}

func (v *nullableInt16Vector) PointerAt(i int) interface{} {
	return &(*v)[i]
}

func (v *nullableInt16Vector) Len() int {
	return len((*v))
}

func (v *nullableInt16Vector) Type() FieldType {
	return vectorFieldType(v)
}

func (v *nullableInt16Vector) Extend(i int) {
	(*v) = append((*v), make([]*int16, i)...)
}

//go:Int32erate int32ny -in=$GOFILE -out=nullable_vector.Int32.go int32 "Int32=uint8,uint16,uint32,uint64,int8,int16,int32,int64,float32,float64,string,bool,time.Time"

type nullableInt32Vector []*int32

func newNullableInt32Vector(n int) *nullableInt32Vector {
	v := nullableInt32Vector(make([]*int32, n))
	return &v
}

func (v *nullableInt32Vector) Set(idx int, i interface{}) {
	if i == nil {
		(*v)[idx] = nil
		return
	}
	(*v)[idx] = i.(*int32)
}

func (v *nullableInt32Vector) SetConcreteAt(idx int, i interface{}) {
	val := i.(int32)
	(*v)[idx] = &val
}

func (v *nullableInt32Vector) Append(i interface{}) {
	if i == nil {
		(*v) = append((*v), nil)
		return
	}
	(*v) = append((*v), i.(*int32))
}

func (v *nullableInt32Vector) At(i int) interface{} {
	return (*v)[i]
}

func (v *nullableInt32Vector) CopyAt(i int) interface{} {
	if (*v)[i] == nil {
		var g *int32
		return g
	}
	var g int32
	g = *(*v)[i]
	return &g
}

func (v *nullableInt32Vector) ConcreteAt(i int) (interface{}, bool) {
	var g int32
	val := (*v)[i]
	if val == nil {
		return g, false
	}
	g = *val
	return g, true
}

func (v *nullableInt32Vector) PointerAt(i int) interface{} {
	return &(*v)[i]
}

func (v *nullableInt32Vector) Len() int {
	return len((*v))
}

func (v *nullableInt32Vector) Type() FieldType {
	return vectorFieldType(v)
}

func (v *nullableInt32Vector) Extend(i int) {
	(*v) = append((*v), make([]*int32, i)...)
}

//go:Int64erate int64ny -in=$GOFILE -out=nullable_vector.Int64.go int64 "Int64=uint8,uint16,uint32,uint64,int8,int16,int32,int64,float32,float64,string,bool,time.Time"

type nullableInt64Vector []*int64

func newNullableInt64Vector(n int) *nullableInt64Vector {
	v := nullableInt64Vector(make([]*int64, n))
	return &v
}

func (v *nullableInt64Vector) Set(idx int, i interface{}) {
	if i == nil {
		(*v)[idx] = nil
		return
	}
	(*v)[idx] = i.(*int64)
}

func (v *nullableInt64Vector) SetConcreteAt(idx int, i interface{}) {
	val := i.(int64)
	(*v)[idx] = &val
}

func (v *nullableInt64Vector) Append(i interface{}) {
	if i == nil {
		(*v) = append((*v), nil)
		return
	}
	(*v) = append((*v), i.(*int64))
}

func (v *nullableInt64Vector) At(i int) interface{} {
	return (*v)[i]
}

func (v *nullableInt64Vector) CopyAt(i int) interface{} {
	if (*v)[i] == nil {
		var g *int64
		return g
	}
	var g int64
	g = *(*v)[i]
	return &g
}

func (v *nullableInt64Vector) ConcreteAt(i int) (interface{}, bool) {
	var g int64
	val := (*v)[i]
	if val == nil {
		return g, false
	}
	g = *val
	return g, true
}

func (v *nullableInt64Vector) PointerAt(i int) interface{} {
	return &(*v)[i]
}

func (v *nullableInt64Vector) Len() int {
	return len((*v))
}

func (v *nullableInt64Vector) Type() FieldType {
	return vectorFieldType(v)
}

func (v *nullableInt64Vector) Extend(i int) {
	(*v) = append((*v), make([]*int64, i)...)
}

//go:Float32erate float32ny -in=$GOFILE -out=nullable_vector.Float32.go float32 "Float32=uint8,uint16,uint32,uint64,int8,int16,int32,int64,float32,float64,string,bool,time.Time"

type nullableFloat32Vector []*float32

func newNullableFloat32Vector(n int) *nullableFloat32Vector {
	v := nullableFloat32Vector(make([]*float32, n))
	return &v
}

func (v *nullableFloat32Vector) Set(idx int, i interface{}) {
	if i == nil {
		(*v)[idx] = nil
		return
	}
	(*v)[idx] = i.(*float32)
}

func (v *nullableFloat32Vector) SetConcreteAt(idx int, i interface{}) {
	val := i.(float32)
	(*v)[idx] = &val
}

func (v *nullableFloat32Vector) Append(i interface{}) {
	if i == nil {
		(*v) = append((*v), nil)
		return
	}
	(*v) = append((*v), i.(*float32))
}

func (v *nullableFloat32Vector) At(i int) interface{} {
	return (*v)[i]
}

func (v *nullableFloat32Vector) CopyAt(i int) interface{} {
	if (*v)[i] == nil {
		var g *float32
		return g
	}
	var g float32
	g = *(*v)[i]
	return &g
}

func (v *nullableFloat32Vector) ConcreteAt(i int) (interface{}, bool) {
	var g float32
	val := (*v)[i]
	if val == nil {
		return g, false
	}
	g = *val
	return g, true
}

func (v *nullableFloat32Vector) PointerAt(i int) interface{} {
	return &(*v)[i]
}

func (v *nullableFloat32Vector) Len() int {
	return len((*v))
}

func (v *nullableFloat32Vector) Type() FieldType {
	return vectorFieldType(v)
}

func (v *nullableFloat32Vector) Extend(i int) {
	(*v) = append((*v), make([]*float32, i)...)
}

//go:Float64erate float64ny -in=$GOFILE -out=nullable_vector.Float64.go float64 "Float64=uint8,uint16,uint32,uint64,int8,int16,int32,int64,float32,float64,string,bool,time.Time"

type nullableFloat64Vector []*float64

func newNullableFloat64Vector(n int) *nullableFloat64Vector {
	v := nullableFloat64Vector(make([]*float64, n))
	return &v
}

func (v *nullableFloat64Vector) Set(idx int, i interface{}) {
	if i == nil {
		(*v)[idx] = nil
		return
	}
	(*v)[idx] = i.(*float64)
}

func (v *nullableFloat64Vector) SetConcreteAt(idx int, i interface{}) {
	val := i.(float64)
	(*v)[idx] = &val
}

func (v *nullableFloat64Vector) Append(i interface{}) {
	if i == nil {
		(*v) = append((*v), nil)
		return
	}
	(*v) = append((*v), i.(*float64))
}

func (v *nullableFloat64Vector) At(i int) interface{} {
	return (*v)[i]
}

func (v *nullableFloat64Vector) CopyAt(i int) interface{} {
	if (*v)[i] == nil {
		var g *float64
		return g
	}
	var g float64
	g = *(*v)[i]
	return &g
}

func (v *nullableFloat64Vector) ConcreteAt(i int) (interface{}, bool) {
	var g float64
	val := (*v)[i]
	if val == nil {
		return g, false
	}
	g = *val
	return g, true
}

func (v *nullableFloat64Vector) PointerAt(i int) interface{} {
	return &(*v)[i]
}

func (v *nullableFloat64Vector) Len() int {
	return len((*v))
}

func (v *nullableFloat64Vector) Type() FieldType {
	return vectorFieldType(v)
}

func (v *nullableFloat64Vector) Extend(i int) {
	(*v) = append((*v), make([]*float64, i)...)
}

//go:Stringerate stringny -in=$GOFILE -out=nullable_vector.String.go string "String=uint8,uint16,uint32,uint64,int8,int16,int32,int64,float32,float64,string,bool,time.Time"

type nullableStringVector []*string

func newNullableStringVector(n int) *nullableStringVector {
	v := nullableStringVector(make([]*string, n))
	return &v
}

func (v *nullableStringVector) Set(idx int, i interface{}) {
	if i == nil {
		(*v)[idx] = nil
		return
	}
	(*v)[idx] = i.(*string)
}

func (v *nullableStringVector) SetConcreteAt(idx int, i interface{}) {
	val := i.(string)
	(*v)[idx] = &val
}

func (v *nullableStringVector) Append(i interface{}) {
	if i == nil {
		(*v) = append((*v), nil)
		return
	}
	(*v) = append((*v), i.(*string))
}

func (v *nullableStringVector) At(i int) interface{} {
	return (*v)[i]
}

func (v *nullableStringVector) CopyAt(i int) interface{} {
	if (*v)[i] == nil {
		var g *string
		return g
	}
	var g string
	g = *(*v)[i]
	return &g
}

func (v *nullableStringVector) ConcreteAt(i int) (interface{}, bool) {
	var g string
	val := (*v)[i]
	if val == nil {
		return g, false
	}
	g = *val
	return g, true
}

func (v *nullableStringVector) PointerAt(i int) interface{} {
	return &(*v)[i]
}

func (v *nullableStringVector) Len() int {
	return len((*v))
}

func (v *nullableStringVector) Type() FieldType {
	return vectorFieldType(v)
}

func (v *nullableStringVector) Extend(i int) {
	(*v) = append((*v), make([]*string, i)...)
}

//go:Boolerate boolny -in=$GOFILE -out=nullable_vector.Bool.go bool "Bool=uint8,uint16,uint32,uint64,int8,int16,int32,int64,float32,float64,string,bool,time.Time"

type nullableBoolVector []*bool

func newNullableBoolVector(n int) *nullableBoolVector {
	v := nullableBoolVector(make([]*bool, n))
	return &v
}

func (v *nullableBoolVector) Set(idx int, i interface{}) {
	if i == nil {
		(*v)[idx] = nil
		return
	}
	(*v)[idx] = i.(*bool)
}

func (v *nullableBoolVector) SetConcreteAt(idx int, i interface{}) {
	val := i.(bool)
	(*v)[idx] = &val
}

func (v *nullableBoolVector) Append(i interface{}) {
	if i == nil {
		(*v) = append((*v), nil)
		return
	}
	(*v) = append((*v), i.(*bool))
}

func (v *nullableBoolVector) At(i int) interface{} {
	return (*v)[i]
}

func (v *nullableBoolVector) CopyAt(i int) interface{} {
	if (*v)[i] == nil {
		var g *bool
		return g
	}
	var g bool
	g = *(*v)[i]
	return &g
}

func (v *nullableBoolVector) ConcreteAt(i int) (interface{}, bool) {
	var g bool
	val := (*v)[i]
	if val == nil {
		return g, false
	}
	g = *val
	return g, true
}

func (v *nullableBoolVector) PointerAt(i int) interface{} {
	return &(*v)[i]
}

func (v *nullableBoolVector) Len() int {
	return len((*v))
}

func (v *nullableBoolVector) Type() FieldType {
	return vectorFieldType(v)
}

func (v *nullableBoolVector) Extend(i int) {
	(*v) = append((*v), make([]*bool, i)...)
}

//go:TimeTimeerate timeTimeny -in=$GOFILE -out=nullable_vector.TimeTime.go time.Time "TimeTime=uint8,uint16,uint32,uint64,int8,int16,int32,int64,float32,float64,string,bool,time.Time"

type nullableTimeTimeVector []*time.Time

func newNullableTimeTimeVector(n int) *nullableTimeTimeVector {
	v := nullableTimeTimeVector(make([]*time.Time, n))
	return &v
}

func (v *nullableTimeTimeVector) Set(idx int, i interface{}) {
	if i == nil {
		(*v)[idx] = nil
		return
	}
	(*v)[idx] = i.(*time.Time)
}

func (v *nullableTimeTimeVector) SetConcreteAt(idx int, i interface{}) {
	val := i.(time.Time)
	(*v)[idx] = &val
}

func (v *nullableTimeTimeVector) Append(i interface{}) {
	if i == nil {
		(*v) = append((*v), nil)
		return
	}
	(*v) = append((*v), i.(*time.Time))
}

func (v *nullableTimeTimeVector) At(i int) interface{} {
	return (*v)[i]
}

func (v *nullableTimeTimeVector) CopyAt(i int) interface{} {
	if (*v)[i] == nil {
		var g *time.Time
		return g
	}
	var g time.Time
	g = *(*v)[i]
	return &g
}

func (v *nullableTimeTimeVector) ConcreteAt(i int) (interface{}, bool) {
	var g time.Time
	val := (*v)[i]
	if val == nil {
		return g, false
	}
	g = *val
	return g, true
}

func (v *nullableTimeTimeVector) PointerAt(i int) interface{} {
	return &(*v)[i]
}

func (v *nullableTimeTimeVector) Len() int {
	return len((*v))
}

func (v *nullableTimeTimeVector) Type() FieldType {
	return vectorFieldType(v)
}

func (v *nullableTimeTimeVector) Extend(i int) {
	(*v) = append((*v), make([]*time.Time, i)...)
}
