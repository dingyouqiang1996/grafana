package utils

import (
	"slices"
	"strings"

	"github.com/urfave/cli/v2"

	"github.com/grafana/grafana/pkg/cmd/grafana-cli/logger"
	"github.com/grafana/grafana/pkg/cmd/grafana-cli/models"
	"github.com/grafana/grafana/pkg/setting"
)

type CommandLine interface {
	ShowHelp() error
	ShowVersion()
	Application() *cli.App
	Args() cli.Args
	Bool(name string) bool
	Int(name string) int
	String(name string) string
	StringSlice(name string) []string
	FlagNames() (names []string)
	Generic(name string) any

	PluginDirectory() string
	PluginRepoURL() string
	PluginURL() string
}

type ApiClient interface {
	GetPlugin(pluginId, repoUrl string) (models.Plugin, error)
	ListAllPlugins(repoUrl string) (models.PluginRepo, error)
}

type ContextCommandLine struct {
	*cli.Context
}

func (c *ContextCommandLine) ShowHelp() error {
	return cli.ShowCommandHelp(c.Context, c.Command.Name)
}

func (c *ContextCommandLine) ShowVersion() {
	cli.ShowVersion(c.Context)
}

func (c *ContextCommandLine) Application() *cli.App {
	return c.App
}

func (c *ContextCommandLine) HomePath() string { return c.String("homepath") }

func (c *ContextCommandLine) ConfigFile() string { return c.String("config") }

func (c *ContextCommandLine) PluginDirectory() string {
	return c.String("pluginsDir")
}

func (c *ContextCommandLine) PluginRepoURL() string {
	if c.ConfigFile() != "" && !slices.Contains(c.FlagNames(), "repo") {
		configOptions := strings.Split(c.String("configOverrides"), " ")
		cfg, err := setting.NewCfgFromArgs(setting.CommandLineArgs{
			Config:   c.ConfigFile(),
			HomePath: c.HomePath(),
			Args:     append(configOptions, c.Args().Slice()...),
		})

		if err != nil {
			logger.Debug("Could not parse config file", err)
		} else if cfg.GrafanaComAPIURL != "" {
			return cfg.GrafanaComAPIURL + "/plugins"
		}
	}
	return c.String("repo")
}

func (c *ContextCommandLine) PluginURL() string {
	return c.String("pluginUrl")
}
