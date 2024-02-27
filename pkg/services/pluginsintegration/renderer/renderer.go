package renderer

import (
	"context"
	"errors"

	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/plugins"
	"github.com/grafana/grafana/pkg/plugins/backendplugin/pluginextensionv2"
	"github.com/grafana/grafana/pkg/plugins/backendplugin/provider"
	pluginscfg "github.com/grafana/grafana/pkg/plugins/config"
	"github.com/grafana/grafana/pkg/plugins/envvars"
	"github.com/grafana/grafana/pkg/plugins/manager/loader"
	"github.com/grafana/grafana/pkg/plugins/manager/pipeline/bootstrap"
	"github.com/grafana/grafana/pkg/plugins/manager/pipeline/discovery"
	"github.com/grafana/grafana/pkg/plugins/manager/pipeline/initialization"
	"github.com/grafana/grafana/pkg/plugins/manager/pipeline/termination"
	"github.com/grafana/grafana/pkg/plugins/manager/pipeline/validation"
	"github.com/grafana/grafana/pkg/plugins/manager/registry"
	"github.com/grafana/grafana/pkg/plugins/manager/signature"
	"github.com/grafana/grafana/pkg/plugins/manager/sources"
	"github.com/grafana/grafana/pkg/services/pluginsintegration/pipeline"
	"github.com/grafana/grafana/pkg/services/rendering"
	"github.com/grafana/grafana/pkg/setting"
)

func ProvideService(cfg *setting.Cfg, pCfg *pluginscfg.PluginManagementCfg, pluginEnvProvider envvars.Provider, registry registry.Service,
	licensing plugins.Licensing) (*Manager, error) {
	l, err := createLoader(cfg, pCfg, pluginEnvProvider, registry, licensing)
	if err != nil {
		return nil, err
	}

	return NewManager(cfg, l), nil
}

type Manager struct {
	cfg    *setting.Cfg
	loader loader.Service
	log    log.Logger

	renderer *Plugin
}

func NewManager(cfg *setting.Cfg, loader loader.Service) *Manager {
	return &Manager{
		cfg:    cfg,
		loader: loader,
		log:    log.New("renderer.manager"),
	}
}

type Plugin struct {
	plugin *plugins.Plugin

	started bool
}

func (p *Plugin) Client() (pluginextensionv2.RendererPlugin, error) {
	if !p.started {
		return nil, errors.New("renderer plugin not started")
	}

	if p.plugin.Renderer == nil {
		return nil, errors.New("renderer client not available")
	}

	return p.plugin.Renderer, nil
}

func (p *Plugin) Start(ctx context.Context) error {
	p.started = true
	return p.plugin.Start(ctx)
}

func (p *Plugin) Version() string {
	return p.plugin.JSONData.Info.Version
}

func (m *Manager) Renderer(ctx context.Context) (rendering.Plugin, bool) {
	if m.renderer != nil {
		return m.renderer, true
	}

	srcs, err := sources.DirAsLocalSources(m.cfg.PluginsPath, plugins.ClassExternal)
	if err != nil {
		m.log.Error("Failed to get renderer plugin sources", "error", err)
		return nil, false
	}

	for _, src := range srcs {
		ps, err := m.loader.Load(ctx, src)
		if err != nil {
			m.log.Error("Failed to load renderer plugin", "error", err)
			return nil, false
		}

		if len(ps) >= 1 {
			m.renderer = &Plugin{plugin: ps[0]}
			return m.renderer, true
		}
	}

	return nil, false
}

func createLoader(cfg *setting.Cfg, pCfg *pluginscfg.PluginManagementCfg, pluginEnvProvider envvars.Provider,
	pr registry.Service, l plugins.Licensing) (loader.Service, error) {
	d := discovery.New(pCfg, discovery.Opts{
		FindFilterFuncs: []discovery.FindFilterFunc{
			discovery.NewPermittedPluginTypesFilterStep([]plugins.Type{plugins.TypeRenderer}),
			func(ctx context.Context, class plugins.Class, bundles []*plugins.FoundBundle) ([]*plugins.FoundBundle, error) {
				return pipeline.NewDuplicatePluginIDFilterStep(pr).Filter(ctx, bundles)
			},
		},
	})
	b := bootstrap.New(pCfg, bootstrap.Opts{
		DecorateFuncs: []bootstrap.DecorateFunc{}, // no decoration required
	})
	v := validation.New(pCfg, validation.Opts{
		ValidateFuncs: []validation.ValidateFunc{
			validation.SignatureValidationStep(signature.NewValidator(signature.NewUnsignedAuthorizer(pCfg))),
		},
	})
	i := initialization.New(pCfg, initialization.Opts{
		InitializeFuncs: []initialization.InitializeFunc{
			initialization.BackendClientInitStep(pluginEnvProvider, provider.New(provider.RendererProvider)),
			initialization.PluginRegistrationStep(pr),
		},
	})
	t, err := termination.New(pCfg, termination.Opts{
		TerminateFuncs: []termination.TerminateFunc{
			termination.DeregisterStep(pr),
		},
	})
	if err != nil {
		return nil, err
	}

	return loader.New(d, b, v, i, t), nil
}
