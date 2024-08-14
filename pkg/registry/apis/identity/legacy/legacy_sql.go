package legacy

import (
	"context"
	"fmt"
	"text/template"

	"github.com/grafana/authlib/claims"
	"github.com/grafana/grafana/pkg/infra/db"
	"github.com/grafana/grafana/pkg/registry/apis/dashboard/legacy"
	"github.com/grafana/grafana/pkg/services/sqlstore/session"
	"github.com/grafana/grafana/pkg/services/team"
	"github.com/grafana/grafana/pkg/services/user"
	"github.com/grafana/grafana/pkg/storage/unified/sql/sqltemplate"
)

var (
	_ LegacyIdentityStore = (*legacySQLStore)(nil)
)

type legacySQLStore struct {
	sql     db.DB
	dialect sqltemplate.Dialect
	sess    *session.SessionDB
	teamsRV legacy.ResourceVersionLookup
	usersRV legacy.ResourceVersionLookup
}

func NewLegacySQLStores(sql db.DB) (LegacyIdentityStore, error) {
	dialect := sqltemplate.DialectForDriver(string(sql.GetDBType()))
	if dialect == nil {
		return nil, fmt.Errorf("unknown dialect")
	}

	return &legacySQLStore{
		sql:     sql,
		sess:    sql.GetSqlxSession(),
		dialect: dialect,
		teamsRV: legacy.GetResourceVersionLookup(sql, "team"),
		usersRV: legacy.GetResourceVersionLookup(sql, "user"),
	}, nil
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

	req := sqlQueryListTeams{
		SQLTemplate: sqltemplate.New(s.dialect),
		Query:       &query,
	}

	rawQuery, err := sqltemplate.Execute(sqlQueryTeams, req)
	if err != nil {
		return nil, fmt.Errorf("execute template %q: %w", sqlQueryTeams.Name(), err)
	}
	q := rawQuery

	fmt.Printf("%s // %v\n", rawQuery, req.GetArgs())

	res := &ListTeamResult{}
	rows, err := s.sess.Query(ctx, q, req.GetArgs()...)
	defer func() {
		if rows != nil {
			_ = rows.Close()
		}
	}()

	if err == nil {
		// id, uid, name, email, created, updated
		lastID := int64(1)
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
			res.RV, err = s.teamsRV(ctx)
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

	return s.queryUsers(ctx, sqlQueryUsers, sqlQueryListUsers{
		SQLTemplate: sqltemplate.New(s.dialect),
		Query:       &query,
	}, limit, query.UID != "")
}

func (s *legacySQLStore) queryUsers(ctx context.Context, t *template.Template, req sqltemplate.ArgsIface, limit int, getRV bool) (*ListUserResult, error) {
	rawQuery, err := sqltemplate.Execute(t, req)
	if err != nil {
		return nil, fmt.Errorf("execute template %q: %w", sqlQueryUsers.Name(), err)
	}
	q := rawQuery

	fmt.Printf("%s // %v\n", rawQuery, req.GetArgs())

	res := &ListUserResult{}
	rows, err := s.sess.Query(ctx, q, req.GetArgs()...)
	defer func() {
		if rows != nil {
			_ = rows.Close()
		}
	}()

	if err == nil {
		lastID := int64(1)
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
		if getRV {
			res.RV, err = s.usersRV(ctx)
		}
	}
	return res, err
}

// GetUserTeams implements LegacyIdentityStore.
func (s *legacySQLStore) GetUserTeams(ctx context.Context, ns claims.NamespaceInfo, uid string) ([]team.Team, error) {
	panic("unimplemented")
}

// GetDisplay implements LegacyIdentityStore.
func (s *legacySQLStore) GetDisplay(ctx context.Context, ns claims.NamespaceInfo, query GetUserDisplayQuery) (*ListUserResult, error) {
	query.OrgID = ns.OrgID
	if ns.OrgID == 0 {
		return nil, fmt.Errorf("expected non zero orgID")
	}

	return s.queryUsers(ctx, sqlQueryDisplay, sqlQueryGetDisplay{
		SQLTemplate: sqltemplate.New(s.dialect),
		Query:       &query,
	}, 10000, false)
}
