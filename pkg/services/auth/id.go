package auth

import (
	"context"

	authnlib "github.com/grafana/authlib/authn"

	"github.com/grafana/grafana/pkg/services/auth/identity"
)

type IDService interface {
	// SignIdentity signs a id token for provided identity that can be forwarded to plugins and external services
	SignIdentity(ctx context.Context, identity identity.Requester) (string, error)

	// RemoveIDToken removes any locally stored id tokens for key
	RemoveIDToken(ctx context.Context, identity identity.Requester) error
}

type IDSigner interface {
	SignIDToken(ctx context.Context, claims *IDClaims) (string, error)
}

type IDClaims = authnlib.Claims[authnlib.IDTokenClaims]
