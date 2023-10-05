package registry

import (
	"context"

	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/services/extsvcauth"
	"github.com/grafana/grafana/pkg/services/extsvcauth/oauthserver"
	"github.com/grafana/grafana/pkg/services/featuremgmt"
)

var _ extsvcauth.ExternalServiceRegistry = &Registry{}

type Registry struct {
	features    featuremgmt.FeatureToggles
	logger      log.Logger
	oauthServer oauthserver.OAuth2Server
}

func ProvideExtSvcRegistry(oauthServer oauthserver.OAuth2Server, features featuremgmt.FeatureToggles) *Registry {
	return &Registry{
		features:    features,
		logger:      log.New("extsvcauth.registry"),
		oauthServer: oauthServer,
	}
}

// SaveExternalService creates or updates an external service in the database, it generates client_id and secrets and
// it ensures that the associated service account has the correct permissions.
func (r *Registry) SaveExternalService(ctx context.Context, cmd *extsvcauth.ExternalServiceRegistration) (*extsvcauth.ExternalServiceDTO, error) {
	switch cmd.AuthProvider {
	case extsvcauth.OAuth2Server:
		if !r.features.IsEnabled(featuremgmt.FlagExternalServiceAuth) {
			r.logger.Warn("Skipping external service authentication, flag disabled", "service", cmd.Name, "flag", featuremgmt.FlagExternalServiceAuth)
			return nil, nil
		}
		r.logger.Debug("Routing the External Service registration to the OAuth2Server", "service", cmd.Name)
		return r.oauthServer.SaveExternalService(ctx, cmd)
	default:
		return nil, extsvcauth.ErrUnknownProvider.Errorf("unknow provider '%v'", cmd.AuthProvider)
	}
}
