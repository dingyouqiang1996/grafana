package azureauth

import (
	"testing"

	"github.com/grafana/grafana-azure-sdk-go/azcredentials"
	"github.com/grafana/grafana-azure-sdk-go/azsettings"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	sdkhttpclient "github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/grafana/grafana/pkg/setting"
)

func TestConfigureAzureAuthentication(t *testing.T) {
	cfg := &setting.Cfg{
		Azure: &azsettings.AzureSettings{},
	}

	t.Run("should set Azure middleware when JsonData contains valid credentials", func(t *testing.T) {
		settings := backend.DataSourceInstanceSettings{
			JSONData: []byte(`{
					"httpMethod": "POST",
					"azureCredentials": {
						"authType": "msi"
					}
				}`),
		}

		var opts = &sdkhttpclient.Options{CustomOptions: map[string]any{}}

		err := ConfigureAzureAuthentication(settings, cfg.Azure, opts)
		require.NoError(t, err)

		require.NotNil(t, opts.Middlewares)
		assert.Len(t, opts.Middlewares, 1)
	})

	t.Run("should not set Azure middleware when JsonData doesn't contain valid credentials", func(t *testing.T) {
		settings := backend.DataSourceInstanceSettings{
			JSONData: []byte(`{ "httpMethod": "POST" }`),
		}

		var opts = &sdkhttpclient.Options{CustomOptions: map[string]any{}}

		err := ConfigureAzureAuthentication(settings, cfg.Azure, opts)
		require.NoError(t, err)

		assert.NotContains(t, opts.CustomOptions, "_azureCredentials")
	})

	t.Run("should return error when JsonData contains invalid credentials", func(t *testing.T) {
		settings := backend.DataSourceInstanceSettings{
			JSONData: []byte(`{
					"httpMethod":       "POST",
					"azureCredentials": "invalid"
				}`),
		}

		var opts = &sdkhttpclient.Options{CustomOptions: map[string]any{}}
		err := ConfigureAzureAuthentication(settings, cfg.Azure, opts)
		assert.Error(t, err)
	})

	t.Run("should set Azure middleware when JsonData contains credentials and valid audience", func(t *testing.T) {
		settings := backend.DataSourceInstanceSettings{
			JSONData: []byte(`{
					"httpMethod": "POST",
					"azureCredentials": {
						"authType": "msi"
					},
					"azureEndpointResourceId": "https://api.example.com/abd5c4ce-ca73-41e9-9cb2-bed39aa2adb5"
				}`),
		}
		var opts = &sdkhttpclient.Options{CustomOptions: map[string]any{}}

		err := ConfigureAzureAuthentication(settings, cfg.Azure, opts)
		require.NoError(t, err)

		require.NotNil(t, opts.Middlewares)
		assert.Len(t, opts.Middlewares, 1)
	})

	t.Run("should not set Azure middleware when JsonData doesn't contain credentials", func(t *testing.T) {
		settings := backend.DataSourceInstanceSettings{
			JSONData: []byte(`{
					"httpMethod":              "POST",
					"azureEndpointResourceId": "https://api.example.com/abd5c4ce-ca73-41e9-9cb2-bed39aa2adb5"
				}`),
		}
		var opts = &sdkhttpclient.Options{CustomOptions: map[string]any{}}

		err := ConfigureAzureAuthentication(settings, cfg.Azure, opts)
		require.NoError(t, err)

		if opts.Middlewares != nil {
			assert.Len(t, opts.Middlewares, 0)
		}
	})

	t.Run("should return error when JsonData contains invalid audience", func(t *testing.T) {
		settings := backend.DataSourceInstanceSettings{
			JSONData: []byte(`{
					"httpMethod": "POST",
					"azureCredentials": {
						"authType": "msi"
					},
					"azureEndpointResourceId": "invalid"
				}`),
		}

		var opts = &sdkhttpclient.Options{CustomOptions: map[string]any{}}

		err := ConfigureAzureAuthentication(settings, cfg.Azure, opts)
		assert.Error(t, err)
	})
}

func TestGetPrometheusScopes(t *testing.T) {
	cfg := &setting.Cfg{
		Azure: &azsettings.AzureSettings{
			Cloud: azsettings.AzureUSGovernment,
		},
	}

	t.Run("should return scopes for cloud from settings with MSI credentials", func(t *testing.T) {
		credentials := &azcredentials.AzureManagedIdentityCredentials{}
		scopes, err := getPrometheusScopes(cfg.Azure, credentials)
		require.NoError(t, err)

		assert.NotNil(t, scopes)
		assert.Len(t, scopes, 1)
		assert.Equal(t, "https://prometheus.monitor.azure.us/.default", scopes[0])
	})

	t.Run("should return scopes for cloud from client secret credentials", func(t *testing.T) {
		credentials := &azcredentials.AzureClientSecretCredentials{AzureCloud: azsettings.AzureChina}
		scopes, err := getPrometheusScopes(cfg.Azure, credentials)
		require.NoError(t, err)

		assert.NotNil(t, scopes)
		assert.Len(t, scopes, 1)
		assert.Equal(t, "https://prometheus.monitor.azure.cn/.default", scopes[0])
	})
}
