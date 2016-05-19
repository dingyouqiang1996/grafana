package social

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/setting"
	"golang.org/x/net/context"

	"golang.org/x/oauth2"
)

type BasicUserInfo struct {
	Identity string
	Name     string
	Email    string
	Login    string
	Company  string
}

type SocialConnector interface {
	Type() int
	UserInfo(token *oauth2.Token) (*BasicUserInfo, error)
	IsEmailAllowed(email string) bool
	IsSignupAllowed() bool

	AuthCodeURL(state string, opts ...oauth2.AuthCodeOption) string
	Exchange(ctx context.Context, code string) (*oauth2.Token, error)
}

var (
	SocialBaseUrl = "/login/"
	SocialMap     = make(map[string]SocialConnector)
)

func NewOAuthService() {
	setting.OAuthService = &setting.OAuther{}
	setting.OAuthService.OAuthInfos = make(map[string]*setting.OAuthInfo)

	allOauthes := []string{"github", "google", "openidc"}

	for _, name := range allOauthes {
		sec := setting.Cfg.Section("auth." + name)
		info := &setting.OAuthInfo{
			ClientId:       sec.Key("client_id").String(),
			ClientSecret:   sec.Key("client_secret").String(),
			Scopes:         sec.Key("scopes").Strings(" "),
			AuthUrl:        sec.Key("auth_url").String(),
			TokenUrl:       sec.Key("token_url").String(),
			ApiUrl:         sec.Key("api_url").String(),
			Enabled:        sec.Key("enabled").MustBool(),
			AllowedDomains: sec.Key("allowed_domains").Strings(" "),
			AllowSignup:    sec.Key("allow_sign_up").MustBool(),
			ProviderName:   sec.Key("provider_name").String(),
		}

		if !info.Enabled {
			continue
		}

		setting.OAuthService.OAuthInfos[name] = info
		config := oauth2.Config{
			ClientID:     info.ClientId,
			ClientSecret: info.ClientSecret,
			Endpoint: oauth2.Endpoint{
				AuthURL:  info.AuthUrl,
				TokenURL: info.TokenUrl,
			},
			RedirectURL: strings.TrimSuffix(setting.AppUrl, "/") + SocialBaseUrl + name,
			Scopes:      info.Scopes,
		}

		// GitHub.
		if name == "github" {
			setting.OAuthService.GitHub = true
			teamIds := sec.Key("team_ids").Ints(",")
			allowedOrganizations := sec.Key("allowed_organizations").Strings(" ")
			SocialMap["github"] = &SocialGithub{
				Config:               &config,
				allowedDomains:       info.AllowedDomains,
				apiUrl:               info.ApiUrl,
				allowSignup:          info.AllowSignup,
				teamIds:              teamIds,
				allowedOrganizations: allowedOrganizations,
			}
		}

		// Google.
		if name == "google" {
			setting.OAuthService.Google = true
			SocialMap["google"] = &SocialGoogle{
				Config: &config, allowedDomains: info.AllowedDomains,
				apiUrl:      info.ApiUrl,
				allowSignup: info.AllowSignup,
			}
		}
		if name == "openidc" {
			setting.OAuthService.Openidc = true
			provider := sec.Key("provider").String()
			if provider != "" && (config.Endpoint.AuthURL == "" || config.Endpoint.TokenURL == "" || info.ApiUrl == "") {
				urls, _ := getOpenIDCProviderConfig(provider)
				if config.Endpoint.AuthURL == "" {
					config.Endpoint.AuthURL = urls[0]
				}
				if config.Endpoint.TokenURL == "" {
					config.Endpoint.TokenURL = urls[1]
				}
				if info.ApiUrl == "" {
					info.ApiUrl = urls[2]
				}
			}
			SocialMap["openidc"] = &SocialOpenIDC{
				Config: &config, allowedDomains: info.AllowedDomains,
				apiUrl:      info.ApiUrl,
				allowSignup: info.AllowSignup,
			}
		}
	}
}

func getOpenIDCProviderConfig(url string) ([]string, error) {
	var providerConfig struct {
		AuthUrl  string `json:"authorization_endpoint"`
		TokenUrl string `json:"token_endpoint"`
		ApiUrl   string `json:"userinfo_endpoint"`
	}
	r, err := http.Get(url + "/.well-known/openid-configuration")
	if err != nil {
		return nil, err
	}
	defer r.Body.Close()

	if err = json.NewDecoder(r.Body).Decode(&providerConfig); err != nil {
		return nil, err
	}
	return []string{providerConfig.AuthUrl, providerConfig.TokenUrl, providerConfig.ApiUrl}, nil
}

func isEmailAllowed(email string, allowedDomains []string) bool {
	if len(allowedDomains) == 0 {
		return true
	}

	valid := false
	for _, domain := range allowedDomains {
		emailSuffix := fmt.Sprintf("@%s", domain)
		valid = valid || strings.HasSuffix(email, emailSuffix)
	}

	return valid
}

type SocialGithub struct {
	*oauth2.Config
	allowedDomains       []string
	allowedOrganizations []string
	apiUrl               string
	allowSignup          bool
	teamIds              []int
}

var (
	ErrMissingTeamMembership = errors.New("User not a member of one of the required teams")
)

var (
	ErrMissingOrganizationMembership = errors.New("User not a member of one of the required organizations")
)

func (s *SocialGithub) Type() int {
	return int(models.GITHUB)
}

func (s *SocialGithub) IsEmailAllowed(email string) bool {
	return isEmailAllowed(email, s.allowedDomains)
}

func (s *SocialGithub) IsSignupAllowed() bool {
	return s.allowSignup
}

func (s *SocialGithub) IsTeamMember(client *http.Client) bool {
	if len(s.teamIds) == 0 {
		return true
	}

	teamMemberships, err := s.FetchTeamMemberships(client)
	if err != nil {
		return false
	}

	for _, teamId := range s.teamIds {
		for _, membershipId := range teamMemberships {
			if teamId == membershipId {
				return true
			}
		}
	}

	return false
}

func (s *SocialGithub) IsOrganizationMember(client *http.Client) bool {
	if len(s.allowedOrganizations) == 0 {
		return true
	}

	organizations, err := s.FetchOrganizations(client)
	if err != nil {
		return false
	}

	for _, allowedOrganization := range s.allowedOrganizations {
		for _, organization := range organizations {
			if organization == allowedOrganization {
				return true
			}
		}
	}

	return false
}

func (s *SocialGithub) FetchPrivateEmail(client *http.Client) (string, error) {
	type Record struct {
		Email    string `json:"email"`
		Primary  bool   `json:"primary"`
		Verified bool   `json:"verified"`
	}

	emailsUrl := fmt.Sprintf(s.apiUrl + "/emails")
	r, err := client.Get(emailsUrl)
	if err != nil {
		return "", err
	}

	defer r.Body.Close()

	var records []Record

	if err = json.NewDecoder(r.Body).Decode(&records); err != nil {
		return "", err
	}

	var email = ""
	for _, record := range records {
		if record.Primary {
			email = record.Email
		}
	}

	return email, nil
}

func (s *SocialGithub) FetchTeamMemberships(client *http.Client) ([]int, error) {
	type Record struct {
		Id int `json:"id"`
	}

	membershipUrl := fmt.Sprintf(s.apiUrl + "/teams")
	r, err := client.Get(membershipUrl)
	if err != nil {
		return nil, err
	}

	defer r.Body.Close()

	var records []Record

	if err = json.NewDecoder(r.Body).Decode(&records); err != nil {
		return nil, err
	}

	var ids = make([]int, len(records))
	for i, record := range records {
		ids[i] = record.Id
	}

	return ids, nil
}

func (s *SocialGithub) FetchOrganizations(client *http.Client) ([]string, error) {
	type Record struct {
		Login string `json:"login"`
	}

	url := fmt.Sprintf(s.apiUrl + "/orgs")
	r, err := client.Get(url)
	if err != nil {
		return nil, err
	}

	defer r.Body.Close()

	var records []Record

	if err = json.NewDecoder(r.Body).Decode(&records); err != nil {
		return nil, err
	}

	var logins = make([]string, len(records))
	for i, record := range records {
		logins[i] = record.Login
	}

	return logins, nil
}

func (s *SocialGithub) UserInfo(token *oauth2.Token) (*BasicUserInfo, error) {
	var data struct {
		Id    int    `json:"id"`
		Name  string `json:"login"`
		Email string `json:"email"`
	}

	var err error
	client := s.Client(oauth2.NoContext, token)
	r, err := client.Get(s.apiUrl)
	if err != nil {
		return nil, err
	}

	defer r.Body.Close()

	if err = json.NewDecoder(r.Body).Decode(&data); err != nil {
		return nil, err
	}

	userInfo := &BasicUserInfo{
		Identity: strconv.Itoa(data.Id),
		Name:     data.Name,
		Email:    data.Email,
	}

	if !s.IsTeamMember(client) {
		return nil, ErrMissingTeamMembership
	}

	if !s.IsOrganizationMember(client) {
		return nil, ErrMissingOrganizationMembership
	}

	if userInfo.Email == "" {
		userInfo.Email, err = s.FetchPrivateEmail(client)
		if err != nil {
			return nil, err
		}
	}

	return userInfo, nil
}

//   ________                     .__
//  /  _____/  ____   ____   ____ |  |   ____
// /   \  ___ /  _ \ /  _ \ / ___\|  | _/ __ \
// \    \_\  (  <_> |  <_> ) /_/  >  |_\  ___/
//  \______  /\____/ \____/\___  /|____/\___  >
//         \/             /_____/           \/

type SocialGoogle struct {
	*oauth2.Config
	allowedDomains []string
	apiUrl         string
	allowSignup    bool
}

func (s *SocialGoogle) Type() int {
	return int(models.GOOGLE)
}

func (s *SocialGoogle) IsEmailAllowed(email string) bool {
	return isEmailAllowed(email, s.allowedDomains)
}

func (s *SocialGoogle) IsSignupAllowed() bool {
	return s.allowSignup
}

func (s *SocialGoogle) UserInfo(token *oauth2.Token) (*BasicUserInfo, error) {
	var data struct {
		Id    string `json:"id"`
		Name  string `json:"name"`
		Email string `json:"email"`
	}
	var err error

	client := s.Client(oauth2.NoContext, token)
	r, err := client.Get(s.apiUrl)
	if err != nil {
		return nil, err
	}
	defer r.Body.Close()
	if err = json.NewDecoder(r.Body).Decode(&data); err != nil {
		return nil, err
	}
	return &BasicUserInfo{
		Identity: data.Id,
		Name:     data.Name,
		Email:    data.Email,
	}, nil
}

//   ___                   ___ ____     ____                            _
//  / _ \ _ __   ___ _ __ |_ _|  _ \   / ___|___  _ __  _ __   ___  ___| |_
// | | | | '_ \ / _ \ '_ \ | || | | | | |   / _ \| '_ \| '_ \ / _ \/ __| __|
// | |_| | |_) |  __/ | | || || |_| | | |__| (_) | | | | | | |  __/ (__| |_
//  \___/| .__/ \___|_| |_|___|____/   \____\___/|_| |_|_| |_|\___|\___|\__|
//       |_|

type SocialOpenIDC struct {
	*oauth2.Config
	allowedDomains []string
	apiUrl         string
	allowSignup    bool
}

func (s *SocialOpenIDC) Type() int {
	return int(models.OPENIDC)
}

func (s *SocialOpenIDC) IsEmailAllowed(email string) bool {
	return isEmailAllowed(email, s.allowedDomains)
}

func (s *SocialOpenIDC) IsSignupAllowed() bool {
	return s.allowSignup
}

func (s *SocialOpenIDC) UserInfo(token *oauth2.Token) (*BasicUserInfo, error) {
	var data struct {
		Id    string `json:"sub"`
		Name  string `json:"name"`
		Email string `json:"email"`
	}
	var err error

	client := s.Client(oauth2.NoContext, token)
	r, err := client.Get(s.apiUrl)
	if err != nil {
		return nil, err
	}
	defer r.Body.Close()

	if err = json.NewDecoder(r.Body).Decode(&data); err != nil {
		return nil, err
	}
	return &BasicUserInfo{
		Identity: data.Id,
		Name:     data.Name,
		Email:    data.Email,
	}, nil
}
