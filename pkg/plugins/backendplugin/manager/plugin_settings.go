package manager

import (
	"fmt"
	"strings"
)

type pluginSettings map[string]string

func (ps pluginSettings) ToEnv(prefix string, hostEnv []string) []string {
	env := []string{}
	for k, v := range ps {
		env = append(env, fmt.Sprintf("%s_%s=%s", prefix, strings.ToUpper(k), v))
	}

	env = append(env, hostEnv...)

	return env
}

func (m *manager) extractPluginSettings() {
	if m.pluginSettings != nil {
		return
	}

	psMap := map[string]pluginSettings{}
	for pluginID, settings := range m.Cfg.PluginSettings {
		ps := pluginSettings{}
		for k, v := range settings {
			if k == "path" || strings.ToLower(k) == "id" {
				continue
			}

			ps[k] = v
		}

		psMap[pluginID] = ps
	}

	m.pluginSettings = psMap
}
