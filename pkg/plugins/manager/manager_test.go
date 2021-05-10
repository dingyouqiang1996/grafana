package manager

import (
	"context"
	"errors"
	"fmt"
	"path/filepath"
	"reflect"
	"strings"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/plugins"
	"github.com/grafana/grafana/pkg/plugins/backendplugin"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gopkg.in/ini.v1"
)

func TestPluginManager_Init(t *testing.T) {
	t.Run("Base case (core + bundled plugins)", func(t *testing.T) {
		staticRootPath, err := filepath.Abs("../../../public")
		require.NoError(t, err)
		bundledPluginsPath, err := filepath.Abs("../../../plugins-bundled/internal")
		require.NoError(t, err)

		pm := createManager(t, func(pm *PluginManager) {
			pm.Cfg.PluginsPath = ""
			pm.Cfg.BundledPluginsPath = bundledPluginsPath
			pm.Cfg.StaticRootPath = staticRootPath
		})
		err = pm.Init()
		require.NoError(t, err)

		assert.Empty(t, pm.scanningErrors)
		assert.Len(t, pm.Plugins(), 45)
		assert.Len(t, pm.DataSources(), 21)
		assert.Len(t, pm.Panels(), 24)
		assert.Len(t, pm.Apps(), 0)

		assert.Len(t, pm.StaticRoutes(), 1)
		assert.Equal(t, "input", pm.StaticRoutes()[0].PluginId)
		assert.True(t, strings.HasPrefix(pm.StaticRoutes()[0].Directory, bundledPluginsPath+"/input-datasource/"))
	})

	t.Run("Base case with single external plugin", func(t *testing.T) {
		pm := createManager(t, func(pm *PluginManager) {
			pm.Cfg.PluginSettings = setting.PluginSettings{
				"nginx-app": map[string]string{
					"path": "testdata/test-app",
				},
			}
		})
		err := pm.Init()
		require.NoError(t, err)

		assert.Empty(t, pm.scanningErrors)
		assert.NotEmpty(t, pm.dataSources)
		assert.NotEmpty(t, pm.panels)
		assert.NotEmpty(t, pm.apps)
		assert.Equal(t, "app/plugins/datasource/graphite/module", pm.dataSources["graphite"].Module)
		assert.Equal(t, "public/plugins/test-app/img/logo_large.png", pm.apps["test-app"].Info.Logos.Large)
		assert.Equal(t, "public/plugins/test-app/img/screenshot2.png", pm.apps["test-app"].Info.Screenshots[1].Path)
	})

	t.Run("With external back-end plugin lacking signature", func(t *testing.T) {
		pm := createManager(t, func(pm *PluginManager) {
			pm.Cfg.PluginsPath = "testdata/unsigned"
		})
		err := pm.Init()
		require.NoError(t, err)
	})

	t.Run("With external unsigned back-end plugin and configuration disabling signature check of this plugin", func(t *testing.T) {
		pm := createManager(t, func(pm *PluginManager) {
			pm.Cfg.PluginsPath = "testdata/unsigned"
			pm.Cfg.PluginsAllowUnsigned = []string{"test"}
		})
		err := pm.Init()
		require.NoError(t, err)

		assert.Empty(t, pm.scanningErrors)
	})

	t.Run("With external back-end plugin with invalid v1 signature", func(t *testing.T) {
		pm := createManager(t, func(pm *PluginManager) {
			pm.Cfg.PluginsPath = "testdata/invalid-v1-signature"
		})
		err := pm.Init()
		require.NoError(t, err)

		assert.Equal(t, []error{fmt.Errorf(`plugin "test" has an invalid signature`)}, pm.scanningErrors)
	})

	t.Run("With external back-end plugin lacking files listed in manifest", func(t *testing.T) {
		fm := &fakeBackendPluginManager{}
		pm := createManager(t, func(pm *PluginManager) {
			pm.Cfg.PluginsPath = "testdata/lacking-files"
			pm.BackendPluginManager = fm
		})
		err := pm.Init()
		require.NoError(t, err)

		assert.Equal(t, []error{fmt.Errorf(`plugin "test"'s signature has been modified`)}, pm.scanningErrors)
	})

	t.Run("Transform plugins should be ignored when expressions feature is off", func(t *testing.T) {
		fm := fakeBackendPluginManager{}
		pm := createManager(t, func(pm *PluginManager) {
			pm.Cfg.PluginsPath = "testdata/behind-feature-flag"
			pm.BackendPluginManager = &fm
		})
		err := pm.Init()
		require.NoError(t, err)

		assert.Empty(t, pm.scanningErrors)
		assert.Empty(t, fm.registeredPlugins)
	})

	t.Run("With nested plugin duplicating parent", func(t *testing.T) {
		pm := createManager(t, func(pm *PluginManager) {
			pm.Cfg.PluginsPath = "testdata/duplicate-plugins"
		})
		err := pm.Init()
		require.NoError(t, err)

		assert.Len(t, pm.scanningErrors, 1)
		assert.True(t, errors.Is(pm.scanningErrors[0], plugins.DuplicatePluginError{}))
	})

	t.Run("With external back-end plugin with valid v2 signature", func(t *testing.T) {
		pluginsDir := "testdata/valid-v2-signature"
		pluginFolder := pluginsDir + "/plugin"
		pm := createManager(t, func(manager *PluginManager) {
			manager.Cfg.PluginsPath = pluginsDir
		})
		err := pm.Init()
		require.NoError(t, err)
		require.Empty(t, pm.scanningErrors)

		// capture manager plugin state
		datasources := pm.dataSources
		panels := pm.panels
		apps := pm.apps

		verifyPluginManagerState := func() {
			// verify plugin manager has loaded core plugins successfully
			assert.Empty(t, pm.scanningErrors)
			assert.Len(t, pm.Plugins(), 45)
			assert.Len(t, datasources, 21)
			assert.Len(t, panels, 24)
			assert.Len(t, apps, 0)

			// verify plugin has been loaded successfully
			const pluginID = "test"

			assert.NotNil(t, pm.plugins[pluginID])
			assert.Equal(t, "datasource", pm.plugins[pluginID].Type)
			assert.Equal(t, "Test", pm.plugins[pluginID].Name)
			assert.Equal(t, pluginID, pm.plugins[pluginID].Id)
			assert.Equal(t, "1.0.0", pm.plugins[pluginID].Info.Version)
			assert.Equal(t, plugins.PluginSignatureValid, pm.plugins[pluginID].Signature)
			assert.Equal(t, plugins.GrafanaType, pm.plugins[pluginID].SignatureType)
			assert.Equal(t, "Grafana Labs", pm.plugins[pluginID].SignatureOrg)
			assert.Equal(t, pluginFolder, pm.plugins[pluginID].PluginDir)
			assert.False(t, pm.plugins[pluginID].IsCorePlugin)

			ds := pm.GetDataSource(pluginID)
			assert.NotNil(t, ds)
			assert.Equal(t, pluginID, ds.Id)
			assert.Equal(t, pm.plugins[pluginID], &ds.FrontendPluginBase.PluginBase)

			assert.Len(t, pm.StaticRoutes(), 1)
			assert.Equal(t, pluginID, pm.StaticRoutes()[0].PluginId)
			assert.Equal(t, pluginFolder, pm.StaticRoutes()[0].Directory)
		}

		verifyPluginManagerState()

		t.Run("Re-initializing external plugins is idempotent", func(t *testing.T) {
			err = pm.initExternalPlugins()
			require.NoError(t, err)

			verifyPluginManagerState()

			// verify plugin state remains the same as previous
			assert.Empty(t, pm.scanningErrors)
			assert.True(t, reflect.DeepEqual(datasources, pm.dataSources))
			assert.True(t, reflect.DeepEqual(panels, pm.panels))
			assert.True(t, reflect.DeepEqual(apps, pm.apps))
		})
	})

	t.Run("With back-end plugin with invalid v2 private signature (mismatched root URL)", func(t *testing.T) {
		origAppURL := setting.AppUrl
		t.Cleanup(func() {
			setting.AppUrl = origAppURL
		})
		setting.AppUrl = "http://localhost:1234"

		pm := createManager(t, func(pm *PluginManager) {
			pm.Cfg.PluginsPath = "testdata/valid-v2-pvt-signature"
		})
		err := pm.Init()
		require.NoError(t, err)

		assert.Equal(t, []error{fmt.Errorf(`plugin "test" has an invalid signature`)}, pm.scanningErrors)
		assert.Nil(t, pm.plugins[("test")])
	})

	t.Run("With back-end plugin with valid v2 private signature", func(t *testing.T) {
		origAppURL := setting.AppUrl
		t.Cleanup(func() {
			setting.AppUrl = origAppURL
		})
		setting.AppUrl = "http://localhost:3000/"

		pm := createManager(t, func(pm *PluginManager) {
			pm.Cfg.PluginsPath = "testdata/valid-v2-pvt-signature"
		})
		err := pm.Init()
		require.NoError(t, err)
		require.Empty(t, pm.scanningErrors)

		const pluginID = "test"
		assert.NotNil(t, pm.plugins[pluginID])
		assert.Equal(t, "datasource", pm.plugins[pluginID].Type)
		assert.Equal(t, "Test", pm.plugins[pluginID].Name)
		assert.Equal(t, pluginID, pm.plugins[pluginID].Id)
		assert.Equal(t, "1.0.0", pm.plugins[pluginID].Info.Version)
		assert.Equal(t, plugins.PluginSignatureValid, pm.plugins[pluginID].Signature)
		assert.Equal(t, plugins.PrivateType, pm.plugins[pluginID].SignatureType)
		assert.Equal(t, "Will Browne", pm.plugins[pluginID].SignatureOrg)
		assert.False(t, pm.plugins[pluginID].IsCorePlugin)
	})

	t.Run("With back-end plugin with modified v2 signature (missing file from plugin dir)", func(t *testing.T) {
		origAppURL := setting.AppUrl
		t.Cleanup(func() {
			setting.AppUrl = origAppURL
		})
		setting.AppUrl = "http://localhost:3000/"

		pm := createManager(t, func(pm *PluginManager) {
			pm.Cfg.PluginsPath = "testdata/invalid-v2-signature"
		})
		err := pm.Init()
		require.NoError(t, err)
		assert.Equal(t, []error{fmt.Errorf(`plugin "test"'s signature has been modified`)}, pm.scanningErrors)
		assert.Nil(t, pm.plugins[("test")])
	})

	t.Run("With back-end plugin with modified v2 signature (unaccounted file in plugin dir)", func(t *testing.T) {
		origAppURL := setting.AppUrl
		t.Cleanup(func() {
			setting.AppUrl = origAppURL
		})
		setting.AppUrl = "http://localhost:3000/"

		pm := createManager(t, func(pm *PluginManager) {
			pm.Cfg.PluginsPath = "testdata/invalid-v2-signature-2"
		})
		err := pm.Init()
		require.NoError(t, err)
		assert.Equal(t, []error{fmt.Errorf(`plugin "test"'s signature has been modified`)}, pm.scanningErrors)
		assert.Nil(t, pm.plugins[("test")])
	})
}

func TestPluginManager_IsBackendOnlyPlugin(t *testing.T) {
	pluginScanner := &PluginScanner{}

	type testCase struct {
		name          string
		isBackendOnly bool
	}

	for _, c := range []testCase{
		{name: "renderer", isBackendOnly: true},
		{name: "app", isBackendOnly: false},
	} {
		t.Run(fmt.Sprintf("Plugin %s", c.name), func(t *testing.T) {
			result := pluginScanner.IsBackendOnlyPlugin(c.name)

			assert.Equal(t, c.isBackendOnly, result)
		})
	}
}

func TestPluginManager_Installer(t *testing.T) {
	t.Run("Install plugin after manager init", func(t *testing.T) {
		fm := &fakeBackendPluginManager{}
		pm := createManager(t, func(pm *PluginManager) {
			pm.BackendPluginManager = fm
		})

		err := pm.Init()
		require.NoError(t, err)

		// mock installer
		installer := &fakePluginInstaller{}
		pm.pluginInstaller = installer

		// Set plugin location (we do this after manager Init() so that
		// it doesn't install the plugin automatically)
		pm.Cfg.PluginsPath = "testdata/installer"

		pluginID := "test"
		pluginFolder := pm.Cfg.PluginsPath + "/plugin"

		err = pm.Install(pluginID, "1.0.0")
		require.NoError(t, err)

		assert.Equal(t, 1, installer.installCount)
		assert.Equal(t, 0, installer.uninstallCount)

		// verify plugin manager has loaded core plugins successfully
		assert.Empty(t, pm.scanningErrors)
		assert.Len(t, pm.Plugins(), 45)
		assert.Len(t, pm.DataSources(), 21)
		assert.Len(t, pm.Panels(), 24)
		assert.Len(t, pm.Apps(), 0)

		// verify plugin has been loaded successfully
		assert.NotNil(t, pm.plugins[pluginID])
		assert.Equal(t, "datasource", pm.plugins[pluginID].Type)
		assert.Equal(t, "Test", pm.plugins[pluginID].Name)
		assert.Equal(t, pluginID, pm.plugins[pluginID].Id)
		assert.Equal(t, "1.0.0", pm.plugins[pluginID].Info.Version)
		assert.Equal(t, plugins.PluginSignatureValid, pm.plugins[pluginID].Signature)
		assert.Equal(t, plugins.GrafanaType, pm.plugins[pluginID].SignatureType)
		assert.Equal(t, "Grafana Labs", pm.plugins[pluginID].SignatureOrg)
		assert.Equal(t, pluginFolder, pm.plugins[pluginID].PluginDir)
		assert.False(t, pm.plugins[pluginID].IsCorePlugin)

		ds := pm.GetDataSource(pluginID)
		assert.NotNil(t, ds)
		assert.Equal(t, pluginID, ds.Id)
		assert.Equal(t, pm.plugins[pluginID], &ds.FrontendPluginBase.PluginBase)

		assert.Len(t, pm.StaticRoutes(), 1)
		assert.Equal(t, pluginID, pm.StaticRoutes()[0].PluginId)
		assert.Equal(t, pluginFolder, pm.StaticRoutes()[0].Directory)

		t.Run("Won't install if already installed", func(t *testing.T) {
			err := pm.Install(pluginID, "1.0.0")
			require.Equal(t, plugins.DuplicatePluginError{
				PluginID:          pluginID,
				ExistingPluginDir: pluginFolder,
			}, err)
		})

		t.Run("Uninstall base case", func(t *testing.T) {
			err := pm.Uninstall(pluginID)
			require.NoError(t, err)

			assert.Equal(t, 1, installer.installCount)
			assert.Equal(t, 1, installer.uninstallCount)

			assert.Nil(t, pm.GetDataSource(pluginID))
			assert.Nil(t, pm.GetPlugin(pluginID))
			assert.Len(t, pm.StaticRoutes(), 0)

			t.Run("Won't uninstall if not installed", func(t *testing.T) {
				err := pm.Uninstall(pluginID)
				require.Equal(t, plugins.PluginNotFoundError{
					PluginID: pluginID,
				}, err)
			})
		})
	})
}

type fakeBackendPluginManager struct {
	backendplugin.Manager

	registeredPlugins []string
}

func (f *fakeBackendPluginManager) RegisterAndStart(pluginID string, factory backendplugin.PluginFactoryFunc) error {
	f.registeredPlugins = append(f.registeredPlugins, pluginID)
	return nil
}

func (f *fakeBackendPluginManager) UnregisterAndStop(pluginID string) error {
	var result []string

	for _, existingPlugin := range f.registeredPlugins {
		if pluginID != existingPlugin {
			result = append(result, pluginID)
		}
	}

	f.registeredPlugins = result
	return nil
}

func (f *fakeBackendPluginManager) Registered(pluginID string) bool {
	for _, existingPlugin := range f.registeredPlugins {
		if pluginID == existingPlugin {
			return true
		}
	}
	return false
}

func (f *fakeBackendPluginManager) StartPlugin(ctx context.Context, pluginID string) error {
	return nil
}

func (f *fakeBackendPluginManager) CollectMetrics(ctx context.Context, pluginID string) (*backend.CollectMetricsResult, error) {
	return nil, nil
}

func (f *fakeBackendPluginManager) CheckHealth(ctx context.Context, pCtx backend.PluginContext) (*backend.CheckHealthResult, error) {
	return nil, nil
}

func (f *fakeBackendPluginManager) CallResource(pluginConfig backend.PluginContext, ctx *models.ReqContext, path string) {
}

type fakePluginInstaller struct {
	installCount   int
	uninstallCount int
}

func (f *fakePluginInstaller) Install(pluginID, version, pluginsDirectory, pluginZipURL, pluginRepoURL string) error {
	f.installCount++
	return nil
}

func (f *fakePluginInstaller) Uninstall(pluginID, pluginPath string) error {
	f.uninstallCount++
	return nil
}

func createManager(t *testing.T, cbs ...func(*PluginManager)) *PluginManager {
	t.Helper()

	staticRootPath, err := filepath.Abs("../../../public/")
	require.NoError(t, err)

	pm := newManager(&setting.Cfg{
		Raw:            ini.Empty(),
		Env:            setting.Prod,
		StaticRootPath: staticRootPath,
	})
	pm.BackendPluginManager = &fakeBackendPluginManager{}
	for _, cb := range cbs {
		cb(pm)
	}

	return pm
}
