package oastest

import (
	"context"
	"net/http"

	"github.com/grafana/grafana/pkg/services/extsvcauth"
	"github.com/grafana/grafana/pkg/services/extsvcauth/oauthserver"
	"gopkg.in/square/go-jose.v2"
)

type FakeService struct {
	ExpectedClient *oauthserver.OAuthClient
	ExpectedKey    *jose.JSONWebKey
	ExpectedErr    error
}

var _ oauthserver.OAuth2Server = &FakeService{}

func (s *FakeService) SaveExternalService(ctx context.Context, cmd *extsvcauth.ExternalServiceRegistration) (*extsvcauth.ExternalService, error) {
	return s.ExpectedClient.ToExtSvc(nil), s.ExpectedErr
}

func (s *FakeService) GetExternalService(ctx context.Context, id string) (*oauthserver.OAuthClient, error) {
	return s.ExpectedClient, s.ExpectedErr
}

func (s *FakeService) HandleTokenRequest(rw http.ResponseWriter, req *http.Request) {}

func (s *FakeService) HandleIntrospectionRequest(rw http.ResponseWriter, req *http.Request) {}
