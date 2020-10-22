package models

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/credentials/stscreds"
	"github.com/aws/aws-sdk-go/aws/defaults"
	"github.com/aws/aws-sdk-go/aws/session"
	v4 "github.com/aws/aws-sdk-go/aws/signer/v4"
	"github.com/aws/aws-sdk-go/private/protocol/rest"
)

type AuthType string

const (
	Default     AuthType = "default"
	Keys        AuthType = "keys"
	Credentials AuthType = "credentials"
)

// Whether the byte value can be sent without escaping in AWS URLs
var noEscape [256]bool

type SigV4Middleware struct {
	Config *Config
	Next   http.RoundTripper
}

type Config struct {
	AuthType string

	Profile string

	DatasourceType string

	AccessKey string
	SecretKey string

	AssumeRoleARN string
	ExternalID    string
	Region        string
}

func NewSigV4Middleware(config *Config, next http.RoundTripper) (m *SigV4Middleware) {
	for i := 0; i < len(noEscape); i++ {
		// AWS expects every character except these to be escaped
		noEscape[i] = (i >= 'A' && i <= 'Z') ||
			(i >= 'a' && i <= 'z') ||
			(i >= '0' && i <= '9') ||
			i == '-' ||
			i == '.' ||
			i == '_' ||
			i == '~'
	}

	return &SigV4Middleware{
		Config: config,
		Next:   next,
	}
}

func (m *SigV4Middleware) RoundTrip(req *http.Request) (*http.Response, error) {
	_, err := m.signRequest(req)
	if err != nil {
		return nil, err
	}

	if m.Next == nil {
		return http.DefaultTransport.RoundTrip(req)
	}

	return m.Next.RoundTrip(req)
}

func (m *SigV4Middleware) signRequest(req *http.Request) (http.Header, error) {
	signer, err := m.signer()
	if err != nil {
		return nil, err
	}

	if strings.Contains(req.URL.RawPath, "%2C") {
		req.URL.RawPath = rest.EscapePath(req.URL.RawPath, false)
	}

	// if X-Forwarded-For header exists, exclude from signing since it breaks AWS request verification
	forwardHeader := req.Header.Get("X-Forwarded-For")
	if forwardHeader != "" {
		req.Header.Del("X-Forwarded-For")
	}

	payload := bytes.NewReader(replaceBody(req))
	header, err := signer.Sign(req, payload, awsServiceNamespace(m.Config.DatasourceType), m.Config.Region, time.Now().UTC())

	// reset X-Forwarded-For header if it existed pre-signing
	if forwardHeader != "" {
		req.Header.Set("X-Forwarded-For", forwardHeader)
	}

	return header, err
}

func (m *SigV4Middleware) signer() (*v4.Signer, error) {
	c, err := m.credentials()
	if err != nil {
		return nil, err
	}

	if m.Config.AssumeRoleARN != "" {
		s, err := session.NewSession(&aws.Config{
			Region:      aws.String(m.Config.Region),
			Credentials: c},
		)
		if err != nil {
			return nil, err
		}
		return v4.NewSigner(stscreds.NewCredentials(s, m.Config.AssumeRoleARN)), nil
	}

	return v4.NewSigner(c), nil
}

func (m *SigV4Middleware) credentials() (*credentials.Credentials, error) {
	authType := AuthType(m.Config.AuthType)

	switch authType {
	case Default:
		return defaults.CredChain(defaults.Config(), defaults.Handlers()), nil
	case Keys:
		return credentials.NewStaticCredentials(m.Config.AccessKey, m.Config.SecretKey, ""), nil
	case Credentials:
		return credentials.NewSharedCredentials("", m.Config.Profile), nil
	}

	return nil, fmt.Errorf("unrecognized authType: %s", authType)
}

func replaceBody(req *http.Request) []byte {
	if req.Body == nil {
		return []byte{}
	}
	payload, _ := ioutil.ReadAll(req.Body)
	req.Body = ioutil.NopCloser(bytes.NewReader(payload))
	return payload
}

func awsServiceNamespace(dsType string) string {
	switch dsType {
	case DS_ES:
		return "es"
	case DS_PROMETHEUS:
		return "prometheus"
	default:
		panic(fmt.Sprintf("Unsupported datasource %s", dsType))
	}
}
