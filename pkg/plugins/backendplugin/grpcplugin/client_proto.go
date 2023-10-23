package grpcplugin

import (
	"context"

	goplugin "github.com/hashicorp/go-plugin"
	"google.golang.org/grpc"

	"github.com/grafana/grafana-plugin-sdk-go/backend/grpcplugin"
	"github.com/grafana/grafana-plugin-sdk-go/genproto/pluginv2"

	"github.com/grafana/grafana/pkg/plugins/log"
)

var _ ProtoClient = (*protoClient)(nil)

type ProtoClient interface {
	grpcplugin.DiagnosticsClient
	grpcplugin.ResourceClient
	grpcplugin.DataClient
	grpcplugin.StreamClient

	PluginID() string
	Exit(context.Context) error
}

type protoClient struct {
	plugin *grpcPlugin
}

func NewProtoClient(pluginID, executablePath string, executableArgs ...string) (ProtoClient, error) {
	descriptor := PluginDescriptor{
		pluginID:       pluginID,
		executablePath: executablePath,
		executableArgs: executableArgs,
		managed:        true,
		versionedPlugins: map[int]goplugin.PluginSet{
			grpcplugin.ProtocolVersion: getV2PluginSet(),
		},
	}
	logger := log.New(descriptor.pluginID)
	p := &grpcPlugin{
		descriptor: descriptor,
		logger:     logger,
		clientFactory: func() *goplugin.Client {
			return goplugin.NewClient(newClientConfig(descriptor.executablePath, descriptor.executableArgs, []string{}, logger, descriptor.versionedPlugins))
		},
	}

	err := p.Start(context.Background())
	if err != nil {
		return nil, err
	}

	return &protoClient{plugin: p}, nil
}

func (r *protoClient) QueryData(ctx context.Context, in *pluginv2.QueryDataRequest, opts ...grpc.CallOption) (*pluginv2.QueryDataResponse, error) {
	return r.plugin.pluginClient.DataClient.QueryData(ctx, in, opts...)
}

func (r *protoClient) CallResource(ctx context.Context, in *pluginv2.CallResourceRequest, opts ...grpc.CallOption) (pluginv2.Resource_CallResourceClient, error) {
	return r.plugin.pluginClient.ResourceClient.CallResource(ctx, in, opts...)
}

func (r *protoClient) CheckHealth(ctx context.Context, in *pluginv2.CheckHealthRequest, opts ...grpc.CallOption) (*pluginv2.CheckHealthResponse, error) {
	return r.plugin.pluginClient.DiagnosticsClient.CheckHealth(ctx, in, opts...)
}

func (r *protoClient) CollectMetrics(ctx context.Context, in *pluginv2.CollectMetricsRequest, opts ...grpc.CallOption) (*pluginv2.CollectMetricsResponse, error) {
	return r.plugin.pluginClient.DiagnosticsClient.CollectMetrics(ctx, in, opts...)
}

func (r *protoClient) SubscribeStream(ctx context.Context, in *pluginv2.SubscribeStreamRequest, opts ...grpc.CallOption) (*pluginv2.SubscribeStreamResponse, error) {
	return r.plugin.pluginClient.StreamClient.SubscribeStream(ctx, in, opts...)
}

func (r *protoClient) RunStream(ctx context.Context, in *pluginv2.RunStreamRequest, opts ...grpc.CallOption) (pluginv2.Stream_RunStreamClient, error) {
	return r.plugin.pluginClient.StreamClient.RunStream(ctx, in, opts...)
}

func (r *protoClient) PublishStream(ctx context.Context, in *pluginv2.PublishStreamRequest, opts ...grpc.CallOption) (*pluginv2.PublishStreamResponse, error) {
	return r.plugin.pluginClient.StreamClient.PublishStream(ctx, in, opts...)
}

func (r *protoClient) PluginID() string {
	return r.plugin.descriptor.pluginID
}

func (r *protoClient) Exit(ctx context.Context) error {
	return r.plugin.Stop(ctx)
}
