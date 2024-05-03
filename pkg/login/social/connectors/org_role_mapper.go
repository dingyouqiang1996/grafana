package connectors

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/services/org"
	"github.com/grafana/grafana/pkg/setting"
)

const MapperMatchAllOrgID = -1

type OrgRoleMapper struct {
	cfg        *setting.Cfg
	logger     log.Logger
	orgService org.Service
}

type MappingConfiguration struct {
	orgMapping map[string]map[int64]org.RoleType
	roleStrict bool
}

func ProvideOrgRoleMapper(cfg *setting.Cfg, orgService org.Service) *OrgRoleMapper {
	return &OrgRoleMapper{
		cfg:        cfg,
		logger:     log.New("orgrole.mapper"),
		orgService: orgService,
	}
}

// MapOrgRoles maps the external orgs/groups to Grafana orgs and roles. It returns a  map or orgID to role.
//
// externalOrgs: list of external orgs/groups
//
// orgMapping: mapping configuration from external orgs to Grafana orgs and roles. This is an internal representation of the `org_mapping` setting.
// Use `ParseOrgMappingSettings` to convert the raw setting to this format.
//
// directlyMappedRole: role that is directly mapped to the user
//
// roleStrict: if true, either the evaluated role from orgMapping or the directlyMappedRole must be a valid role.
func (m *OrgRoleMapper) MapOrgRoles(
	ctx context.Context,
	mappingCfg *MappingConfiguration,
	externalOrgs []string,
	directlyMappedRole org.RoleType,
) map[int64]org.RoleType {
	if len(mappingCfg.orgMapping) == 0 && !isValidRole(directlyMappedRole) && mappingCfg.roleStrict {
		// No org mappings are configured and the directly mapped role is not set and roleStrict is enabled
		return nil
	}

	userOrgRoles := getMappedOrgRoles(externalOrgs, mappingCfg.orgMapping)

	if err := m.handleGlobalOrgMapping(userOrgRoles); err != nil {
		// Cannot map global org roles, return nil (prevent resetting asignments)
		return nil
	}

	if len(userOrgRoles) == 0 {
		if mappingCfg.roleStrict && !isValidRole(directlyMappedRole) {
			// No org mapping found and roleStrict is enabled
			return nil
		}

		// No org mapping found, return default org mappping based on directlyMappedRole
		return m.GetDefaultOrgMapping(directlyMappedRole)
	}

	if directlyMappedRole == "" {
		m.logger.Debug("No direct role mapping found")
		return userOrgRoles
	}

	m.logger.Debug("Direct role mapping found", "role", directlyMappedRole)

	// Merge roles from org mapping `org_mapping` with role from direct mapping
	for orgID, role := range userOrgRoles {
		userOrgRoles[orgID] = getTopRole(directlyMappedRole, role)
	}

	return userOrgRoles
}

func (m *OrgRoleMapper) GetDefaultOrgMapping(directlyMappedRole org.RoleType) map[int64]org.RoleType {
	orgRoles := make(map[int64]org.RoleType, 0)

	orgID := int64(1)
	if m.cfg.AutoAssignOrg && m.cfg.AutoAssignOrgId > 0 {
		orgID = int64(m.cfg.AutoAssignOrgId)
	}

	if directlyMappedRole == "" || !directlyMappedRole.IsValid() {
		orgRoles[orgID] = org.RoleType(m.cfg.AutoAssignOrgRole)
	} else {
		orgRoles[orgID] = directlyMappedRole
	}

	return orgRoles
}

func (m *OrgRoleMapper) handleGlobalOrgMapping(orgRoles map[int64]org.RoleType) error {
	// No global role mapping => return
	globalRole, ok := orgRoles[MapperMatchAllOrgID]
	if !ok {
		return nil
	}

	allOrgIDs, err := m.getAllOrgs()
	if err != nil {
		// Prevent resetting assignments
		clear(orgRoles)
		m.logger.Warn("error fetching all orgs, removing org mapping to prevent org sync")
		return err
	}

	// Remove the global role mapping
	delete(orgRoles, MapperMatchAllOrgID)

	// Global mapping => for all orgs get top role mapping
	for orgID := range allOrgIDs {
		orgRoles[orgID] = getTopRole(orgRoles[orgID], globalRole)
	}

	return nil
}

// FIXME: Consider introducing a struct to represent the org mapping settings
// ParseOrgMappingSettings parses the `org_mapping` setting and returns an internal representation of the mapping.
// If the roleStrict is enabled, the mapping should contain a valid role for each org.
func (m *OrgRoleMapper) ParseOrgMappingSettings(ctx context.Context, mappings []string, roleStrict bool) *MappingConfiguration {
	res := map[string]map[int64]org.RoleType{}

	for _, v := range mappings {
		kv := strings.Split(v, ":")
		if len(kv) > 1 {
			orgID, err := strconv.Atoi(kv[1])
			if err != nil && kv[1] != "*" {
				res, getErr := m.orgService.GetByName(ctx, &org.GetOrgByNameQuery{Name: kv[1]})

				if getErr != nil {
					// skip in case of error
					m.logger.Warn("Could not fetch organization. Skipping.", "err", getErr, "mapping", fmt.Sprintf("%v", v), "org", kv[1])
					continue
				}
				orgID, err = int(res.ID), nil
			}
			if kv[1] == "*" {
				orgID, err = MapperMatchAllOrgID, nil
			}
			if err == nil {
				if roleStrict && (len(kv) < 3 || !org.RoleType(kv[2]).IsValid()) {
					m.logger.Warn("Skipping org mapping due to missing or invalid role in mapping when roleStrict is enabled.", "mapping", fmt.Sprintf("%v", v))
					continue
				}

				orga := kv[0]
				if res[orga] == nil {
					res[orga] = map[int64]org.RoleType{}
				}

				if len(kv) > 2 && org.RoleType(kv[2]).IsValid() {
					res[orga][int64(orgID)] = org.RoleType(kv[2])
				} else {
					res[orga][int64(orgID)] = org.RoleViewer
				}
			}
		}
	}

	return &MappingConfiguration{orgMapping: res, roleStrict: roleStrict}
}

func (m *OrgRoleMapper) getAllOrgs() (map[int64]bool, error) {
	allOrgIDs := map[int64]bool{}
	allOrgs, err := m.orgService.Search(context.Background(), &org.SearchOrgsQuery{})
	if err != nil {
		// In case of error, return no orgs
		return nil, err
	}

	for _, org := range allOrgs {
		allOrgIDs[org.ID] = true
	}
	return allOrgIDs, nil
}

func getMappedOrgRoles(externalOrgs []string, orgMapping map[string]map[int64]org.RoleType) map[int64]org.RoleType {
	userOrgRoles := map[int64]org.RoleType{}

	if len(orgMapping) == 0 {
		return nil
	}

	if orgRoles, ok := orgMapping["*"]; ok {
		for orgID, role := range orgRoles {
			userOrgRoles[orgID] = role
		}
	}

	for _, org := range externalOrgs {
		orgRoles, ok := orgMapping[org]
		if !ok {
			continue
		}

		for orgID, role := range orgRoles {
			userOrgRoles[orgID] = getTopRole(userOrgRoles[orgID], role)
		}
	}

	return userOrgRoles
}

func getTopRole(currRole org.RoleType, otherRole org.RoleType) org.RoleType {
	if currRole == "" {
		return otherRole
	}

	if currRole.Includes(otherRole) {
		return currRole
	}

	return otherRole
}

func isValidRole(role org.RoleType) bool {
	return role != "" && role.IsValid()
}
