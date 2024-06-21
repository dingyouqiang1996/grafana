package v0alpha1

import (
	openapi_types "github.com/deepmap/oapi-codegen/pkg/types"
)

// Integration defines model for Integration.
// +k8s:openapi-gen=true
type Integration struct {
	DisableResolveMessage *bool              `json:"disableResolveMessage,omitempty"`
	Settings              openapi_types.File `json:"settings"`
	Type                  string             `json:"type"`
	Uid                   *string            `json:"uid,omitempty"`
}

// Spec defines model for Spec.
// +k8s:openapi-gen=true
type Spec struct {
	Integrations []Integration `json:"integrations"`
	Title        string        `json:"title"`
}
