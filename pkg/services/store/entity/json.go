package entity

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"unsafe"

	jsoniter "github.com/json-iterator/go"

	"github.com/grafana/grafana/pkg/infra/grn"
)

func init() { //nolint:gochecknoinits
	jsoniter.RegisterTypeEncoder("entity.WriteEntityResponse", &writeResponseCodec{})

	jsoniter.RegisterTypeEncoder("entity.Entity", &rawEntityCodec{})
	jsoniter.RegisterTypeDecoder("entity.Entity", &rawEntityCodec{})
}

// Unlike the standard JSON marshal, this will write bytes as JSON when it can
type rawEntityCodec struct{}

func (obj *Entity) MarshalJSON() ([]byte, error) {
	var json = jsoniter.ConfigCompatibleWithStandardLibrary
	return json.Marshal(obj)
}

// UnmarshalJSON will read JSON into a Entity
func (obj *Entity) UnmarshalJSON(b []byte) error {
	if obj == nil {
		return fmt.Errorf("unexpected nil for raw objcet")
	}
	iter := jsoniter.ParseBytes(jsoniter.ConfigDefault, b)
	readEntity(iter, obj)
	return iter.Error
}

func (codec *rawEntityCodec) IsEmpty(ptr unsafe.Pointer) bool {
	f := (*Entity)(ptr)
	return f.GRN == nil && f.Body == nil
}

func (codec *rawEntityCodec) Encode(ptr unsafe.Pointer, stream *jsoniter.Stream) {
	obj := (*Entity)(ptr)
	stream.WriteObjectStart()
	stream.WriteObjectField("GRN")
	stream.WriteVal(obj.GRN)

	if obj.Guid != "" {
		stream.WriteMore()
		stream.WriteObjectField("guid")
		stream.WriteString(obj.Guid)
	}

	if obj.Version != "" {
		stream.WriteMore()
		stream.WriteObjectField("version")
		stream.WriteString(obj.Version)
	}
	if obj.CreatedAt > 0 {
		stream.WriteMore()
		stream.WriteObjectField("createdAt")
		stream.WriteInt64(obj.CreatedAt)
	}
	if obj.UpdatedAt > 0 {
		stream.WriteMore()
		stream.WriteObjectField("updatedAt")
		stream.WriteInt64(obj.UpdatedAt)
	}
	if obj.CreatedBy != "" {
		stream.WriteMore()
		stream.WriteObjectField("createdBy")
		stream.WriteString(obj.CreatedBy)
	}
	if obj.UpdatedBy != "" {
		stream.WriteMore()
		stream.WriteObjectField("updatedBy")
		stream.WriteString(obj.UpdatedBy)
	}
	if obj.Folder != "" {
		stream.WriteMore()
		stream.WriteObjectField("folder")
		stream.WriteString(obj.Folder)
	}
	if obj.Body != nil {
		stream.WriteMore()
		if json.Valid(obj.Body) {
			stream.WriteObjectField("body")
			stream.WriteRaw(string(obj.Body)) // works for strings
		} else {
			sEnc := base64.StdEncoding.EncodeToString(obj.Body)
			stream.WriteObjectField("body_base64")
			stream.WriteString(sEnc) // works for strings
		}
	}
	if obj.Name != "" {
		stream.WriteMore()
		stream.WriteObjectField("name")
		stream.WriteString(obj.Name)
	}
	// TODO other ex-summary fields
	if obj.ETag != "" {
		stream.WriteMore()
		stream.WriteObjectField("etag")
		stream.WriteString(obj.ETag)
	}
	if obj.Size > 0 {
		stream.WriteMore()
		stream.WriteObjectField("size")
		stream.WriteInt64(obj.Size)
	}
	if obj.Origin != nil {
		stream.WriteMore()
		stream.WriteObjectField("origin")
		stream.WriteVal(obj.Origin)
	}
	stream.WriteObjectEnd()
}

func (codec *rawEntityCodec) Decode(ptr unsafe.Pointer, iter *jsoniter.Iterator) {
	*(*Entity)(ptr) = Entity{}
	raw := (*Entity)(ptr)
	readEntity(iter, raw)
}

func readEntity(iter *jsoniter.Iterator, raw *Entity) {
	for l1Field := iter.ReadObject(); l1Field != ""; l1Field = iter.ReadObject() {
		switch l1Field {
		case "GRN":
			raw.GRN = &grn.GRN{}
			iter.ReadVal(raw.GRN)
		case "guid":
			raw.Guid = iter.ReadString()
		case "updatedAt":
			raw.UpdatedAt = iter.ReadInt64()
		case "updatedBy":
			raw.UpdatedBy = iter.ReadString()
		case "createdAt":
			raw.CreatedAt = iter.ReadInt64()
		case "createdBy":
			raw.CreatedBy = iter.ReadString()
		case "size":
			raw.Size = iter.ReadInt64()
		case "etag":
			raw.ETag = iter.ReadString()
		case "version":
			raw.Version = iter.ReadString()
		case "folder":
			raw.Folder = iter.ReadString()
		case "origin":
			raw.Origin = &EntityOriginInfo{}
			iter.ReadVal(raw.Origin)
		case "name":
			raw.Name = iter.ReadString()
		// TODO other ex-summary fields

		case "body":
			var val interface{}
			iter.ReadVal(&val) // ??? is there a smarter way to just keep the underlying bytes without read+marshal
			body, err := json.Marshal(val)
			if err != nil {
				iter.ReportError("raw entity", "error creating json from body")
				return
			}
			raw.Body = body

		case "body_base64":
			val := iter.ReadString()
			body, err := base64.StdEncoding.DecodeString(val)
			if err != nil {
				iter.ReportError("raw entity", "error decoding base64 body")
				return
			}
			raw.Body = body

		default:
			iter.ReportError("raw object", "unexpected field: "+l1Field)
			return
		}
	}
}

// Unlike the standard JSON marshal, this will write bytes as JSON when it can
type writeResponseCodec struct{}

func (obj *WriteEntityResponse) MarshalJSON() ([]byte, error) {
	var json = jsoniter.ConfigCompatibleWithStandardLibrary
	return json.Marshal(obj)
}

func (codec *writeResponseCodec) IsEmpty(ptr unsafe.Pointer) bool {
	f := (*WriteEntityResponse)(ptr)
	return f == nil
}

func (codec *writeResponseCodec) Encode(ptr unsafe.Pointer, stream *jsoniter.Stream) {
	obj := (*WriteEntityResponse)(ptr)
	stream.WriteObjectStart()
	stream.WriteObjectField("status")
	stream.WriteString(obj.Status.String())

	if obj.Error != nil {
		stream.WriteMore()
		stream.WriteObjectField("error")
		stream.WriteVal(obj.Error)
	}
	if obj.Entity != nil {
		stream.WriteMore()
		stream.WriteObjectField("entity")
		stream.WriteVal(obj.Entity)
	}
	stream.WriteObjectEnd()
}
