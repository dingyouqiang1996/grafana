// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.34.2
// 	protoc        (unknown)
// source: rendererv2.proto

package pluginextensionv2

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type StringList struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Values []string `protobuf:"bytes,1,rep,name=values,proto3" json:"values,omitempty"`
}

func (x *StringList) Reset() {
	*x = StringList{}
	if protoimpl.UnsafeEnabled {
		mi := &file_rendererv2_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *StringList) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*StringList) ProtoMessage() {}

func (x *StringList) ProtoReflect() protoreflect.Message {
	mi := &file_rendererv2_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use StringList.ProtoReflect.Descriptor instead.
func (*StringList) Descriptor() ([]byte, []int) {
	return file_rendererv2_proto_rawDescGZIP(), []int{0}
}

func (x *StringList) GetValues() []string {
	if x != nil {
		return x.Values
	}
	return nil
}

type RenderRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Url               string                 `protobuf:"bytes,1,opt,name=url,proto3" json:"url,omitempty"`
	Width             int32                  `protobuf:"varint,2,opt,name=width,proto3" json:"width,omitempty"`
	Height            int32                  `protobuf:"varint,3,opt,name=height,proto3" json:"height,omitempty"`
	DeviceScaleFactor float32                `protobuf:"fixed32,4,opt,name=deviceScaleFactor,proto3" json:"deviceScaleFactor,omitempty"`
	FilePath          string                 `protobuf:"bytes,5,opt,name=filePath,proto3" json:"filePath,omitempty"`
	RenderKey         string                 `protobuf:"bytes,6,opt,name=renderKey,proto3" json:"renderKey,omitempty"`
	Domain            string                 `protobuf:"bytes,7,opt,name=domain,proto3" json:"domain,omitempty"`
	Timeout           int32                  `protobuf:"varint,8,opt,name=timeout,proto3" json:"timeout,omitempty"`
	Timezone          string                 `protobuf:"bytes,9,opt,name=timezone,proto3" json:"timezone,omitempty"`
	Headers           map[string]*StringList `protobuf:"bytes,10,rep,name=headers,proto3" json:"headers,omitempty" protobuf_key:"bytes,1,opt,name=key,proto3" protobuf_val:"bytes,2,opt,name=value,proto3"`
	AuthToken         string                 `protobuf:"bytes,11,opt,name=authToken,proto3" json:"authToken,omitempty"`
	Encoding          string                 `protobuf:"bytes,12,opt,name=encoding,proto3" json:"encoding,omitempty"`
}

func (x *RenderRequest) Reset() {
	*x = RenderRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_rendererv2_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *RenderRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*RenderRequest) ProtoMessage() {}

func (x *RenderRequest) ProtoReflect() protoreflect.Message {
	mi := &file_rendererv2_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use RenderRequest.ProtoReflect.Descriptor instead.
func (*RenderRequest) Descriptor() ([]byte, []int) {
	return file_rendererv2_proto_rawDescGZIP(), []int{1}
}

func (x *RenderRequest) GetUrl() string {
	if x != nil {
		return x.Url
	}
	return ""
}

func (x *RenderRequest) GetWidth() int32 {
	if x != nil {
		return x.Width
	}
	return 0
}

func (x *RenderRequest) GetHeight() int32 {
	if x != nil {
		return x.Height
	}
	return 0
}

func (x *RenderRequest) GetDeviceScaleFactor() float32 {
	if x != nil {
		return x.DeviceScaleFactor
	}
	return 0
}

func (x *RenderRequest) GetFilePath() string {
	if x != nil {
		return x.FilePath
	}
	return ""
}

func (x *RenderRequest) GetRenderKey() string {
	if x != nil {
		return x.RenderKey
	}
	return ""
}

func (x *RenderRequest) GetDomain() string {
	if x != nil {
		return x.Domain
	}
	return ""
}

func (x *RenderRequest) GetTimeout() int32 {
	if x != nil {
		return x.Timeout
	}
	return 0
}

func (x *RenderRequest) GetTimezone() string {
	if x != nil {
		return x.Timezone
	}
	return ""
}

func (x *RenderRequest) GetHeaders() map[string]*StringList {
	if x != nil {
		return x.Headers
	}
	return nil
}

func (x *RenderRequest) GetAuthToken() string {
	if x != nil {
		return x.AuthToken
	}
	return ""
}

func (x *RenderRequest) GetEncoding() string {
	if x != nil {
		return x.Encoding
	}
	return ""
}

type RenderResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Error string `protobuf:"bytes,1,opt,name=error,proto3" json:"error,omitempty"`
}

func (x *RenderResponse) Reset() {
	*x = RenderResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_rendererv2_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *RenderResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*RenderResponse) ProtoMessage() {}

func (x *RenderResponse) ProtoReflect() protoreflect.Message {
	mi := &file_rendererv2_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use RenderResponse.ProtoReflect.Descriptor instead.
func (*RenderResponse) Descriptor() ([]byte, []int) {
	return file_rendererv2_proto_rawDescGZIP(), []int{2}
}

func (x *RenderResponse) GetError() string {
	if x != nil {
		return x.Error
	}
	return ""
}

type RenderCSVRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Url       string                 `protobuf:"bytes,1,opt,name=url,proto3" json:"url,omitempty"`
	FilePath  string                 `protobuf:"bytes,2,opt,name=filePath,proto3" json:"filePath,omitempty"`
	RenderKey string                 `protobuf:"bytes,3,opt,name=renderKey,proto3" json:"renderKey,omitempty"`
	Domain    string                 `protobuf:"bytes,4,opt,name=domain,proto3" json:"domain,omitempty"`
	Timeout   int32                  `protobuf:"varint,5,opt,name=timeout,proto3" json:"timeout,omitempty"`
	Timezone  string                 `protobuf:"bytes,6,opt,name=timezone,proto3" json:"timezone,omitempty"`
	Headers   map[string]*StringList `protobuf:"bytes,7,rep,name=headers,proto3" json:"headers,omitempty" protobuf_key:"bytes,1,opt,name=key,proto3" protobuf_val:"bytes,2,opt,name=value,proto3"`
	AuthToken string                 `protobuf:"bytes,8,opt,name=authToken,proto3" json:"authToken,omitempty"`
}

func (x *RenderCSVRequest) Reset() {
	*x = RenderCSVRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_rendererv2_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *RenderCSVRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*RenderCSVRequest) ProtoMessage() {}

func (x *RenderCSVRequest) ProtoReflect() protoreflect.Message {
	mi := &file_rendererv2_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use RenderCSVRequest.ProtoReflect.Descriptor instead.
func (*RenderCSVRequest) Descriptor() ([]byte, []int) {
	return file_rendererv2_proto_rawDescGZIP(), []int{3}
}

func (x *RenderCSVRequest) GetUrl() string {
	if x != nil {
		return x.Url
	}
	return ""
}

func (x *RenderCSVRequest) GetFilePath() string {
	if x != nil {
		return x.FilePath
	}
	return ""
}

func (x *RenderCSVRequest) GetRenderKey() string {
	if x != nil {
		return x.RenderKey
	}
	return ""
}

func (x *RenderCSVRequest) GetDomain() string {
	if x != nil {
		return x.Domain
	}
	return ""
}

func (x *RenderCSVRequest) GetTimeout() int32 {
	if x != nil {
		return x.Timeout
	}
	return 0
}

func (x *RenderCSVRequest) GetTimezone() string {
	if x != nil {
		return x.Timezone
	}
	return ""
}

func (x *RenderCSVRequest) GetHeaders() map[string]*StringList {
	if x != nil {
		return x.Headers
	}
	return nil
}

func (x *RenderCSVRequest) GetAuthToken() string {
	if x != nil {
		return x.AuthToken
	}
	return ""
}

type RenderCSVResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Error    string `protobuf:"bytes,1,opt,name=error,proto3" json:"error,omitempty"`
	FileName string `protobuf:"bytes,2,opt,name=fileName,proto3" json:"fileName,omitempty"`
}

func (x *RenderCSVResponse) Reset() {
	*x = RenderCSVResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_rendererv2_proto_msgTypes[4]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *RenderCSVResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*RenderCSVResponse) ProtoMessage() {}

func (x *RenderCSVResponse) ProtoReflect() protoreflect.Message {
	mi := &file_rendererv2_proto_msgTypes[4]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use RenderCSVResponse.ProtoReflect.Descriptor instead.
func (*RenderCSVResponse) Descriptor() ([]byte, []int) {
	return file_rendererv2_proto_rawDescGZIP(), []int{4}
}

func (x *RenderCSVResponse) GetError() string {
	if x != nil {
		return x.Error
	}
	return ""
}

func (x *RenderCSVResponse) GetFileName() string {
	if x != nil {
		return x.FileName
	}
	return ""
}

var File_rendererv2_proto protoreflect.FileDescriptor

var file_rendererv2_proto_rawDesc = []byte{
	0x0a, 0x10, 0x72, 0x65, 0x6e, 0x64, 0x65, 0x72, 0x65, 0x72, 0x76, 0x32, 0x2e, 0x70, 0x72, 0x6f,
	0x74, 0x6f, 0x12, 0x11, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x65, 0x78, 0x74, 0x65, 0x6e, 0x73,
	0x69, 0x6f, 0x6e, 0x76, 0x32, 0x22, 0x24, 0x0a, 0x0a, 0x53, 0x74, 0x72, 0x69, 0x6e, 0x67, 0x4c,
	0x69, 0x73, 0x74, 0x12, 0x16, 0x0a, 0x06, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x73, 0x18, 0x01, 0x20,
	0x03, 0x28, 0x09, 0x52, 0x06, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x73, 0x22, 0xe3, 0x03, 0x0a, 0x0d,
	0x52, 0x65, 0x6e, 0x64, 0x65, 0x72, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x10, 0x0a,
	0x03, 0x75, 0x72, 0x6c, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x03, 0x75, 0x72, 0x6c, 0x12,
	0x14, 0x0a, 0x05, 0x77, 0x69, 0x64, 0x74, 0x68, 0x18, 0x02, 0x20, 0x01, 0x28, 0x05, 0x52, 0x05,
	0x77, 0x69, 0x64, 0x74, 0x68, 0x12, 0x16, 0x0a, 0x06, 0x68, 0x65, 0x69, 0x67, 0x68, 0x74, 0x18,
	0x03, 0x20, 0x01, 0x28, 0x05, 0x52, 0x06, 0x68, 0x65, 0x69, 0x67, 0x68, 0x74, 0x12, 0x2c, 0x0a,
	0x11, 0x64, 0x65, 0x76, 0x69, 0x63, 0x65, 0x53, 0x63, 0x61, 0x6c, 0x65, 0x46, 0x61, 0x63, 0x74,
	0x6f, 0x72, 0x18, 0x04, 0x20, 0x01, 0x28, 0x02, 0x52, 0x11, 0x64, 0x65, 0x76, 0x69, 0x63, 0x65,
	0x53, 0x63, 0x61, 0x6c, 0x65, 0x46, 0x61, 0x63, 0x74, 0x6f, 0x72, 0x12, 0x1a, 0x0a, 0x08, 0x66,
	0x69, 0x6c, 0x65, 0x50, 0x61, 0x74, 0x68, 0x18, 0x05, 0x20, 0x01, 0x28, 0x09, 0x52, 0x08, 0x66,
	0x69, 0x6c, 0x65, 0x50, 0x61, 0x74, 0x68, 0x12, 0x1c, 0x0a, 0x09, 0x72, 0x65, 0x6e, 0x64, 0x65,
	0x72, 0x4b, 0x65, 0x79, 0x18, 0x06, 0x20, 0x01, 0x28, 0x09, 0x52, 0x09, 0x72, 0x65, 0x6e, 0x64,
	0x65, 0x72, 0x4b, 0x65, 0x79, 0x12, 0x16, 0x0a, 0x06, 0x64, 0x6f, 0x6d, 0x61, 0x69, 0x6e, 0x18,
	0x07, 0x20, 0x01, 0x28, 0x09, 0x52, 0x06, 0x64, 0x6f, 0x6d, 0x61, 0x69, 0x6e, 0x12, 0x18, 0x0a,
	0x07, 0x74, 0x69, 0x6d, 0x65, 0x6f, 0x75, 0x74, 0x18, 0x08, 0x20, 0x01, 0x28, 0x05, 0x52, 0x07,
	0x74, 0x69, 0x6d, 0x65, 0x6f, 0x75, 0x74, 0x12, 0x1a, 0x0a, 0x08, 0x74, 0x69, 0x6d, 0x65, 0x7a,
	0x6f, 0x6e, 0x65, 0x18, 0x09, 0x20, 0x01, 0x28, 0x09, 0x52, 0x08, 0x74, 0x69, 0x6d, 0x65, 0x7a,
	0x6f, 0x6e, 0x65, 0x12, 0x47, 0x0a, 0x07, 0x68, 0x65, 0x61, 0x64, 0x65, 0x72, 0x73, 0x18, 0x0a,
	0x20, 0x03, 0x28, 0x0b, 0x32, 0x2d, 0x2e, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x65, 0x78, 0x74,
	0x65, 0x6e, 0x73, 0x69, 0x6f, 0x6e, 0x76, 0x32, 0x2e, 0x52, 0x65, 0x6e, 0x64, 0x65, 0x72, 0x52,
	0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x2e, 0x48, 0x65, 0x61, 0x64, 0x65, 0x72, 0x73, 0x45, 0x6e,
	0x74, 0x72, 0x79, 0x52, 0x07, 0x68, 0x65, 0x61, 0x64, 0x65, 0x72, 0x73, 0x12, 0x1c, 0x0a, 0x09,
	0x61, 0x75, 0x74, 0x68, 0x54, 0x6f, 0x6b, 0x65, 0x6e, 0x18, 0x0b, 0x20, 0x01, 0x28, 0x09, 0x52,
	0x09, 0x61, 0x75, 0x74, 0x68, 0x54, 0x6f, 0x6b, 0x65, 0x6e, 0x12, 0x1a, 0x0a, 0x08, 0x65, 0x6e,
	0x63, 0x6f, 0x64, 0x69, 0x6e, 0x67, 0x18, 0x0c, 0x20, 0x01, 0x28, 0x09, 0x52, 0x08, 0x65, 0x6e,
	0x63, 0x6f, 0x64, 0x69, 0x6e, 0x67, 0x1a, 0x59, 0x0a, 0x0c, 0x48, 0x65, 0x61, 0x64, 0x65, 0x72,
	0x73, 0x45, 0x6e, 0x74, 0x72, 0x79, 0x12, 0x10, 0x0a, 0x03, 0x6b, 0x65, 0x79, 0x18, 0x01, 0x20,
	0x01, 0x28, 0x09, 0x52, 0x03, 0x6b, 0x65, 0x79, 0x12, 0x33, 0x0a, 0x05, 0x76, 0x61, 0x6c, 0x75,
	0x65, 0x18, 0x02, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x1d, 0x2e, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e,
	0x65, 0x78, 0x74, 0x65, 0x6e, 0x73, 0x69, 0x6f, 0x6e, 0x76, 0x32, 0x2e, 0x53, 0x74, 0x72, 0x69,
	0x6e, 0x67, 0x4c, 0x69, 0x73, 0x74, 0x52, 0x05, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x3a, 0x02, 0x38,
	0x01, 0x22, 0x26, 0x0a, 0x0e, 0x52, 0x65, 0x6e, 0x64, 0x65, 0x72, 0x52, 0x65, 0x73, 0x70, 0x6f,
	0x6e, 0x73, 0x65, 0x12, 0x14, 0x0a, 0x05, 0x65, 0x72, 0x72, 0x6f, 0x72, 0x18, 0x01, 0x20, 0x01,
	0x28, 0x09, 0x52, 0x05, 0x65, 0x72, 0x72, 0x6f, 0x72, 0x22, 0xf1, 0x02, 0x0a, 0x10, 0x52, 0x65,
	0x6e, 0x64, 0x65, 0x72, 0x43, 0x53, 0x56, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x10,
	0x0a, 0x03, 0x75, 0x72, 0x6c, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x03, 0x75, 0x72, 0x6c,
	0x12, 0x1a, 0x0a, 0x08, 0x66, 0x69, 0x6c, 0x65, 0x50, 0x61, 0x74, 0x68, 0x18, 0x02, 0x20, 0x01,
	0x28, 0x09, 0x52, 0x08, 0x66, 0x69, 0x6c, 0x65, 0x50, 0x61, 0x74, 0x68, 0x12, 0x1c, 0x0a, 0x09,
	0x72, 0x65, 0x6e, 0x64, 0x65, 0x72, 0x4b, 0x65, 0x79, 0x18, 0x03, 0x20, 0x01, 0x28, 0x09, 0x52,
	0x09, 0x72, 0x65, 0x6e, 0x64, 0x65, 0x72, 0x4b, 0x65, 0x79, 0x12, 0x16, 0x0a, 0x06, 0x64, 0x6f,
	0x6d, 0x61, 0x69, 0x6e, 0x18, 0x04, 0x20, 0x01, 0x28, 0x09, 0x52, 0x06, 0x64, 0x6f, 0x6d, 0x61,
	0x69, 0x6e, 0x12, 0x18, 0x0a, 0x07, 0x74, 0x69, 0x6d, 0x65, 0x6f, 0x75, 0x74, 0x18, 0x05, 0x20,
	0x01, 0x28, 0x05, 0x52, 0x07, 0x74, 0x69, 0x6d, 0x65, 0x6f, 0x75, 0x74, 0x12, 0x1a, 0x0a, 0x08,
	0x74, 0x69, 0x6d, 0x65, 0x7a, 0x6f, 0x6e, 0x65, 0x18, 0x06, 0x20, 0x01, 0x28, 0x09, 0x52, 0x08,
	0x74, 0x69, 0x6d, 0x65, 0x7a, 0x6f, 0x6e, 0x65, 0x12, 0x4a, 0x0a, 0x07, 0x68, 0x65, 0x61, 0x64,
	0x65, 0x72, 0x73, 0x18, 0x07, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x30, 0x2e, 0x70, 0x6c, 0x75, 0x67,
	0x69, 0x6e, 0x65, 0x78, 0x74, 0x65, 0x6e, 0x73, 0x69, 0x6f, 0x6e, 0x76, 0x32, 0x2e, 0x52, 0x65,
	0x6e, 0x64, 0x65, 0x72, 0x43, 0x53, 0x56, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x2e, 0x48,
	0x65, 0x61, 0x64, 0x65, 0x72, 0x73, 0x45, 0x6e, 0x74, 0x72, 0x79, 0x52, 0x07, 0x68, 0x65, 0x61,
	0x64, 0x65, 0x72, 0x73, 0x12, 0x1c, 0x0a, 0x09, 0x61, 0x75, 0x74, 0x68, 0x54, 0x6f, 0x6b, 0x65,
	0x6e, 0x18, 0x08, 0x20, 0x01, 0x28, 0x09, 0x52, 0x09, 0x61, 0x75, 0x74, 0x68, 0x54, 0x6f, 0x6b,
	0x65, 0x6e, 0x1a, 0x59, 0x0a, 0x0c, 0x48, 0x65, 0x61, 0x64, 0x65, 0x72, 0x73, 0x45, 0x6e, 0x74,
	0x72, 0x79, 0x12, 0x10, 0x0a, 0x03, 0x6b, 0x65, 0x79, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52,
	0x03, 0x6b, 0x65, 0x79, 0x12, 0x33, 0x0a, 0x05, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x18, 0x02, 0x20,
	0x01, 0x28, 0x0b, 0x32, 0x1d, 0x2e, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x65, 0x78, 0x74, 0x65,
	0x6e, 0x73, 0x69, 0x6f, 0x6e, 0x76, 0x32, 0x2e, 0x53, 0x74, 0x72, 0x69, 0x6e, 0x67, 0x4c, 0x69,
	0x73, 0x74, 0x52, 0x05, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x3a, 0x02, 0x38, 0x01, 0x22, 0x45, 0x0a,
	0x11, 0x52, 0x65, 0x6e, 0x64, 0x65, 0x72, 0x43, 0x53, 0x56, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e,
	0x73, 0x65, 0x12, 0x14, 0x0a, 0x05, 0x65, 0x72, 0x72, 0x6f, 0x72, 0x18, 0x01, 0x20, 0x01, 0x28,
	0x09, 0x52, 0x05, 0x65, 0x72, 0x72, 0x6f, 0x72, 0x12, 0x1a, 0x0a, 0x08, 0x66, 0x69, 0x6c, 0x65,
	0x4e, 0x61, 0x6d, 0x65, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x08, 0x66, 0x69, 0x6c, 0x65,
	0x4e, 0x61, 0x6d, 0x65, 0x32, 0xb1, 0x01, 0x0a, 0x08, 0x52, 0x65, 0x6e, 0x64, 0x65, 0x72, 0x65,
	0x72, 0x12, 0x4d, 0x0a, 0x06, 0x52, 0x65, 0x6e, 0x64, 0x65, 0x72, 0x12, 0x20, 0x2e, 0x70, 0x6c,
	0x75, 0x67, 0x69, 0x6e, 0x65, 0x78, 0x74, 0x65, 0x6e, 0x73, 0x69, 0x6f, 0x6e, 0x76, 0x32, 0x2e,
	0x52, 0x65, 0x6e, 0x64, 0x65, 0x72, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x1a, 0x21, 0x2e,
	0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x65, 0x78, 0x74, 0x65, 0x6e, 0x73, 0x69, 0x6f, 0x6e, 0x76,
	0x32, 0x2e, 0x52, 0x65, 0x6e, 0x64, 0x65, 0x72, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65,
	0x12, 0x56, 0x0a, 0x09, 0x52, 0x65, 0x6e, 0x64, 0x65, 0x72, 0x43, 0x53, 0x56, 0x12, 0x23, 0x2e,
	0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x65, 0x78, 0x74, 0x65, 0x6e, 0x73, 0x69, 0x6f, 0x6e, 0x76,
	0x32, 0x2e, 0x52, 0x65, 0x6e, 0x64, 0x65, 0x72, 0x43, 0x53, 0x56, 0x52, 0x65, 0x71, 0x75, 0x65,
	0x73, 0x74, 0x1a, 0x24, 0x2e, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x65, 0x78, 0x74, 0x65, 0x6e,
	0x73, 0x69, 0x6f, 0x6e, 0x76, 0x32, 0x2e, 0x52, 0x65, 0x6e, 0x64, 0x65, 0x72, 0x43, 0x53, 0x56,
	0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x42, 0x16, 0x5a, 0x14, 0x2e, 0x2f, 0x3b, 0x70,
	0x6c, 0x75, 0x67, 0x69, 0x6e, 0x65, 0x78, 0x74, 0x65, 0x6e, 0x73, 0x69, 0x6f, 0x6e, 0x76, 0x32,
	0x62, 0x06, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_rendererv2_proto_rawDescOnce sync.Once
	file_rendererv2_proto_rawDescData = file_rendererv2_proto_rawDesc
)

func file_rendererv2_proto_rawDescGZIP() []byte {
	file_rendererv2_proto_rawDescOnce.Do(func() {
		file_rendererv2_proto_rawDescData = protoimpl.X.CompressGZIP(file_rendererv2_proto_rawDescData)
	})
	return file_rendererv2_proto_rawDescData
}

var file_rendererv2_proto_msgTypes = make([]protoimpl.MessageInfo, 7)
var file_rendererv2_proto_goTypes = []any{
	(*StringList)(nil),        // 0: pluginextensionv2.StringList
	(*RenderRequest)(nil),     // 1: pluginextensionv2.RenderRequest
	(*RenderResponse)(nil),    // 2: pluginextensionv2.RenderResponse
	(*RenderCSVRequest)(nil),  // 3: pluginextensionv2.RenderCSVRequest
	(*RenderCSVResponse)(nil), // 4: pluginextensionv2.RenderCSVResponse
	nil,                       // 5: pluginextensionv2.RenderRequest.HeadersEntry
	nil,                       // 6: pluginextensionv2.RenderCSVRequest.HeadersEntry
}
var file_rendererv2_proto_depIdxs = []int32{
	5, // 0: pluginextensionv2.RenderRequest.headers:type_name -> pluginextensionv2.RenderRequest.HeadersEntry
	6, // 1: pluginextensionv2.RenderCSVRequest.headers:type_name -> pluginextensionv2.RenderCSVRequest.HeadersEntry
	0, // 2: pluginextensionv2.RenderRequest.HeadersEntry.value:type_name -> pluginextensionv2.StringList
	0, // 3: pluginextensionv2.RenderCSVRequest.HeadersEntry.value:type_name -> pluginextensionv2.StringList
	1, // 4: pluginextensionv2.Renderer.Render:input_type -> pluginextensionv2.RenderRequest
	3, // 5: pluginextensionv2.Renderer.RenderCSV:input_type -> pluginextensionv2.RenderCSVRequest
	2, // 6: pluginextensionv2.Renderer.Render:output_type -> pluginextensionv2.RenderResponse
	4, // 7: pluginextensionv2.Renderer.RenderCSV:output_type -> pluginextensionv2.RenderCSVResponse
	6, // [6:8] is the sub-list for method output_type
	4, // [4:6] is the sub-list for method input_type
	4, // [4:4] is the sub-list for extension type_name
	4, // [4:4] is the sub-list for extension extendee
	0, // [0:4] is the sub-list for field type_name
}

func init() { file_rendererv2_proto_init() }
func file_rendererv2_proto_init() {
	if File_rendererv2_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_rendererv2_proto_msgTypes[0].Exporter = func(v any, i int) any {
			switch v := v.(*StringList); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_rendererv2_proto_msgTypes[1].Exporter = func(v any, i int) any {
			switch v := v.(*RenderRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_rendererv2_proto_msgTypes[2].Exporter = func(v any, i int) any {
			switch v := v.(*RenderResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_rendererv2_proto_msgTypes[3].Exporter = func(v any, i int) any {
			switch v := v.(*RenderCSVRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_rendererv2_proto_msgTypes[4].Exporter = func(v any, i int) any {
			switch v := v.(*RenderCSVResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_rendererv2_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   7,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_rendererv2_proto_goTypes,
		DependencyIndexes: file_rendererv2_proto_depIdxs,
		MessageInfos:      file_rendererv2_proto_msgTypes,
	}.Build()
	File_rendererv2_proto = out.File
	file_rendererv2_proto_rawDesc = nil
	file_rendererv2_proto_goTypes = nil
	file_rendererv2_proto_depIdxs = nil
}
