package legacy

import (
	"context"
	"fmt"
	"text/template"

	"github.com/grafana/authlib/claims"
	"github.com/grafana/grafana/pkg/services/team"
	"github.com/grafana/grafana/pkg/services/user"
	"github.com/grafana/grafana/pkg/storage/legacysql"
	"github.com/grafana/grafana/pkg/storage/unified/sql/sqltemplate"
)

var (
	_ LegacyIdentityStore = (*legacySQLStore)(nil)
)

func NewLegacySQLStores(sql legacysql.LegacyDatabaseProvider) LegacyIdentityStore {
	return &legacySQLStore{
		sql: sql,
	}
}

type legacySQLStore struct {
	sql legacysql.LegacyDatabaseProvider
}

// ListTeams implements LegacyIdentityStore.
func (s *legacySQLStore) ListTeams(ctx context.Context, ns claims.NamespaceInfo, query ListTeamQuery) (*ListTeamResult, error) {
	if query.Limit < 1 {
		query.Limit = 50
	}

	limit := int(query.Limit)
	query.Limit += 1 // for continue
	query.OrgID = ns.OrgID
	if ns.OrgID == 0 {
		return nil, fmt.Errorf("expected non zero orgID")
	}

	sql, err := s.sql(ctx)
	if err != nil {
		return nil, err
	}

	req := newListTeams(sql, &query)
	rawQuery, err := sqltemplate.Execute(sqlQueryTeams, req)
	if err != nil {
		return nil, fmt.Errorf("execute template %q: %w", sqlQueryTeams.Name(), err)
	}
	q := rawQuery

	res := &ListTeamResult{}
	rows, err := sql.DB.GetSqlxSession().Query(ctx, q, req.GetArgs()...)
	defer func() {
		if rows != nil {
			_ = rows.Close()
		}
	}()

	if err == nil {
		// id, uid, name, email, created, updated
		var lastID int64
		for rows.Next() {
			t := team.Team{}
			err = rows.Scan(&t.ID, &t.UID, &t.Name, &t.Email, &t.Created, &t.Updated)
			if err != nil {
				return res, err
			}
			lastID = t.ID
			res.Teams = append(res.Teams, t)
			if len(res.Teams) > limit {
				res.ContinueID = lastID
				break
			}
		}
		if query.UID == "" {
			res.RV, err = sql.GetResourceVersion(ctx, "team", "updated")
		}
	}
	return res, err
}

// ListUsers implements LegacyIdentityStore.
func (s *legacySQLStore) ListUsers(ctx context.Context, ns claims.NamespaceInfo, query ListUserQuery) (*ListUserResult, error) {
	if query.Limit < 1 {
		query.Limit = 50
	}

	limit := int(query.Limit)
	query.Limit += 1 // for continue
	query.OrgID = ns.OrgID
	if ns.OrgID == 0 {
		return nil, fmt.Errorf("expected non zero orgID")
	}

	sql, err := s.sql(ctx)
	if err != nil {
		return nil, err
	}

	res, err := s.queryUsers(ctx, sql, sqlQueryUsers, newListUser(sql, &query), limit)

	if err == nil && query.UID != "" {
		res.RV, err = sql.GetResourceVersion(ctx, "user", "updated")
	}
	return res, err
}

// GetDisplay implements LegacyIdentityStore.
func (s *legacySQLStore) GetDisplay(ctx context.Context, ns claims.NamespaceInfo, query GetUserDisplayQuery) (*ListUserResult, error) {
	query.OrgID = ns.OrgID
	if ns.OrgID == 0 {
		return nil, fmt.Errorf("expected non zero orgID")
	}

	sql, err := s.sql(ctx)
	if err != nil {
		return nil, err
	}

	return s.queryUsers(ctx, sql, sqlQueryDisplay, newGetDisplay(sql, &query), 10000)
}

func (s *legacySQLStore) queryUsers(ctx context.Context, sql *legacysql.LegacyDatabaseHelper, t *template.Template, req sqltemplate.Args, limit int) (*ListUserResult, error) {
	q, err := sqltemplate.Execute(t, req)
	if err != nil {
		return nil, fmt.Errorf("execute template %q: %w", sqlQueryUsers.Name(), err)
	}

	res := &ListUserResult{}
	rows, err := sql.DB.GetSqlxSession().Query(ctx, q, req.GetArgs()...)
	defer func() {
		if rows != nil {
			_ = rows.Close()
		}
	}()

	if err == nil {
		var lastID int64
		for rows.Next() {
			u := user.User{}
			err = rows.Scan(&u.OrgID, &u.ID, &u.UID, &u.Login, &u.Email, &u.Name,
				&u.Created, &u.Updated, &u.IsServiceAccount, &u.IsDisabled, &u.IsAdmin,
			)
			if err != nil {
				return res, err
			}
			lastID = u.ID
			res.Users = append(res.Users, u)
			if len(res.Users) > limit {
				res.ContinueID = lastID
				break
			}
		}
	}
	return res, err
}

// ListTeamsBindings implements LegacyIdentityStore.
func (s *legacySQLStore) ListTeamBindings(ctx context.Context, ns claims.NamespaceInfo, query ListTeamBindingsQuery) (*ListTeamBindingsResult, error) {
	if query.Limit < 1 {
		query.Limit = 50
	}

	limit := int(query.Limit)
	query.Limit += 1 // for continue
	query.OrgID = ns.OrgID
	if query.OrgID == 0 {
		return nil, fmt.Errorf("expected non zero orgID")
	}

	sql, err := s.sql(ctx)
	if err != nil {
		return nil, err
	}

	req := newListTeamBindings(sql, &query)
	q, err := sqltemplate.Execute(sqlQueryTeamBindings, req)
	if err != nil {
		return nil, fmt.Errorf("execute template %q: %w", sqlQueryTeams.Name(), err)
	}

	// FIXME: helper for listing resources
	rows, err := sql.DB.GetSqlxSession().Query(ctx, q, req.GetArgs()...)
	defer func() {
		if rows != nil {
			_ = rows.Close()
		}
	}()

	if err != nil {
		return nil, err
	}

	res := &ListTeamBindingsResult{}
	grouped := map[string][]TeamMember{}

	var lastID int64
	for rows.Next() {
		m := TeamMember{}
		err = rows.Scan(&m.ID, &m.TeamUID, &m.UserUID, &m.Created, &m.Updated, &m.Permission)
		if err != nil {
			return res, err
		}

		lastID = m.ID
		if len(grouped) >= limit {
			res.ContinueID = lastID
			break
		}
		grouped[m.TeamUID] = append(grouped[m.TeamUID], m)
	}

	if query.UID == "" {
		res.RV, err = sql.GetResourceVersion(ctx, "team_member", "updated")
	}

	res.Bindings = make([]TeamBinding, 0, len(grouped))
	for uid, members := range grouped {
		res.Bindings = append(res.Bindings, TeamBinding{
			TeamUID: uid,
			Members: members,
		})
	}

	return res, err
}

// ListTeamMembers implements LegacyIdentityStore.
func (s *legacySQLStore) ListTeamMembers(ctx context.Context, ns claims.NamespaceInfo, query ListTeamMembersQuery) (*ListTeamMembersResult, error) {
	if query.Limit < 1 {
		query.Limit = 50
	}

	limit := int(query.Limit)
	query.Limit += 1 // for continue
	query.OrgID = ns.OrgID
	if query.OrgID == 0 {
		return nil, fmt.Errorf("expected non zero orgID")
	}

	sql, err := s.sql(ctx)
	if err != nil {
		return nil, err
	}

	req := newListTeamMembers(sql, &query)
	q, err := sqltemplate.Execute(sqlQueryTeamMembers, req)
	if err != nil {
		return nil, fmt.Errorf("execute template %q: %w", sqlQueryTeams.Name(), err)
	}

	// FIXME: helper for listing resources
	rows, err := sql.DB.GetSqlxSession().Query(ctx, q, req.GetArgs()...)
	defer func() {
		if rows != nil {
			_ = rows.Close()
		}
	}()

	if err != nil {
		return nil, err
	}

	res := &ListTeamMembersResult{
		Members: []TeamMember{},
	}

	var lastID int64
	for rows.Next() {
		m := TeamMember{}
		err = rows.Scan(&m.ID, &m.TeamUID, &m.UserUID, &m.Created, &m.Updated, &m.Permission)
		if err != nil {
			return res, err
		}

		lastID = m.ID
		if len(res.Members) >= limit {
			res.ContinueID = lastID
			break
		}

		res.Members = append(res.Members, m)
	}

	if query.UserUID == "" && query.TeamUID == "" {
		res.RV, err = sql.GetResourceVersion(ctx, "team_member", "updated")
	}

	return res, err
}

// GetUserTeams implements LegacyIdentityStore.
func (s *legacySQLStore) GetUserTeams(ctx context.Context, ns claims.NamespaceInfo, uid string) ([]team.Team, error) {
	panic("unimplemented")
}
