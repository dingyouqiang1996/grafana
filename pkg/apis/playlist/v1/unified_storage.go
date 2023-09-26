package v1

import (
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apiserver/pkg/registry/generic"
	genericregistry "k8s.io/apiserver/pkg/registry/generic/registry"
	"k8s.io/apiserver/pkg/registry/rest"

	grafanaregistry "github.com/grafana/grafana/pkg/services/grafana-apiserver/registry/generic"
	grafanarest "github.com/grafana/grafana/pkg/services/grafana-apiserver/rest"
)

var _ grafanarest.UnifiedStorage = (*unifiedStorage)(nil)

type unifiedStorage struct {
	*genericregistry.Store
}

func newUnifiedStorage(scheme *runtime.Scheme, optsGetter generic.RESTOptionsGetter) (*unifiedStorage, error) {
	strategy := grafanaregistry.NewStrategy(scheme)

	store := &genericregistry.Store{
		NewFunc:                   func() runtime.Object { return &Playlist{} },
		NewListFunc:               func() runtime.Object { return &PlaylistList{} },
		PredicateFunc:             grafanaregistry.Matcher,
		DefaultQualifiedResource:  Resource("playlists"),
		SingularQualifiedResource: Resource("playlist"),

		CreateStrategy: strategy,
		UpdateStrategy: strategy,
		DeleteStrategy: strategy,

		TableConvertor: rest.NewDefaultTableConvertor(Resource("playlists")),
	}
	options := &generic.StoreOptions{RESTOptions: optsGetter, AttrFunc: grafanaregistry.GetAttrs}
	if err := store.CompleteWithOptions(options); err != nil {
		return nil, err
	}
	return &unifiedStorage{Store: store}, nil
}
