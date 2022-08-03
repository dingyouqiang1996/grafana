package sqlstore

import (
	"context"
	"fmt"

	"xorm.io/xorm"

	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
)

// GetAPIKeys queries the database based
// on input on GetApiKeysQuery
func (ss *SQLStore) GetAPIKeys(ctx context.Context, query *models.GetApiKeysQuery) error {
	return ss.WithDbSession(ctx, func(dbSession *DBSession) error {
		var sess *xorm.Session

		if query.IncludeExpired {
			sess = dbSession.Limit(100, 0).
				Where("org_id=?", query.OrgId).
				Asc("name")
		} else {
			sess = dbSession.Limit(100, 0).
				Where("org_id=? and ( expires IS NULL or expires >= ?)", query.OrgId, timeNow().Unix()).
				Asc("name")
		}

		sess = sess.Where("service_account_id IS NULL")

		if !accesscontrol.IsDisabled(ss.Cfg) {
			filter, err := accesscontrol.Filter(query.User, "id", "apikeys:id:", accesscontrol.ActionAPIKeyRead)
			if err != nil {
				return err
			}
			sess.And(filter.Where, filter.Args...)
		}

		query.Result = make([]*models.ApiKey, 0)
		return sess.Find(&query.Result)
	})
}

// GetAllAPIKeys queries the database for valid non SA APIKeys across all orgs
func (ss *SQLStore) GetAllAPIKeys(ctx context.Context, orgID int64) []*models.ApiKey {
	result := make([]*models.ApiKey, 0)
	err := ss.WithDbSession(ctx, func(dbSession *DBSession) error {
		sess := dbSession.Where("service_account_id IS NULL").Asc("name")
		if orgID != -1 {
			sess = sess.Where("org_id=?", orgID)
		}
		return sess.Find(&result)
	})
	if err != nil {
		ss.log.Warn("API key not loaded", "err", err)
	}
	return result
}

func (ss *SQLStore) GetApiKeyById(ctx context.Context, query *models.GetApiKeyByIdQuery) error {
	return ss.WithDbSession(ctx, func(sess *DBSession) error {
		var apikey models.ApiKey
		has, err := sess.ID(query.ApiKeyId).Get(&apikey)

		if err != nil {
			return err
		} else if !has {
			return models.ErrInvalidApiKey
		}

		query.Result = &apikey
		return nil
	})
}

func (ss *SQLStore) GetApiKeyByName(ctx context.Context, query *models.GetApiKeyByNameQuery) error {
	return ss.WithDbSession(ctx, func(sess *DBSession) error {
		var apikey models.ApiKey
		has, err := sess.Where("org_id=? AND name=?", query.OrgId, query.KeyName).Get(&apikey)

		if err != nil {
			return err
		} else if !has {
			return models.ErrInvalidApiKey
		}

		query.Result = &apikey
		return nil
	})
}

func (ss *SQLStore) GetAPIKeyByHash(ctx context.Context, hash string) (*models.ApiKey, error) {
	var apikey models.ApiKey
	err := ss.WithDbSession(ctx, func(sess *DBSession) error {
		has, err := sess.Table("api_key").Where(fmt.Sprintf("%s = ?", dialect.Quote("key")), hash).Get(&apikey)
		if err != nil {
			return err
		} else if !has {
			return models.ErrInvalidApiKey
		}

		return nil
	})

	return &apikey, err
}

// UpdateAPIKeyLastUsedDate updates the last used date of the API key to current time.
func (ss *SQLStore) UpdateAPIKeyLastUsedDate(ctx context.Context, tokenID int64) error {
	now := timeNow()
	return ss.WithDbSession(ctx, func(sess *DBSession) error {
		if _, err := sess.Table("api_key").ID(tokenID).Cols("last_used_at").Update(&models.ApiKey{LastUsedAt: &now}); err != nil {
			return err
		}

		return nil
	})
}
