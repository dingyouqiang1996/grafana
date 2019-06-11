package ldap

import (
	"fmt"
	"os"
	"regexp"
	"strings"
	"sync"

	"github.com/BurntSushi/toml"
	"golang.org/x/xerrors"

	"github.com/grafana/grafana/pkg/infra/log"
	m "github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/grafana/grafana/pkg/util/errutil"
)

// Config holds list of connections to LDAP
type Config struct {
	Servers []*ServerConfig `toml:"servers"`
}

// ServerConfig holds connection data to LDAP
type ServerConfig struct {
	Host          string       `toml:"host"`
	Port          int          `toml:"port"`
	UseSSL        bool         `toml:"use_ssl"`
	StartTLS      bool         `toml:"start_tls"`
	SkipVerifySSL bool         `toml:"ssl_skip_verify"`
	RootCACert    string       `toml:"root_ca_cert"`
	ClientCert    string       `toml:"client_cert"`
	ClientKey     string       `toml:"client_key"`
	BindDN        string       `toml:"bind_dn"`
	BindPassword  string       `toml:"bind_password"`
	Attr          AttributeMap `toml:"attributes"`

	SearchFilter  string   `toml:"search_filter"`
	SearchBaseDNs []string `toml:"search_base_dns"`

	GroupSearchFilter              string   `toml:"group_search_filter"`
	GroupSearchFilterUserAttribute string   `toml:"group_search_filter_user_attribute"`
	GroupSearchBaseDNs             []string `toml:"group_search_base_dns"`

	Groups []*GroupToOrgRole `toml:"group_mappings"`
}

type AttributeMap struct {
	Username string `toml:"username"`
	Name     string `toml:"name"`
	Surname  string `toml:"surname"`
	Email    string `toml:"email"`
	MemberOf string `toml:"member_of"`
}

type GroupToOrgRole struct {
	GroupDN        string     `toml:"group_dn"`
	OrgId          int64      `toml:"org_id"`
	IsGrafanaAdmin *bool      `toml:"grafana_admin"` // This is a pointer to know if it was set or not (for backwards compatibility)
	OrgRole        m.RoleType `toml:"org_role"`
}

var config *Config
var logger = log.New("ldap")

// loadingMutex locks the reading of the config so multiple requests for reloading are sequential.
var loadingMutex = &sync.Mutex{}

// IsEnabled checks if ldap is enabled
func IsEnabled() bool {
	return setting.LDAPEnabled
}

// ReloadConfig reads the config from the disc and caches it.
func ReloadConfig() error {
	if !IsEnabled() {
		return nil
	}

	loadingMutex.Lock()
	defer loadingMutex.Unlock()

	var err error
	config, err = readConfig(setting.LDAPConfigFile)
	return err
}

// GetConfig returns the LDAP config if LDAP is enabled otherwise it returns nil. It returns either cached value of
// the config or it reads it and caches it first.
func GetConfig() (*Config, error) {
	if !IsEnabled() {
		return nil, nil
	}

	// Make it a singleton
	if config != nil {
		return config, nil
	}

	loadingMutex.Lock()
	defer loadingMutex.Unlock()

	var err error
	config, err = readConfig(setting.LDAPConfigFile)

	return config, err
}

func readConfig(configFile string) (*Config, error) {
	result := &Config{}

	logger.Info("LDAP enabled, reading config file", "file", configFile)

	_, err := toml.DecodeFile(configFile, result)
	if err != nil {
		return nil, errutil.Wrap("Failed to load LDAP config file", err)
	}

	if len(result.Servers) == 0 {
		return nil, xerrors.New("LDAP enabled but no LDAP servers defined in config file")
	}

	// set default org id
	for _, server := range result.Servers {
		err = assertNotEmptyCfg(server.SearchFilter, "search_filter")
		if err != nil {
			return nil, errutil.Wrap("Failed to validate SearchFilter section", err)
		}
		err = assertNotEmptyCfg(server.SearchBaseDNs, "search_base_dns")
		if err != nil {
			return nil, errutil.Wrap("Failed to validate SearchBaseDNs section", err)
		}

		for _, groupMap := range server.Groups {
			if groupMap.OrgId == 0 {
				groupMap.OrgId = 1
			}
		}
	}

	for _, server := range result.Servers {
		envValue := evalEnvVar(server.BindPassword)
		server.BindPassword = envValue
	}

	return result, nil
}

func evalEnvVar(value string) string {
	regex := regexp.MustCompile(`\${(\w+)}`)
	if regex != nil {
		return regex.ReplaceAllStringFunc(value, func(envVar string) string {
			envVar = strings.TrimPrefix(envVar, "${")
			envVar = strings.TrimSuffix(envVar, "}")
			envValue := os.Getenv(envVar)
			return envValue
		})
	}
	return value
	
}

func assertNotEmptyCfg(val interface{}, propName string) error {
	switch v := val.(type) {
	case string:
		if v == "" {
			return xerrors.Errorf("LDAP config file is missing option: %v", propName)
		}
	case []string:
		if len(v) == 0 {
			return xerrors.Errorf("LDAP config file is missing option: %v", propName)
		}
	default:
		fmt.Println("unknown")
	}
	return nil
}
