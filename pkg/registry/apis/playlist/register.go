package playlist

import (
	"fmt"
	"time"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/runtime/serializer"
	"k8s.io/apiserver/pkg/registry/generic"
	"k8s.io/apiserver/pkg/registry/rest"
	genericapiserver "k8s.io/apiserver/pkg/server"
	common "k8s.io/kube-openapi/pkg/common"

	playlist "github.com/grafana/grafana/pkg/apis/playlist/v0alpha1"
	grafanaapiserver "github.com/grafana/grafana/pkg/services/grafana-apiserver"
	"github.com/grafana/grafana/pkg/services/grafana-apiserver/endpoints/request"
	grafanarest "github.com/grafana/grafana/pkg/services/grafana-apiserver/rest"
	"github.com/grafana/grafana/pkg/services/grafana-apiserver/utils"
	playlistsvc "github.com/grafana/grafana/pkg/services/playlist"
	"github.com/grafana/grafana/pkg/setting"
)

// GroupName is the group name for this API.
const GroupName = "playlist.grafana.app"
const VersionID = "v0alpha1"

var _ grafanaapiserver.APIGroupBuilder = (*PlaylistAPIBuilder)(nil)

// This is used just so wire has something unique to return
type PlaylistAPIBuilder struct {
	service    playlistsvc.Service
	namespacer request.NamespaceMapper
	gv         schema.GroupVersion
}

func NewAPIService(p playlistsvc.Service,
	cfg *setting.Cfg,
) *PlaylistAPIBuilder {
	return &PlaylistAPIBuilder{
		service:    p,
		namespacer: request.GetNamespaceMapper(cfg),
		gv:         schema.GroupVersion{Group: GroupName, Version: VersionID},
	}
}

func RegisterAPIService(p playlistsvc.Service,
	apiregistration grafanaapiserver.APIRegistrar,
	cfg *setting.Cfg,
) *PlaylistAPIBuilder {
	builder := NewAPIService(p, cfg)
	apiregistration.RegisterAPI(builder)
	return builder
}

func (b *PlaylistAPIBuilder) GetGroupVersion() schema.GroupVersion {
	return b.gv
}

func (b *PlaylistAPIBuilder) InstallSchema(scheme *runtime.Scheme) error {
	scheme.AddKnownTypes(b.gv,
		&playlist.Playlist{},
		&playlist.PlaylistList{},
	)

	// Link this version to the internal representation.
	// This is used for server-side-apply (PATCH), and avoids the error:
	//   "no kind is registered for the type"
	scheme.AddKnownTypes(schema.GroupVersion{
		Group:   b.gv.Group,
		Version: runtime.APIVersionInternal,
	},
		&playlist.Playlist{},
		&playlist.PlaylistList{},
	)

	// If multiple versions exist, then register conversions from zz_generated.conversion.go
	// if err := playlist.RegisterConversions(scheme); err != nil {
	//   return err
	// }
	metav1.AddToGroupVersion(scheme, b.gv)
	return scheme.SetVersionPriority(b.gv)
}

func (b *PlaylistAPIBuilder) GetAPIGroupInfo(
	scheme *runtime.Scheme,
	codecs serializer.CodecFactory, // pointer?
	optsGetter generic.RESTOptionsGetter,
) (*genericapiserver.APIGroupInfo, error) {
	apiGroupInfo := genericapiserver.NewDefaultAPIGroupInfo(GroupName, scheme, metav1.ParameterCodec, codecs)
	storage := map[string]rest.Storage{}

	legacyStore := &legacyStorage{
		service:                   b.service,
		namespacer:                b.namespacer,
		DefaultQualifiedResource:  b.gv.WithResource("playlists").GroupResource(),
		SingularQualifiedResource: b.gv.WithResource("playlist").GroupResource(),
	}
	legacyStore.tableConverter = utils.NewTableConverter(
		legacyStore.DefaultQualifiedResource,
		[]metav1.TableColumnDefinition{
			{Name: "Name", Type: "string", Format: "name"},
			{Name: "Title", Type: "string", Format: "string", Description: "The playlist name"},
			{Name: "Interval", Type: "string", Format: "string", Description: "How often the playlist will update"},
			{Name: "Created At", Type: "date"},
		},
		func(obj any) ([]interface{}, error) {
			m, ok := obj.(*playlist.Playlist)
			if !ok {
				return nil, fmt.Errorf("expected playlist")
			}
			return []interface{}{
				m.Name,
				m.Spec.Title,
				m.Spec.Interval,
				m.CreationTimestamp.UTC().Format(time.RFC3339),
			}, nil
		},
	)
	storage["playlists"] = legacyStore

	// enable dual writes if a RESTOptionsGetter is provided
	if optsGetter != nil {
		store, err := newStorage(scheme, optsGetter, legacyStore)
		if err != nil {
			return nil, err
		}
		storage["playlists"] = grafanarest.NewDualWriter(legacyStore, store)
	}

	apiGroupInfo.VersionedResourcesStorageMap[VersionID] = storage
	return &apiGroupInfo, nil
}

func (b *PlaylistAPIBuilder) GetOpenAPIDefinitions() common.GetOpenAPIDefinitions {
	return playlist.GetOpenAPIDefinitions
}

func (b *PlaylistAPIBuilder) GetAPIRoutes() *grafanaapiserver.APIRoutes {
	return nil // no custom API routes
}
