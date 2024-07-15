// SPDX-License-Identifier: AGPL-3.0-only
// Provenance-includes-location: https://github.com/kubernetes/kubernetes/blob/master/staging/src/k8s.io/apiserver/pkg/storage/etcd3/watcher_test.go
// Provenance-includes-license: Apache-2.0
// Provenance-includes-copyright: The Kubernetes Authors.

package file

import (
	"context"
	"fmt"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gocloud.dev/blob/fileblob"
	"gocloud.dev/blob/memblob"
	"k8s.io/apimachinery/pkg/api/apitesting"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/runtime/serializer"
	utilruntime "k8s.io/apimachinery/pkg/util/runtime"
	"k8s.io/apiserver/pkg/apis/example"
	examplev1 "k8s.io/apiserver/pkg/apis/example/v1"
	"k8s.io/apiserver/pkg/storage"
	"k8s.io/apiserver/pkg/storage/storagebackend"
	"k8s.io/apiserver/pkg/storage/storagebackend/factory"

	storagetesting "github.com/grafana/grafana/pkg/apiserver/storage/testing"
	"github.com/grafana/grafana/pkg/storage/unified/resource"
)

var scheme = runtime.NewScheme()
var codecs = serializer.NewCodecFactory(scheme)

func init() {
	metav1.AddToGroupVersion(scheme, metav1.SchemeGroupVersion)
	utilruntime.Must(example.AddToScheme(scheme))
	utilruntime.Must(examplev1.AddToScheme(scheme))
}

type setupOptions struct {
	codec          runtime.Codec
	newFunc        func() runtime.Object
	newListFunc    func() runtime.Object
	prefix         string
	resourcePrefix string
	groupResource  schema.GroupResource
}

type setupOption func(*setupOptions, testing.TB)

func withDefaults(options *setupOptions, t testing.TB) {
	options.codec = apitesting.TestCodec(codecs, examplev1.SchemeGroupVersion)
	options.newFunc = newPod
	options.newListFunc = newPodList
	options.prefix = t.TempDir()
	options.resourcePrefix = storagetesting.KeyFunc("", "")
	options.groupResource = schema.GroupResource{Resource: "pods"}
}

var _ setupOption = withDefaults

func testSetup(t testing.TB, opts ...setupOption) (context.Context, storage.Interface, factory.DestroyFunc, error) {
	setupOpts := setupOptions{}
	opts = append([]setupOption{withDefaults}, opts...)
	for _, opt := range opts {
		opt(&setupOpts, t)
	}

	setupOpts.groupResource = schema.GroupResource{
		Group:    "example.apiserver.k8s.io",
		Resource: "pods",
	}

	bucket := memblob.OpenBucket(nil)
	if true {
		tmp, err := os.MkdirTemp("", "xxx-*")
		require.NoError(t, err)

		bucket, err = fileblob.OpenBucket(tmp, &fileblob.Options{
			CreateDir: true,
			Metadata:  fileblob.MetadataDontWrite, // skip
		})
		require.NoError(t, err)
		fmt.Printf("ROOT: %s\n\n", tmp)
	}
	ctx := storagetesting.NewContext()
	backend, err := resource.NewCDKBackend(ctx, resource.CDKBackendOptions{
		Bucket: bucket,
	})
	require.NoError(t, err)

	server, err := resource.NewResourceServer(resource.ResourceServerOptions{
		Backend: backend,
	})
	require.NoError(t, err)
	client := resource.NewLocalResourceStoreClient(server)

	config := storagebackend.NewDefaultConfig(setupOpts.prefix, setupOpts.codec)
	store, destroyFunc, err := NewStorage(
		config.ForResource(setupOpts.groupResource),
		client,
		func(obj runtime.Object) (string, error) {
			accessor, err := meta.Accessor(obj)
			if err != nil {
				return "", err
			}
			return storagetesting.KeyFunc(accessor.GetNamespace(), accessor.GetName()), nil
		},
		testKeyParser, // will fallback to hardcoded /pods/... keys
		setupOpts.newFunc,
		setupOpts.newListFunc,
		storage.DefaultNamespaceScopedAttr,
		make(map[string]storage.IndexerFunc, 0),
		nil,
	)
	if err != nil {
		return nil, nil, nil, err
	}
	return ctx, store, destroyFunc, nil
}

func TestWatch(t *testing.T) {
	ctx, store, destroyFunc, err := testSetup(t)
	defer destroyFunc()
	assert.NoError(t, err)
	storagetesting.RunTestWatch(ctx, t, store)
}

func TestClusterScopedWatch(t *testing.T) {
	ctx, store, destroyFunc, err := testSetup(t)
	defer destroyFunc()
	assert.NoError(t, err)
	storagetesting.RunTestClusterScopedWatch(ctx, t, store)
}

func TestNamespaceScopedWatch(t *testing.T) {
	ctx, store, destroyFunc, err := testSetup(t)
	defer destroyFunc()
	assert.NoError(t, err)
	storagetesting.RunTestNamespaceScopedWatch(ctx, t, store)
}

func TestDeleteTriggerWatch(t *testing.T) {
	ctx, store, destroyFunc, err := testSetup(t)
	defer destroyFunc()
	assert.NoError(t, err)
	storagetesting.RunTestDeleteTriggerWatch(ctx, t, store)
}

func TestWatchFromZero(t *testing.T) {
	ctx, store, destroyFunc, err := testSetup(t)
	defer destroyFunc()
	assert.NoError(t, err)
	storagetesting.RunTestWatchFromZero(ctx, t, store, nil)
}

// TestWatchFromNonZero tests that
// - watch from non-0 should just watch changes after given version
func TestWatchFromNonZero(t *testing.T) {
	ctx, store, destroyFunc, err := testSetup(t)
	defer destroyFunc()
	assert.NoError(t, err)
	storagetesting.RunTestWatchFromNonZero(ctx, t, store)
}

func TestDelayedWatchDelivery(t *testing.T) {
	ctx, store, destroyFunc, err := testSetup(t)
	defer destroyFunc()
	assert.NoError(t, err)
	storagetesting.RunTestDelayedWatchDelivery(ctx, t, store)
}

// func TestWatchError(t *testing.T) {
// 	ctx, store, _, _ := testSetup(t)
// 	storagetesting.RunTestWatchError(ctx, t, &storeWithPrefixTransformer{store})
// }

func TestWatchContextCancel(t *testing.T) {
	ctx, store, destroyFunc, err := testSetup(t)
	defer destroyFunc()
	assert.NoError(t, err)
	storagetesting.RunTestWatchContextCancel(ctx, t, store)
}

func TestWatcherTimeout(t *testing.T) {
	ctx, store, destroyFunc, err := testSetup(t)
	defer destroyFunc()
	assert.NoError(t, err)
	storagetesting.RunTestWatcherTimeout(ctx, t, store)
}

func TestWatchDeleteEventObjectHaveLatestRV(t *testing.T) {
	ctx, store, destroyFunc, err := testSetup(t)
	defer destroyFunc()
	assert.NoError(t, err)
	storagetesting.RunTestWatchDeleteEventObjectHaveLatestRV(ctx, t, store)
}

// TODO: enable when we support flow control and priority fairness
/* func TestWatchInitializationSignal(t *testing.T) {
	ctx, store, destroyFunc, err := testSetup(t)
	defer destroyFunc()
	assert.NoError(t, err)
	storagetesting.RunTestWatchInitializationSignal(ctx, t, store)
} */

/* func TestProgressNotify(t *testing.T) {
	ctx, store, destroyFunc, err := testSetup(t)
	defer destroyFunc()
	assert.NoError(t, err)
	storagetesting.RunOptionalTestProgressNotify(ctx, t, store)
} */

// TestWatchDispatchBookmarkEvents makes sure that
// setting allowWatchBookmarks query param against
// etcd implementation doesn't have any effect.
func TestWatchDispatchBookmarkEvents(t *testing.T) {
	ctx, store, destroyFunc, err := testSetup(t)
	defer destroyFunc()
	assert.NoError(t, err)
	storagetesting.RunTestWatchDispatchBookmarkEvents(ctx, t, store, false)
}

func TestSendInitialEventsBackwardCompatibility(t *testing.T) {
	ctx, store, destroyFunc, err := testSetup(t)
	defer destroyFunc()
	assert.NoError(t, err)
	storagetesting.RunSendInitialEventsBackwardCompatibility(ctx, t, store)
}

func TestEtcdWatchSemantics(t *testing.T) {
	ctx, store, destroyFunc, err := testSetup(t)
	defer destroyFunc()
	assert.NoError(t, err)
	storagetesting.RunWatchSemantics(ctx, t, store)
}

func TestEtcdWatchSemanticInitialEventsExtended(t *testing.T) {
	ctx, store, destroyFunc, err := testSetup(t)
	defer destroyFunc()
	assert.NoError(t, err)
	storagetesting.RunWatchSemanticInitialEventsExtended(ctx, t, store)
}

func newPod() runtime.Object {
	return &example.Pod{}
}

func newPodList() runtime.Object {
	return &example.PodList{}
}
