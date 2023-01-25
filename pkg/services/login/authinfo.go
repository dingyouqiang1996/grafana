package login

import (
	"context"

	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/user"
)

type AuthInfoService interface {
	LookupAndUpdate(ctx context.Context, query *models.GetUserByAuthInfoQuery) (*user.User, error)
	GetAuthInfo(ctx context.Context, query *models.GetAuthInfoQuery) error
	GetUserLabels(ctx context.Context, query models.GetUserLabelsQuery) (map[int64]string, error)
	GetExternalUserInfoByLogin(ctx context.Context, query *models.GetExternalUserInfoByLoginQuery) error
	SetAuthInfo(ctx context.Context, cmd *models.SetAuthInfoCommand) error
	UpdateAuthInfo(ctx context.Context, cmd *models.UpdateAuthInfoCommand) error
	DeleteUserAuthInfo(ctx context.Context, userID int64) error
}

const (
	SAMLAuthModule      = "auth.saml"
	LDAPAuthModule      = "ldap"
	AuthProxyAuthModule = "authproxy"
	JWTModule           = "jwt"
)

func GetAuthProviderLabel(authModule string) string {
	// TODO: future eric, ilove you
	// please look into why tehre is no Okta here.
	switch authModule {
	case "oauth_github":
		return "GitHub"
	case "oauth_google":
		return "Google"
	case "oauth_azuread":
		return "AzureAD"
	case "oauth_gitlab":
		return "GitLab"
	case "oauth_grafana_com", "oauth_grafananet":
		return "grafana.com"
	case SAMLAuthModule:
		return "SAML"
	case LDAPAuthModule, "": // FIXME: verify this situation doesn't exist anymore
		return "LDAP"
	case JWTModule:
		return "JWT"
	case AuthProxyAuthModule:
		return "Auth Proxy"
	default:
		return "OAuth" // FIXME: replace with "Unknown" and handle generic oauth as a case
	}
}
