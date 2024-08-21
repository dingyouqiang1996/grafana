//go:build !ignore_autogenerated
// +build !ignore_autogenerated

// SPDX-License-Identifier: AGPL-3.0-only

// Code generated by openapi-gen. DO NOT EDIT.

package v0alpha1

import (
	common "k8s.io/kube-openapi/pkg/common"
	spec "k8s.io/kube-openapi/pkg/validation/spec"
)

func GetOpenAPIDefinitions(ref common.ReferenceCallback) map[string]common.OpenAPIDefinition {
	return map[string]common.OpenAPIDefinition{
		"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.IdentityDisplay":        schema_pkg_apis_identity_v0alpha1_IdentityDisplay(ref),
		"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.IdentityDisplayResults": schema_pkg_apis_identity_v0alpha1_IdentityDisplayResults(ref),
		"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.SSOSetting":             schema_pkg_apis_identity_v0alpha1_SSOSetting(ref),
		"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.SSOSettingList":         schema_pkg_apis_identity_v0alpha1_SSOSettingList(ref),
		"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.SSOSettingSpec":         schema_pkg_apis_identity_v0alpha1_SSOSettingSpec(ref),
		"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.ServiceAccount":         schema_pkg_apis_identity_v0alpha1_ServiceAccount(ref),
		"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.ServiceAccountList":     schema_pkg_apis_identity_v0alpha1_ServiceAccountList(ref),
		"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.ServiceAccountSpec":     schema_pkg_apis_identity_v0alpha1_ServiceAccountSpec(ref),
		"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.Team":                   schema_pkg_apis_identity_v0alpha1_Team(ref),
		"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.TeamBinding":            schema_pkg_apis_identity_v0alpha1_TeamBinding(ref),
		"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.TeamBindingList":        schema_pkg_apis_identity_v0alpha1_TeamBindingList(ref),
		"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.TeamBindingSpec":        schema_pkg_apis_identity_v0alpha1_TeamBindingSpec(ref),
		"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.TeamList":               schema_pkg_apis_identity_v0alpha1_TeamList(ref),
		"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.TeamRef":                schema_pkg_apis_identity_v0alpha1_TeamRef(ref),
		"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.TeamSpec":               schema_pkg_apis_identity_v0alpha1_TeamSpec(ref),
		"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.TeamSubject":            schema_pkg_apis_identity_v0alpha1_TeamSubject(ref),
		"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.User":                   schema_pkg_apis_identity_v0alpha1_User(ref),
		"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.UserList":               schema_pkg_apis_identity_v0alpha1_UserList(ref),
		"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.UserSpec":               schema_pkg_apis_identity_v0alpha1_UserSpec(ref),
	}
}

func schema_pkg_apis_identity_v0alpha1_IdentityDisplay(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Type: []string{"object"},
				Properties: map[string]spec.Schema{
					"type": {
						SchemaProps: spec.SchemaProps{
							Default: "",
							Type:    []string{"string"},
							Format:  "",
						},
					},
					"uid": {
						SchemaProps: spec.SchemaProps{
							Description: "The namespaced UID, eg `user|api-key|...`",
							Default:     "",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"display": {
						SchemaProps: spec.SchemaProps{
							Description: "The namespaced UID, eg `xyz`",
							Default:     "",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"avatarURL": {
						SchemaProps: spec.SchemaProps{
							Type:   []string{"string"},
							Format: "",
						},
					},
					"internalId": {
						SchemaProps: spec.SchemaProps{
							Description: "Legacy internal ID -- usage of this value should be phased out",
							Type:        []string{"integer"},
							Format:      "int64",
						},
					},
				},
				Required: []string{"type", "uid", "display"},
			},
		},
	}
}

func schema_pkg_apis_identity_v0alpha1_IdentityDisplayResults(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Type: []string{"object"},
				Properties: map[string]spec.Schema{
					"kind": {
						SchemaProps: spec.SchemaProps{
							Description: "Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"apiVersion": {
						SchemaProps: spec.SchemaProps{
							Description: "APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"keys": {
						VendorExtensible: spec.VendorExtensible{
							Extensions: spec.Extensions{
								"x-kubernetes-list-type": "set",
							},
						},
						SchemaProps: spec.SchemaProps{
							Description: "Request keys used to lookup the display value",
							Type:        []string{"array"},
							Items: &spec.SchemaOrArray{
								Schema: &spec.Schema{
									SchemaProps: spec.SchemaProps{
										Default: "",
										Type:    []string{"string"},
										Format:  "",
									},
								},
							},
						},
					},
					"display": {
						VendorExtensible: spec.VendorExtensible{
							Extensions: spec.Extensions{
								"x-kubernetes-list-type": "atomic",
							},
						},
						SchemaProps: spec.SchemaProps{
							Description: "Matching items (the caller may need to remap from keys to results)",
							Type:        []string{"array"},
							Items: &spec.SchemaOrArray{
								Schema: &spec.Schema{
									SchemaProps: spec.SchemaProps{
										Default: map[string]interface{}{},
										Ref:     ref("github.com/grafana/grafana/pkg/apis/identity/v0alpha1.IdentityDisplay"),
									},
								},
							},
						},
					},
					"invalidKeys": {
						VendorExtensible: spec.VendorExtensible{
							Extensions: spec.Extensions{
								"x-kubernetes-list-type": "set",
							},
						},
						SchemaProps: spec.SchemaProps{
							Description: "Input keys that were not useable",
							Type:        []string{"array"},
							Items: &spec.SchemaOrArray{
								Schema: &spec.Schema{
									SchemaProps: spec.SchemaProps{
										Default: "",
										Type:    []string{"string"},
										Format:  "",
									},
								},
							},
						},
					},
				},
				Required: []string{"keys", "display"},
			},
		},
		Dependencies: []string{
			"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.IdentityDisplay"},
	}
}

func schema_pkg_apis_identity_v0alpha1_SSOSetting(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Type: []string{"object"},
				Properties: map[string]spec.Schema{
					"kind": {
						SchemaProps: spec.SchemaProps{
							Description: "Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"apiVersion": {
						SchemaProps: spec.SchemaProps{
							Description: "APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"metadata": {
						SchemaProps: spec.SchemaProps{
							Description: "Standard object's metadata More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata",
							Default:     map[string]interface{}{},
							Ref:         ref("k8s.io/apimachinery/pkg/apis/meta/v1.ObjectMeta"),
						},
					},
					"spec": {
						SchemaProps: spec.SchemaProps{
							Default: map[string]interface{}{},
							Ref:     ref("github.com/grafana/grafana/pkg/apis/identity/v0alpha1.SSOSettingSpec"),
						},
					},
				},
			},
		},
		Dependencies: []string{
			"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.SSOSettingSpec", "k8s.io/apimachinery/pkg/apis/meta/v1.ObjectMeta"},
	}
}

func schema_pkg_apis_identity_v0alpha1_SSOSettingList(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Type: []string{"object"},
				Properties: map[string]spec.Schema{
					"kind": {
						SchemaProps: spec.SchemaProps{
							Description: "Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"apiVersion": {
						SchemaProps: spec.SchemaProps{
							Description: "APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"metadata": {
						SchemaProps: spec.SchemaProps{
							Default: map[string]interface{}{},
							Ref:     ref("k8s.io/apimachinery/pkg/apis/meta/v1.ListMeta"),
						},
					},
					"items": {
						SchemaProps: spec.SchemaProps{
							Type: []string{"array"},
							Items: &spec.SchemaOrArray{
								Schema: &spec.Schema{
									SchemaProps: spec.SchemaProps{
										Default: map[string]interface{}{},
										Ref:     ref("github.com/grafana/grafana/pkg/apis/identity/v0alpha1.SSOSetting"),
									},
								},
							},
						},
					},
				},
			},
		},
		Dependencies: []string{
			"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.SSOSetting", "k8s.io/apimachinery/pkg/apis/meta/v1.ListMeta"},
	}
}

func schema_pkg_apis_identity_v0alpha1_SSOSettingSpec(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Description: "SSOSettingSpec defines model for SSOSettingSpec.",
				Type:        []string{"object"},
				Properties: map[string]spec.Schema{
					"source": {
						SchemaProps: spec.SchemaProps{
							Description: "Possible enum values:\n - `\"db\"`\n - `\"system\"` system is from config file, env or argument",
							Default:     "",
							Type:        []string{"string"},
							Format:      "",
							Enum:        []interface{}{"db", "system"},
						},
					},
					"settings": {
						SchemaProps: spec.SchemaProps{
							Ref: ref("github.com/grafana/grafana/pkg/apimachinery/apis/common/v0alpha1.Unstructured"),
						},
					},
				},
				Required: []string{"source", "settings"},
			},
		},
		Dependencies: []string{
			"github.com/grafana/grafana/pkg/apimachinery/apis/common/v0alpha1.Unstructured"},
	}
}

func schema_pkg_apis_identity_v0alpha1_ServiceAccount(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Type: []string{"object"},
				Properties: map[string]spec.Schema{
					"kind": {
						SchemaProps: spec.SchemaProps{
							Description: "Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"apiVersion": {
						SchemaProps: spec.SchemaProps{
							Description: "APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"metadata": {
						SchemaProps: spec.SchemaProps{
							Default: map[string]interface{}{},
							Ref:     ref("k8s.io/apimachinery/pkg/apis/meta/v1.ObjectMeta"),
						},
					},
					"spec": {
						SchemaProps: spec.SchemaProps{
							Default: map[string]interface{}{},
							Ref:     ref("github.com/grafana/grafana/pkg/apis/identity/v0alpha1.ServiceAccountSpec"),
						},
					},
				},
			},
		},
		Dependencies: []string{
			"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.ServiceAccountSpec", "k8s.io/apimachinery/pkg/apis/meta/v1.ObjectMeta"},
	}
}

func schema_pkg_apis_identity_v0alpha1_ServiceAccountList(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Type: []string{"object"},
				Properties: map[string]spec.Schema{
					"kind": {
						SchemaProps: spec.SchemaProps{
							Description: "Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"apiVersion": {
						SchemaProps: spec.SchemaProps{
							Description: "APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"metadata": {
						SchemaProps: spec.SchemaProps{
							Default: map[string]interface{}{},
							Ref:     ref("k8s.io/apimachinery/pkg/apis/meta/v1.ListMeta"),
						},
					},
					"items": {
						SchemaProps: spec.SchemaProps{
							Type: []string{"array"},
							Items: &spec.SchemaOrArray{
								Schema: &spec.Schema{
									SchemaProps: spec.SchemaProps{
										Default: map[string]interface{}{},
										Ref:     ref("github.com/grafana/grafana/pkg/apis/identity/v0alpha1.ServiceAccount"),
									},
								},
							},
						},
					},
				},
			},
		},
		Dependencies: []string{
			"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.ServiceAccount", "k8s.io/apimachinery/pkg/apis/meta/v1.ListMeta"},
	}
}

func schema_pkg_apis_identity_v0alpha1_ServiceAccountSpec(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Type: []string{"object"},
				Properties: map[string]spec.Schema{
					"name": {
						SchemaProps: spec.SchemaProps{
							Type:   []string{"string"},
							Format: "",
						},
					},
					"email": {
						SchemaProps: spec.SchemaProps{
							Type:   []string{"string"},
							Format: "",
						},
					},
					"emailVerified": {
						SchemaProps: spec.SchemaProps{
							Type:   []string{"boolean"},
							Format: "",
						},
					},
					"disabled": {
						SchemaProps: spec.SchemaProps{
							Type:   []string{"boolean"},
							Format: "",
						},
					},
				},
			},
		},
	}
}

func schema_pkg_apis_identity_v0alpha1_Team(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Type: []string{"object"},
				Properties: map[string]spec.Schema{
					"kind": {
						SchemaProps: spec.SchemaProps{
							Description: "Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"apiVersion": {
						SchemaProps: spec.SchemaProps{
							Description: "APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"metadata": {
						SchemaProps: spec.SchemaProps{
							Default: map[string]interface{}{},
							Ref:     ref("k8s.io/apimachinery/pkg/apis/meta/v1.ObjectMeta"),
						},
					},
					"spec": {
						SchemaProps: spec.SchemaProps{
							Default: map[string]interface{}{},
							Ref:     ref("github.com/grafana/grafana/pkg/apis/identity/v0alpha1.TeamSpec"),
						},
					},
				},
			},
		},
		Dependencies: []string{
			"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.TeamSpec", "k8s.io/apimachinery/pkg/apis/meta/v1.ObjectMeta"},
	}
}

func schema_pkg_apis_identity_v0alpha1_TeamBinding(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Type: []string{"object"},
				Properties: map[string]spec.Schema{
					"kind": {
						SchemaProps: spec.SchemaProps{
							Description: "Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"apiVersion": {
						SchemaProps: spec.SchemaProps{
							Description: "APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"metadata": {
						SchemaProps: spec.SchemaProps{
							Default: map[string]interface{}{},
							Ref:     ref("k8s.io/apimachinery/pkg/apis/meta/v1.ObjectMeta"),
						},
					},
					"spec": {
						SchemaProps: spec.SchemaProps{
							Default: map[string]interface{}{},
							Ref:     ref("github.com/grafana/grafana/pkg/apis/identity/v0alpha1.TeamBindingSpec"),
						},
					},
				},
			},
		},
		Dependencies: []string{
			"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.TeamBindingSpec", "k8s.io/apimachinery/pkg/apis/meta/v1.ObjectMeta"},
	}
}

func schema_pkg_apis_identity_v0alpha1_TeamBindingList(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Type: []string{"object"},
				Properties: map[string]spec.Schema{
					"kind": {
						SchemaProps: spec.SchemaProps{
							Description: "Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"apiVersion": {
						SchemaProps: spec.SchemaProps{
							Description: "APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"metadata": {
						SchemaProps: spec.SchemaProps{
							Default: map[string]interface{}{},
							Ref:     ref("k8s.io/apimachinery/pkg/apis/meta/v1.ListMeta"),
						},
					},
					"items": {
						SchemaProps: spec.SchemaProps{
							Type: []string{"array"},
							Items: &spec.SchemaOrArray{
								Schema: &spec.Schema{
									SchemaProps: spec.SchemaProps{
										Default: map[string]interface{}{},
										Ref:     ref("github.com/grafana/grafana/pkg/apis/identity/v0alpha1.TeamBinding"),
									},
								},
							},
						},
					},
				},
			},
		},
		Dependencies: []string{
			"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.TeamBinding", "k8s.io/apimachinery/pkg/apis/meta/v1.ListMeta"},
	}
}

func schema_pkg_apis_identity_v0alpha1_TeamBindingSpec(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Type: []string{"object"},
				Properties: map[string]spec.Schema{
					"subjects": {
						SchemaProps: spec.SchemaProps{
							Type: []string{"array"},
							Items: &spec.SchemaOrArray{
								Schema: &spec.Schema{
									SchemaProps: spec.SchemaProps{
										Default: map[string]interface{}{},
										Ref:     ref("github.com/grafana/grafana/pkg/apis/identity/v0alpha1.TeamSubject"),
									},
								},
							},
						},
					},
					"teamRef": {
						SchemaProps: spec.SchemaProps{
							Default: map[string]interface{}{},
							Ref:     ref("github.com/grafana/grafana/pkg/apis/identity/v0alpha1.TeamRef"),
						},
					},
				},
			},
		},
		Dependencies: []string{
			"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.TeamRef", "github.com/grafana/grafana/pkg/apis/identity/v0alpha1.TeamSubject"},
	}
}

func schema_pkg_apis_identity_v0alpha1_TeamList(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Type: []string{"object"},
				Properties: map[string]spec.Schema{
					"kind": {
						SchemaProps: spec.SchemaProps{
							Description: "Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"apiVersion": {
						SchemaProps: spec.SchemaProps{
							Description: "APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"metadata": {
						SchemaProps: spec.SchemaProps{
							Default: map[string]interface{}{},
							Ref:     ref("k8s.io/apimachinery/pkg/apis/meta/v1.ListMeta"),
						},
					},
					"items": {
						SchemaProps: spec.SchemaProps{
							Type: []string{"array"},
							Items: &spec.SchemaOrArray{
								Schema: &spec.Schema{
									SchemaProps: spec.SchemaProps{
										Default: map[string]interface{}{},
										Ref:     ref("github.com/grafana/grafana/pkg/apis/identity/v0alpha1.Team"),
									},
								},
							},
						},
					},
				},
			},
		},
		Dependencies: []string{
			"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.Team", "k8s.io/apimachinery/pkg/apis/meta/v1.ListMeta"},
	}
}

func schema_pkg_apis_identity_v0alpha1_TeamRef(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Type: []string{"object"},
				Properties: map[string]spec.Schema{
					"name": {
						SchemaProps: spec.SchemaProps{
							Description: "Name is the unique identifier for a team.",
							Type:        []string{"string"},
							Format:      "",
						},
					},
				},
			},
		},
	}
}

func schema_pkg_apis_identity_v0alpha1_TeamSpec(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Type: []string{"object"},
				Properties: map[string]spec.Schema{
					"name": {
						SchemaProps: spec.SchemaProps{
							Type:   []string{"string"},
							Format: "",
						},
					},
					"email": {
						SchemaProps: spec.SchemaProps{
							Type:   []string{"string"},
							Format: "",
						},
					},
				},
			},
		},
	}
}

func schema_pkg_apis_identity_v0alpha1_TeamSubject(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Type: []string{"object"},
				Properties: map[string]spec.Schema{
					"kind": {
						SchemaProps: spec.SchemaProps{
							Description: "Kind is the kind of the subject, only supports \"User\".",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"name": {
						SchemaProps: spec.SchemaProps{
							Description: "Name is the unique identifier for subject.",
							Type:        []string{"string"},
							Format:      "",
						},
					},
				},
			},
		},
	}
}

func schema_pkg_apis_identity_v0alpha1_User(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Type: []string{"object"},
				Properties: map[string]spec.Schema{
					"kind": {
						SchemaProps: spec.SchemaProps{
							Description: "Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"apiVersion": {
						SchemaProps: spec.SchemaProps{
							Description: "APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"metadata": {
						SchemaProps: spec.SchemaProps{
							Default: map[string]interface{}{},
							Ref:     ref("k8s.io/apimachinery/pkg/apis/meta/v1.ObjectMeta"),
						},
					},
					"spec": {
						SchemaProps: spec.SchemaProps{
							Default: map[string]interface{}{},
							Ref:     ref("github.com/grafana/grafana/pkg/apis/identity/v0alpha1.UserSpec"),
						},
					},
				},
			},
		},
		Dependencies: []string{
			"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.UserSpec", "k8s.io/apimachinery/pkg/apis/meta/v1.ObjectMeta"},
	}
}

func schema_pkg_apis_identity_v0alpha1_UserList(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Type: []string{"object"},
				Properties: map[string]spec.Schema{
					"kind": {
						SchemaProps: spec.SchemaProps{
							Description: "Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"apiVersion": {
						SchemaProps: spec.SchemaProps{
							Description: "APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"metadata": {
						SchemaProps: spec.SchemaProps{
							Default: map[string]interface{}{},
							Ref:     ref("k8s.io/apimachinery/pkg/apis/meta/v1.ListMeta"),
						},
					},
					"items": {
						SchemaProps: spec.SchemaProps{
							Type: []string{"array"},
							Items: &spec.SchemaOrArray{
								Schema: &spec.Schema{
									SchemaProps: spec.SchemaProps{
										Default: map[string]interface{}{},
										Ref:     ref("github.com/grafana/grafana/pkg/apis/identity/v0alpha1.User"),
									},
								},
							},
						},
					},
				},
			},
		},
		Dependencies: []string{
			"github.com/grafana/grafana/pkg/apis/identity/v0alpha1.User", "k8s.io/apimachinery/pkg/apis/meta/v1.ListMeta"},
	}
}

func schema_pkg_apis_identity_v0alpha1_UserSpec(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Type: []string{"object"},
				Properties: map[string]spec.Schema{
					"name": {
						SchemaProps: spec.SchemaProps{
							Type:   []string{"string"},
							Format: "",
						},
					},
					"login": {
						SchemaProps: spec.SchemaProps{
							Type:   []string{"string"},
							Format: "",
						},
					},
					"email": {
						SchemaProps: spec.SchemaProps{
							Type:   []string{"string"},
							Format: "",
						},
					},
					"emailVerified": {
						SchemaProps: spec.SchemaProps{
							Type:   []string{"boolean"},
							Format: "",
						},
					},
					"disabled": {
						SchemaProps: spec.SchemaProps{
							Type:   []string{"boolean"},
							Format: "",
						},
					},
				},
			},
		},
	}
}
