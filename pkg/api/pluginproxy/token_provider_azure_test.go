package pluginproxy

import (
	"context"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/plugins"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestAzureTokenProvider_isManagedIdentityCredential(t *testing.T) {
	ctx := context.Background()

	cfg := &setting.Cfg{}

	ds := &models.DataSource{Id: 1, Version: 2}
	route := &plugins.AppPluginRoute{}

	authParams := &plugins.JwtTokenAuth{
		Scopes: []string{
			"https://management.azure.com/.default",
		},
		Params: map[string]string{
			"azure_auth_type": "",
			"azure_cloud":     "AzureCloud",
			"tenant_id":       "",
			"client_id":       "",
			"client_secret":   "",
		},
	}

	provider := newAzureAccessTokenProvider(ctx, cfg, ds, route, authParams)

	t.Run("when managed identities enabled", func(t *testing.T) {
		cfg.Azure.ManagedIdentityEnabled = true

		t.Run("should be managed identity if auth type is managed identity", func(t *testing.T) {
			authParams.Params = map[string]string{
				"azure_auth_type": "msi",
			}
			assert.True(t, provider.isManagedIdentityCredential())
		})

		t.Run("should be client secret if auth type is client secret", func(t *testing.T) {
			authParams.Params = map[string]string{
				"azure_auth_type": "clientsecret",
			}
			assert.False(t, provider.isManagedIdentityCredential())
		})

		t.Run("should be managed identity if datasource not configured", func(t *testing.T) {
			authParams.Params = map[string]string{
				"azure_auth_type": "",
				"tenant_id":       "",
				"client_id":       "",
				"client_secret":   "",
			}

			assert.True(t, provider.isManagedIdentityCredential())
		})

		t.Run("should be client secret if auth type not specified but credentials configured", func(t *testing.T) {
			authParams.Params = map[string]string{
				"azure_auth_type": "",
				"tenant_id":       "06da9207-bdd9-4558-aee4-377450893cb4",
				"client_id":       "b8c58fe8-1fca-4e30-a0a8-b44d0e5f70d6",
				"client_secret":   "9bcd4434-824f-4887-a8a8-94c287bf0a7b",
			}

			assert.False(t, provider.isManagedIdentityCredential())
		})
	})

	t.Run("when managed identities disabled", func(t *testing.T) {
		cfg.Azure.ManagedIdentityEnabled = false

		t.Run("should be managed identity if auth type is managed identity", func(t *testing.T) {
			authParams.Params = map[string]string{
				"azure_auth_type": "msi",
			}
			assert.True(t, provider.isManagedIdentityCredential())
		})

		t.Run("should be client secret if datasource not configured", func(t *testing.T) {
			authParams.Params = map[string]string{
				"azure_auth_type": "",
				"tenant_id":       "",
				"client_id":       "",
				"client_secret":   "",
			}

			assert.False(t, provider.isManagedIdentityCredential())
		})
	})
}
