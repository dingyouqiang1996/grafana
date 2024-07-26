package sync

import (
	"context"
	"errors"

	"github.com/grafana/grafana/pkg/apimachinery/errutil"
	"github.com/grafana/grafana/pkg/apimachinery/identity"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/infra/tracing"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/authn"
	"github.com/grafana/grafana/pkg/services/login"
	"github.com/grafana/grafana/pkg/services/org"
)

var (
	errInvalidCloudRole         = errutil.BadRequest("rbac.sync.invalid-cloud-role")
	errSyncPermissionsForbidden = errutil.Forbidden("permissions.sync.forbidden")
)

func ProvideRBACSync(acService accesscontrol.Service, tracer tracing.Tracer) *RBACSync {
	return &RBACSync{
		ac:     acService,
		log:    log.New("permissions.sync"),
		tracer: tracer,
	}
}

type RBACSync struct {
	ac     accesscontrol.Service
	log    log.Logger
	tracer tracing.Tracer
}

func (s *RBACSync) SyncPermissionsHook(ctx context.Context, ident *authn.Identity, _ *authn.Request) error {
	ctx, span := s.tracer.Start(ctx, "rbac.sync.SyncPermissionsHook")
	defer span.End()

	if !ident.ClientParams.SyncPermissions {
		return nil
	}

	// Populate permissions from roles
	permissions, err := s.fetchPermissions(ctx, ident)
	if err != nil {
		return err
	}

	if ident.Permissions == nil {
		ident.Permissions = make(map[int64]map[string][]string, 1)
	}

	grouped := accesscontrol.GroupScopesByActionContext(ctx, permissions)

	// Restrict access to the list of actions
	actionsLookup := ident.ClientParams.FetchPermissionsParams.ActionsLookup
	if len(actionsLookup) > 0 {
		filtered := make(map[string][]string, len(actionsLookup))
		for _, action := range actionsLookup {
			if scopes, ok := grouped[action]; ok {
				filtered[action] = scopes
			}
		}
		grouped = filtered
	}
	ident.Permissions[ident.OrgID] = grouped

	return nil
}

func (s *RBACSync) fetchPermissions(ctx context.Context, ident *authn.Identity) ([]accesscontrol.Permission, error) {
	ctx, span := s.tracer.Start(ctx, "rbac.sync.fetchPermissions")
	defer span.End()

	permissions := make([]accesscontrol.Permission, 0, 8)
	roles := ident.ClientParams.FetchPermissionsParams.Roles
	if len(roles) > 0 {
		for _, role := range roles {
			roleDTO, err := s.ac.GetRoleByName(ctx, ident.GetOrgID(), role)
			if err != nil && !errors.Is(err, accesscontrol.ErrRoleNotFound) {
				s.log.FromContext(ctx).Error("Failed to fetch role from db", "error", err, "role", role)
				return nil, errSyncPermissionsForbidden
			}
			if roleDTO != nil {
				permissions = append(permissions, roleDTO.Permissions...)
			}
		}

		return permissions, nil
	}

	permissions, err := s.ac.GetUserPermissions(ctx, ident, accesscontrol.Options{ReloadCache: false})
	if err != nil {
		s.log.FromContext(ctx).Error("Failed to fetch permissions from db", "error", err, "id", ident.ID)
		return nil, errSyncPermissionsForbidden
	}
	return permissions, nil
}

func cloudRolesToAddAndRemove(ident *authn.Identity) ([]string, []string, error) {
	const (
		expectedRolesToAddCount = 2
		rolesToRemoveInitialCap = 4
	)
	// Since Cloud Admin/Editor/Viewer roles are not yet implemented one-to-one in the Grafana, it becomes a confusing experience for users,
	// therefore we are doing granular mapping of all available functionality in the Grafana temporary.
	var fixedCloudRoles = map[org.RoleType][]string{
		org.RoleViewer: {accesscontrol.FixedCloudViewerRole, accesscontrol.FixedCloudSupportTicketReader},
		org.RoleEditor: {accesscontrol.FixedCloudEditorRole, accesscontrol.FixedCloudSupportTicketAdmin},
		org.RoleAdmin:  {accesscontrol.FixedCloudAdminRole, accesscontrol.FixedCloudSupportTicketAdmin},
	}

	rolesToAdd := make([]string, 0, expectedRolesToAddCount)
	rolesToRemove := make([]string, 0, rolesToRemoveInitialCap)

	currentRole := ident.GetOrgRole()
	_, validRole := fixedCloudRoles[currentRole]

	if !validRole {
		return nil, nil, errInvalidCloudRole.Errorf("invalid role: %s", currentRole)
	}

	for role, fixedRoles := range fixedCloudRoles {
		for _, fixedRole := range fixedRoles {
			if role == currentRole {
				rolesToAdd = append(rolesToAdd, fixedRole)
			} else {
				rolesToRemove = append(rolesToRemove, fixedRole)
			}
		}
	}

	if len(rolesToAdd) != expectedRolesToAddCount {
		return nil, nil, errInvalidCloudRole.Errorf("invalid role: %s", currentRole)
	}

	return rolesToAdd, rolesToRemove, nil
}

func (s *RBACSync) SyncCloudRoles(ctx context.Context, ident *authn.Identity, r *authn.Request) error {
	ctx, span := s.tracer.Start(ctx, "rbac.sync.SyncCloudRoles")
	defer span.End()

	// we only want to run this hook during login and if the module used is grafana com
	if r.GetMeta(authn.MetaKeyAuthModule) != login.GrafanaComAuthModule {
		return nil
	}

	if !ident.ID.IsType(identity.TypeUser) {
		s.log.FromContext(ctx).Debug("Skip syncing cloud role", "id", ident.ID)
		return nil
	}

	userID, err := ident.ID.ParseInt()
	if err != nil {
		return err
	}

	rolesToAdd, rolesToRemove, err := cloudRolesToAddAndRemove(ident)
	if err != nil {
		return err
	}

	return s.ac.SyncUserRoles(ctx, ident.GetOrgID(), accesscontrol.SyncUserRolesCommand{
		UserID:        userID,
		RolesToAdd:    rolesToAdd,
		RolesToRemove: rolesToRemove,
	})
}
