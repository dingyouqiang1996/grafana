// Package bootstrap defines the second stage of the plugin loader pipeline.
//
// The Bootstrap stage must implement the Bootstrapper interface.
// - Bootstrap(ctx context.Context, src plugins.PluginSource, bundles []*plugins.FoundBundle) ([]*plugins.Plugin, error)
//
// The Bootstrap stage is made up of the following steps (in order):
// - Construct: Create the initial plugin structs based on the plugin(s) found in the Discovery stage.
// - Decorate: Decorate the plugins with additional metadata.
//
// The Construct step is implemented by the ConstructFunc type.
// - func(ctx context.Context, src plugins.PluginSource, bundles []*plugins.FoundBundle) ([]*plugins.Plugin, error)
//
// The Decorate step is implemented by the DecorateFunc type.
// - func(ctx context.Context, src plugins.PluginSource, plugins []*plugins.Plugin) ([]*plugins.Plugin, error)

package bootstrap
