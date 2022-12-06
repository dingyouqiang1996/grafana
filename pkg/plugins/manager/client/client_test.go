package client

import (
	"context"
	"errors"
	"fmt"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/plugins"
	"github.com/grafana/grafana/pkg/plugins/backendplugin"
	"github.com/grafana/grafana/pkg/plugins/config"
	"github.com/grafana/grafana/pkg/plugins/manager/fakes"
	"github.com/grafana/grafana/pkg/services/auth/jwt"
	"github.com/grafana/grafana/pkg/services/user"
	"github.com/stretchr/testify/require"
)

func TestQueryData(t *testing.T) {
	t.Run("Empty registry should return not registered error", func(t *testing.T) {
		registry := fakes.NewFakePluginRegistry()
		pluginAuth := &fakeJWTAuth{}
		client := ProvideService(registry, &config.Cfg{}, pluginAuth)
		_, err := client.QueryData(context.Background(), &backend.QueryDataRequest{})
		require.Error(t, err)
		require.ErrorIs(t, err, plugins.ErrPluginNotRegistered)
	})

	t.Run("Non-empty registry", func(t *testing.T) {
		tcs := []struct {
			err           error
			expectedError error
		}{
			{
				err:           backendplugin.ErrPluginUnavailable,
				expectedError: plugins.ErrPluginUnavailable,
			},
			{
				err:           backendplugin.ErrMethodNotImplemented,
				expectedError: plugins.ErrMethodNotImplemented,
			},
			{
				err:           errors.New("surprise surprise"),
				expectedError: plugins.ErrPluginDownstreamError,
			},
		}

		for _, tc := range tcs {
			t.Run(fmt.Sprintf("Plugin client error %q should return expected error", tc.err), func(t *testing.T) {
				registry := fakes.NewFakePluginRegistry()
				p := &plugins.Plugin{
					JSONData: plugins.JSONData{
						ID: "grafana",
					},
				}
				p.RegisterClient(&fakePluginBackend{
					qdr: func(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
						return nil, tc.err
					},
				})
				err := registry.Add(context.Background(), p)
				require.NoError(t, err)

				pluginAuth := &fakeJWTAuth{}
				client := ProvideService(registry, &config.Cfg{}, pluginAuth)
				_, err = client.QueryData(context.Background(), &backend.QueryDataRequest{
					PluginContext: backend.PluginContext{
						PluginID: "grafana",
					},
				})
				require.Error(t, err)
				require.ErrorIs(t, err, tc.expectedError)
			})
		}
	})
}

type fakePluginBackend struct {
	qdr backend.QueryDataHandlerFunc

	backendplugin.Plugin
}

func (f *fakePluginBackend) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	if f.qdr != nil {
		return f.qdr(ctx, req)
	}
	return backend.NewQueryDataResponse(), nil
}

func (f *fakePluginBackend) IsDecommissioned() bool {
	return false
}

type fakeJWTAuth struct {
	jwt.PluginAuthService
}

func (f *fakeJWTAuth) IsEnabled() bool {
	return true
}

func (f *fakeJWTAuth) Generate(*user.SignedInUser, string) (string, error) {
	return "hi", nil
}

func (f *fakeJWTAuth) Verify(ctx context.Context, token string) (models.JWTClaims, error) {
	if token == "hi" {
		return models.JWTClaims{}, nil
	}
	return models.JWTClaims{}, errors.New("invalid token")
}
