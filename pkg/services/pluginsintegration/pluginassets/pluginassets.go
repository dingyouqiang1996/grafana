package pluginassets

import (
	"context"

	"github.com/Masterminds/semver/v3"

	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/plugins"
	"github.com/grafana/grafana/pkg/plugins/pluginscdn"
	"github.com/grafana/grafana/pkg/services/pluginsintegration/pluginstore"
	"github.com/grafana/grafana/pkg/setting"
)

const (
	createPluginVersionCfgKey        = "create_plugin_version"
	scriptLoadingCreatePluginVersion = "4.15.0"
)

var (
	scriptLoadingMinSupportedVersion = semver.MustParse(scriptLoadingCreatePluginVersion)
)

func ProvideService(cfg *setting.Cfg, cdn *pluginscdn.Service) *Service {
	return &Service{
		cfg: cfg,
		cdn: cdn,
		log: log.New("pluginassets"),
	}
}

type Service struct {
	cfg *setting.Cfg
	cdn *pluginscdn.Service
	log log.Logger
}

// LoadingStrategy calculates the loading strategy for a plugin.
// If a plugin has plugin setting `create_plugin_version` >= 4.15.0, set loadingStrategy to "script".
// If a plugin is not loaded via the CDN and is not Angular, set loadingStrategy to "script".
// Otherwise, set loadingStrategy to "fetch".
func (s *Service) LoadingStrategy(_ context.Context, p pluginstore.Plugin) plugins.LoadingStrategy {
	if pCfg, ok := s.cfg.PluginSettings[p.ID]; ok {
		if cpv, ok := pCfg[createPluginVersionCfgKey]; ok {
			createPluginVer, err := semver.NewVersion(cpv)
			if err != nil {
				s.log.Warn("Failed to parse create plugin version setting as semver", "pluginId", p.ID, "error", err)
			} else {
				if !createPluginVer.LessThan(scriptLoadingMinSupportedVersion) {
					return plugins.LoadingStrategyScript
				}
			}
		}
	}

	if !s.cdn.PluginSupported(p.ID) && p.Class != plugins.ClassCDN && !p.Angular.Detected {
		return plugins.LoadingStrategyScript
	}

	return plugins.LoadingStrategyFetch
}
