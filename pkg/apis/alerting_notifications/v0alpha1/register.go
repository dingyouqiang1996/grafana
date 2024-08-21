package v0alpha1

import (
	"fmt"
	"slices"
	"strconv"
	"strings"

	"golang.org/x/exp/maps"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/fields"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apiserver/pkg/registry/generic"

	common "github.com/grafana/grafana/pkg/apimachinery/apis/common/v0alpha1"
	"github.com/grafana/grafana/pkg/apimachinery/utils"
	scope "github.com/grafana/grafana/pkg/apis/scope/v0alpha1"
)

func init() {
	localSchemeBuilder.Register(AddKnownTypes)
}

const (
	GROUP      = "notifications.alerting.grafana.app"
	VERSION    = "v0alpha1"
	APIVERSION = GROUP + "/" + VERSION
)

var (
	TimeIntervalResourceInfo = common.NewResourceInfo(GROUP, VERSION,
		"timeintervals", "timeinterval", "TimeInterval",
		func() runtime.Object { return &TimeInterval{} },
		func() runtime.Object { return &TimeIntervalList{} },
		utils.TableColumns{
			Definition: []metav1.TableColumnDefinition{
				{Name: "Name", Type: "string", Format: "name"},
				// {Name: "Intervals", Type: "string", Format: "string", Description: "The display name"},
			},
			Reader: func(obj any) ([]interface{}, error) {
				r, ok := obj.(*TimeInterval)
				if ok {
					return []interface{}{
						r.Name,
						// r.Spec, //TODO implement formatting for Spec, same as UI?
					}, nil
				}
				return nil, fmt.Errorf("expected resource or info")
			},
		},
	)
	ReceiverResourceInfo = common.NewResourceInfo(GROUP, VERSION,
		"receivers", "receiver", "Receiver",
		func() runtime.Object { return &Receiver{} },
		func() runtime.Object { return &ReceiverList{} },
		utils.TableColumns{
			Definition: []metav1.TableColumnDefinition{
				{Name: "Name", Type: "string", Format: "name"},
				{Name: "Title", Type: "string", Format: "string", Description: "The receiver name"},
				{Name: "Integrations", Type: "string", Format: "string", Description: "Unique list of integrations used in this receiver. If integration used more than once, it is followed by a number of usages in parenthesis"},
				// TODO add date of last notification and last error
			},
			Reader: func(obj any) ([]interface{}, error) {
				r, ok := obj.(*Receiver)
				if ok {
					types := map[string]int{}
					strLength := 0
					for _, integration := range r.Spec.Integrations {
						qty, ok := types[integration.Type]
						if !ok {
							strLength += len(integration.Type)
						}
						qty++
						if qty == 2 {
							strLength += 3 // (2)
						}
						types[integration.Type] = qty
					}
					keys := maps.Keys(types)
					slices.Sort(keys)
					b := strings.Builder{}
					b.Grow(strLength)
					for idx, key := range keys {
						if idx > 0 {
							b.WriteRune(',')
						}
						qty := types[key]
						b.WriteString(key)
						if qty > 1 {
							b.WriteRune('(')
							b.WriteString(strconv.Itoa(qty))
							b.WriteRune(')')
						}
					}
					return []interface{}{
						r.Name,
						r.Spec.Title,
						b.String(),
					}, nil
				}
				return nil, fmt.Errorf("expected resource or info")
			},
		},
	)
	TemplateGroupResourceInfo = common.NewResourceInfo(GROUP, VERSION,
		"templategroups", "templategroup", "TemplateGroup",
		func() runtime.Object { return &TemplateGroup{} },
		func() runtime.Object { return &TemplateGroupList{} },
		utils.TableColumns{
			Definition: []metav1.TableColumnDefinition{
				{Name: "Name", Type: "string", Format: "name"},
				// {Name: "Intervals", Type: "string", Format: "string", Description: "The display name"},
			},
			Reader: func(obj any) ([]interface{}, error) {
				r, ok := obj.(*TemplateGroup)
				if !ok {
					return nil, fmt.Errorf("expected resource or info")
				}
				return []interface{}{
					r.Name,
					// r.Spec, //TODO implement formatting for Spec, same as UI?
				}, nil
			},
		},
	)
	RouteResourceInfo = common.NewResourceInfo(GROUP, VERSION,
		"route", "route", "Route",
		func() runtime.Object { return &Route{} },
		func() runtime.Object { return &Route{} },
		utils.TableColumns{
			Definition: []metav1.TableColumnDefinition{
				{Name: "Name", Type: "string", Format: "name"},
				// {Name: "Intervals", Type: "string", Format: "string", Description: "The display name"},
			},
			Reader: func(obj any) ([]interface{}, error) {
				r, ok := obj.(*Route)
				if !ok {
					return nil, fmt.Errorf("expected resource or info")
				}
				return []interface{}{
					r.Name,
					// r.Spec, //TODO implement formatting for Spec, same as UI?
				}, nil
			},
		},
	)
	// SchemeGroupVersion is group version used to register these objects
	SchemeGroupVersion = schema.GroupVersion{Group: GROUP, Version: VERSION}
	// SchemaBuilder is used by standard codegen
	SchemeBuilder      runtime.SchemeBuilder
	localSchemeBuilder = &SchemeBuilder
	AddToScheme        = localSchemeBuilder.AddToScheme
)

// Adds the list of known types to the given scheme.
func AddKnownTypes(scheme *runtime.Scheme) error {
	return AddKnownTypesGroup(scheme, SchemeGroupVersion)
}

// Adds the list of known types to the given scheme and group version.
func AddKnownTypesGroup(scheme *runtime.Scheme, g schema.GroupVersion) error {
	scheme.AddKnownTypes(g,
		&TimeInterval{},
		&TimeIntervalList{},
		&Receiver{},
		&ReceiverList{},
		&TemplateGroup{},
		&TemplateGroupList{},
		&Route{},
	)
	metav1.AddToGroupVersion(scheme, g)

	err := scheme.AddFieldLabelConversionFunc(
		TimeIntervalResourceInfo.GroupVersionKind(),
		func(label, value string) (string, string, error) {
			fieldSet := SelectableTimeIntervalsFields(&TimeInterval{})
			for key := range fieldSet {
				if label == key {
					return label, value, nil
				}
			}
			return "", "", fmt.Errorf("field label not supported for %s: %s", scope.ScopeNodeResourceInfo.GroupVersionKind(), label)
		},
	)
	if err != nil {
		return err
	}

	err = scheme.AddFieldLabelConversionFunc(
		TemplateGroupResourceInfo.GroupVersionKind(),
		func(label, value string) (string, string, error) {
			fieldSet := SelectableTemplateGroupFields(&TemplateGroup{})
			for key := range fieldSet {
				if label == key {
					return label, value, nil
				}
			}
			return "", "", fmt.Errorf("field label not supported for %s: %s", scope.ScopeNodeResourceInfo.GroupVersionKind(), label)
		},
	)
	if err != nil {
		return err
	}

	return nil
}

func SelectableTimeIntervalsFields(obj *TimeInterval) fields.Set {
	if obj == nil {
		return nil
	}
	return generic.MergeFieldsSets(generic.ObjectMetaFieldsSet(&obj.ObjectMeta, false), fields.Set{
		"metadata.provenance": obj.GetProvenanceStatus(),
		"spec.name":           obj.Spec.Name,
	})
}

func SelectableTemplateGroupFields(obj *TemplateGroup) fields.Set {
	if obj == nil {
		return nil
	}
	return generic.MergeFieldsSets(generic.ObjectMetaFieldsSet(&obj.ObjectMeta, false), fields.Set{
		"metadata.provenance": obj.GetProvenanceStatus(),
		"spec.title":          obj.Spec.Title,
	})
}

// Resource takes an unqualified resource and returns a Group qualified GroupResource
func Resource(resource string) schema.GroupResource {
	return SchemeGroupVersion.WithResource(resource).GroupResource()
}
