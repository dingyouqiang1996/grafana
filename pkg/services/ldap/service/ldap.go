package service

import (
	"errors"
	"sync"

	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/services/ldap"
	"github.com/grafana/grafana/pkg/services/ldap/multildap"
	"github.com/grafana/grafana/pkg/setting"
)

var (
	ErrUnableToCreateLDAPClient = errors.New("unable to create LDAP client")
)

// LDAP is the interface for the LDAP service.
type LDAP interface {
	ReloadConfig() error
	Config() *ldap.Config
	Client() multildap.IMultiLDAP
}

type LDAPImpl struct {
	client  multildap.IMultiLDAP
	cfg     *setting.Cfg
	ldapCfg *ldap.Config
	log     log.Logger

	// loadingMutex locks the reading of the config so multiple requests for reloading are sequential.
	loadingMutex *sync.Mutex
}

func ProvideService(cfg *setting.Cfg) *LDAPImpl {
	s := &LDAPImpl{
		client:       nil,
		ldapCfg:      nil,
		cfg:          cfg,
		log:          log.New("ldap.service"),
		loadingMutex: &sync.Mutex{},
	}

	if !cfg.LDAPEnabled {
		return s
	}

	ldapCfg, err := multildap.GetConfig(s.cfg)
	if err != nil {
		s.log.Error("Failed to get LDAP config", "error", err)
	} else {
		s.ldapCfg = ldapCfg
		s.client = multildap.New(s.ldapCfg.Servers)
	}

	return s
}

func (s *LDAPImpl) ReloadConfig() error {
	if !s.cfg.LDAPEnabled {
		return nil
	}

	s.loadingMutex.Lock()
	defer s.loadingMutex.Unlock()

	config, err := readConfig(s.cfg.LDAPConfigFilePath)
	if err != nil {
		return err
	}

	client := multildap.New(config.Servers)
	if client == nil {
		return ErrUnableToCreateLDAPClient
	}

	s.ldapCfg = config
	s.client = client

	return nil
}

func (s *LDAPImpl) Client() multildap.IMultiLDAP {
	return s.client
}

func (s *LDAPImpl) Config() *ldap.Config {
	return s.ldapCfg
}
