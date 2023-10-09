package signingkeystest

import (
	"context"
	"crypto"

	"github.com/go-jose/go-jose/v3"
)

type FakeSigningKeysService struct {
	ExpectedKeys  map[string]crypto.Signer
	ExpectedError error
}

func (s *FakeSigningKeysService) GetJWKS(ctx context.Context) (jose.JSONWebKeySet, error) {
	return s.ExpectedJSONWebKeySet, nil
}

func (s *FakeSigningKeysService) GetOrCreatePrivateKey(ctx context.Context,
	keyPrefix string, alg jose.SignatureAlgorithm) (string, crypto.Signer, error) {
	if s.ExpectedError != nil {
		return "", nil, s.ExpectedError
	}
	return keyPrefix, s.ExpectedKeys[keyPrefix], nil
}
