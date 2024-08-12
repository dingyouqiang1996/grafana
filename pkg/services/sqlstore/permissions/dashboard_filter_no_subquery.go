package permissions

import (
	"fmt"
	"strings"

	"github.com/grafana/grafana/pkg/apimachinery/identity"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/dashboards"
	"github.com/grafana/grafana/pkg/services/featuremgmt"
	"github.com/grafana/grafana/pkg/services/folder"
	"github.com/grafana/grafana/pkg/services/login"
)

type accessControlDashboardPermissionFilterNoFolderSubquery struct {
	accessControlDashboardPermissionFilter

	folderIsRequired bool
}

func (f *accessControlDashboardPermissionFilterNoFolderSubquery) LeftJoin() string {
	if !f.folderIsRequired {
		return ""
	}
	return " dashboard AS folder ON dashboard.org_id = folder.org_id AND dashboard.folder_id = folder.id"
}

func (f *accessControlDashboardPermissionFilterNoFolderSubquery) buildClauses() {
	if f.user == nil || f.user.IsNil() || len(f.user.GetPermissions()) == 0 {
		f.where = clause{string: "(1 = 0)"}
		return
	}
	dashWildcards := accesscontrol.WildcardsFromPrefix(dashboards.ScopeDashboardsPrefix)
	folderWildcards := accesscontrol.WildcardsFromPrefix(dashboards.ScopeFoldersPrefix)

	var userID int64
	if id, err := identity.UserIdentifier(f.user.GetID()); err == nil {
		userID = id
	}

	orgID := f.user.GetOrgID()
	filter, params := accesscontrol.UserRolesFilter(orgID, userID, f.user.GetTeams(), accesscontrol.GetOrgRoles(f.user))
	rolesFilter := " AND role_id IN(SELECT id FROM role " + filter + ") "
	var args []any
	builder := strings.Builder{}
	builder.WriteRune('(')

	permSelector := strings.Builder{}
	var permSelectorArgs []any

	// useSelfContainedPermissions is true if the user's permissions are stored and set from the JWT token
	// currently it's used for the extended JWT module (when the user is authenticated via a JWT token generated by Grafana)
	useSelfContainedPermissions := f.user.GetAuthenticatedBy() == login.ExtendedJWTModule

	if f.dashboardAction != "" {
		toCheckDashboards := actionsToCheck(f.dashboardAction, f.dashboardActionSets, f.user.GetPermissions(), dashWildcards, folderWildcards)
		toCheckFolders := actionsToCheck(f.dashboardAction, f.folderActionSets, f.user.GetPermissions(), dashWildcards, folderWildcards)

		if len(toCheckDashboards) > 0 {
			if !useSelfContainedPermissions {
				builder.WriteString("(dashboard.uid IN (SELECT identifier FROM permission WHERE kind = 'dashboards' AND attribute = 'uid'")
				builder.WriteString(rolesFilter)
				args = append(args, params...)
				if len(toCheckDashboards) == 1 {
					builder.WriteString(" AND action = ?) AND NOT dashboard.is_folder)")
					args = append(args, toCheckDashboards[0])
				} else {
					builder.WriteString(" AND action IN (?" + strings.Repeat(", ?", len(toCheckDashboards)-1) + ")) AND NOT dashboard.is_folder)")
					args = append(args, toCheckDashboards...)
				}
			} else {
				args = getAllowedUIDs(f.dashboardAction, f.user, dashboards.ScopeDashboardsPrefix)

				// Only add the IN clause if we have any dashboards to check
				if len(args) > 0 {
					builder.WriteString("(dashboard.uid IN (?" + strings.Repeat(", ?", len(args)-1) + "")
					builder.WriteString(") AND NOT dashboard.is_folder)")
				} else {
					builder.WriteString("(1 = 0)")
				}
			}

			builder.WriteString(" OR ")

			if !useSelfContainedPermissions {
				permSelector.WriteString("(SELECT identifier FROM permission WHERE kind = 'folders' AND attribute = 'uid'")
				permSelector.WriteString(rolesFilter)
				permSelectorArgs = append(permSelectorArgs, params...)
				if len(toCheckFolders) == 1 {
					permSelector.WriteString(" AND action = ?")
					permSelectorArgs = append(permSelectorArgs, toCheckFolders[0])
				} else {
					permSelector.WriteString(" AND action IN (?" + strings.Repeat(", ?", len(toCheckFolders)-1) + ")")
					permSelectorArgs = append(permSelectorArgs, toCheckFolders...)
				}
			} else {
				permSelectorArgs = getAllowedUIDs(f.dashboardAction, f.user, dashboards.ScopeFoldersPrefix)

				// Only add the IN clause if we have any folders to check
				if len(permSelectorArgs) > 0 {
					permSelector.WriteString("(?" + strings.Repeat(", ?", len(permSelectorArgs)-1) + "")
				} else {
					permSelector.WriteString("(")
				}
			}

			permSelector.WriteRune(')')

			switch f.features.IsEnabledGlobally(featuremgmt.FlagNestedFolders) {
			case true:
				if len(permSelectorArgs) > 0 {
					switch f.recursiveQueriesAreSupported {
					case true:
						recQueryName := fmt.Sprintf("RecQry%d", len(f.recQueries))
						f.addRecQry(recQueryName, permSelector.String(), permSelectorArgs, orgID)
						builder.WriteString("(folder.uid IN (SELECT uid FROM " + recQueryName)
					default:
						nestedFoldersSelectors, nestedFoldersArgs := f.nestedFoldersSelectors(permSelector.String(), permSelectorArgs, "folder", "uid", "", orgID)
						builder.WriteRune('(')
						builder.WriteString(nestedFoldersSelectors)
						args = append(args, nestedFoldersArgs...)
					}
					f.folderIsRequired = true
					builder.WriteString(") AND NOT dashboard.is_folder)")
				} else {
					builder.WriteString("( 1 = 0 AND NOT dashboard.is_folder)")
				}
			default:
				builder.WriteString("(")
				if len(permSelectorArgs) > 0 {
					builder.WriteString("folder.uid IN ")
					builder.WriteString(permSelector.String())
					args = append(args, permSelectorArgs...)
					f.folderIsRequired = true
				} else {
					builder.WriteString("1 = 0 ")
				}
				builder.WriteString(" AND NOT dashboard.is_folder)")
			}

			// Include all the dashboards under the root if the user has the required permissions on the root (used to be the General folder)
			if hasAccessToRoot(f.dashboardAction, f.user) {
				builder.WriteString(" OR (dashboard.folder_id = 0 AND NOT dashboard.is_folder)")
			}
		} else {
			builder.WriteString("NOT dashboard.is_folder")
		}
	}

	// recycle and reuse
	permSelector.Reset()
	permSelectorArgs = permSelectorArgs[:0]

	if f.folderAction != "" {
		if f.dashboardAction != "" {
			builder.WriteString(" OR ")
		}

		toCheck := actionsToCheck(f.folderAction, f.folderActionSets, f.user.GetPermissions(), folderWildcards)
		if len(toCheck) > 0 {
			if !useSelfContainedPermissions {
				permSelector.WriteString("(SELECT identifier FROM permission WHERE kind = 'folders' AND attribute = 'uid'")
				permSelector.WriteString(rolesFilter)
				permSelectorArgs = append(permSelectorArgs, params...)
				if len(toCheck) == 1 {
					permSelector.WriteString(" AND action = ?")
					permSelectorArgs = append(permSelectorArgs, toCheck[0])
				} else {
					permSelector.WriteString(" AND action IN (?" + strings.Repeat(", ?", len(toCheck)-1) + ")")
					permSelectorArgs = append(permSelectorArgs, toCheck...)
				}
			} else {
				permSelectorArgs = getAllowedUIDs(f.folderAction, f.user, dashboards.ScopeFoldersPrefix)

				if len(permSelectorArgs) > 0 {
					permSelector.WriteString("(?" + strings.Repeat(", ?", len(permSelectorArgs)-1) + "")
				} else {
					permSelector.WriteString("(")
				}
			}
			permSelector.WriteRune(')')

			switch f.features.IsEnabledGlobally(featuremgmt.FlagNestedFolders) {
			case true:
				if len(permSelectorArgs) > 0 {
					switch f.recursiveQueriesAreSupported {
					case true:
						recQueryName := fmt.Sprintf("RecQry%d", len(f.recQueries))
						f.addRecQry(recQueryName, permSelector.String(), permSelectorArgs, orgID)
						builder.WriteString("(dashboard.uid IN ")
						builder.WriteString(fmt.Sprintf("(SELECT uid FROM %s)", recQueryName))
					default:
						nestedFoldersSelectors, nestedFoldersArgs := f.nestedFoldersSelectors(permSelector.String(), permSelectorArgs, "dashboard", "uid", "", orgID)
						builder.WriteRune('(')
						builder.WriteString(nestedFoldersSelectors)
						builder.WriteRune(')')
						args = append(args, nestedFoldersArgs...)
					}
				} else {
					builder.WriteString("(1 = 0")
				}
			default:
				if len(permSelectorArgs) > 0 {
					builder.WriteString("(dashboard.uid IN ")
					builder.WriteString(permSelector.String())
					args = append(args, permSelectorArgs...)
				} else {
					builder.WriteString("(1 = 0")
				}
			}
			builder.WriteString(" AND dashboard.is_folder)")
		} else {
			builder.WriteString("dashboard.is_folder")
		}
	}
	builder.WriteRune(')')

	f.where = clause{string: builder.String(), params: args}
}

func (f *accessControlDashboardPermissionFilterNoFolderSubquery) nestedFoldersSelectors(permSelector string, permSelectorArgs []any, leftTable string, leftCol string, _ string, orgID int64) (string, []any) {
	wheres := make([]string, 0, folder.MaxNestedFolderDepth+1)
	args := make([]any, 0, len(permSelectorArgs)*(folder.MaxNestedFolderDepth+1))

	joins := make([]string, 0, folder.MaxNestedFolderDepth+2)

	// covered by UQE_folder_org_id_parent_uid_title
	tmpl := "INNER JOIN folder %s ON %s.parent_uid = %s.uid AND %s.org_id = %s.org_id "

	// covered by UQE_folder_org_id_uid
	wheres = append(wheres, fmt.Sprintf("(%s.org_id = ? AND %s.%s IN (SELECT f1.uid FROM folder f1 WHERE f1.org_id = ? AND f1.uid IN %s)", leftTable, leftTable, leftCol, permSelector))
	args = append(args, orgID, orgID)
	args = append(args, permSelectorArgs...)

	prev := "f1"
	for i := 2; i <= folder.MaxNestedFolderDepth+2; i++ {
		t := fmt.Sprintf("f%d", i)
		s := fmt.Sprintf(tmpl, t, prev, t, prev, t)
		joins = append(joins, s)

		// covered by UQE_folder_org_id_uid
		wheres = append(wheres, fmt.Sprintf("(%s.org_id = ? AND %s.%s IN (SELECT f1.uid FROM folder f1 %s WHERE %s.org_id = ? AND %s.uid IN %s)", leftTable, leftTable, leftCol, strings.Join(joins, " "), t, t, permSelector))
		args = append(args, orgID, orgID)
		args = append(args, permSelectorArgs...)

		prev = t
	}

	return strings.Join(wheres, ") OR "), args
}
