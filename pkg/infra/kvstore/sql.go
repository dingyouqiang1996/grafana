package kvstore

import (
	"context"
	"time"

	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/services/sqlstore"
)

// kvStoreSQL provides a key/value store backed by the Grafana database
type kvStoreSQL struct {
	log      log.Logger
	sqlStore *sqlstore.SQLStore
}

// Get an item from the store
func (kv *kvStoreSQL) Get(ctx context.Context, orgId int64, namespace string, key string) (string, error) {
	item := KVStoreItem{
		OrgId:     &orgId,
		Namespace: &namespace,
		Key:       &key,
	}

	err := kv.sqlStore.WithDbSession(ctx, func(dbSession *sqlstore.DBSession) error {
		has, err := dbSession.Get(&item)
		if err != nil {
			kv.log.Debug("error getting kvstore value", "orgId", orgId, "namespace", namespace, "key", key, "err", err)
			return err
		}
		if !has {
			kv.log.Debug("kvstore value not found", "orgId", orgId, "namespace", namespace, "key", key)
			return ErrNotFound
		}

		kv.log.Debug("got kvstore value", "orgId", orgId, "namespace", namespace, "key", key, "value", item.Value)
		return nil
	})

	return item.Value, err
}

// Set an item in the store
func (kv *kvStoreSQL) Set(ctx context.Context, orgId int64, namespace string, key string, value string) error {
	return kv.sqlStore.WithTransactionalDbSession(ctx, func(dbSession *sqlstore.DBSession) error {
		item := KVStoreItem{
			OrgId:     &orgId,
			Namespace: &namespace,
			Key:       &key,
		}

		has, err := dbSession.Get(&item)
		if err != nil {
			kv.log.Debug("error checking kvstore value", "orgId", orgId, "namespace", namespace, "key", key, "value", value, "err", err)
			return err
		}

		if has && item.Value == value {
			kv.log.Debug("kvstore value not changed", "orgId", orgId, "namespace", namespace, "key", key, "value", value)
			return nil
		}

		item.Value = value
		item.Updated = time.Now()

		if has {
			_, err = dbSession.ID(item.Id).Update(&item)
			if err != nil {
				kv.log.Debug("error updating kvstore value", "orgId", orgId, "namespace", namespace, "key", key, "value", value, "err", err)
			} else {
				kv.log.Debug("kvstore value updated", "orgId", orgId, "namespace", namespace, "key", key, "value", value)
			}
			return err
		}

		item.Created = item.Updated
		_, err = dbSession.Insert(&item)
		if err != nil {
			kv.log.Debug("error inserting kvstore value", "orgId", orgId, "namespace", namespace, "key", key, "value", value, "err", err)
		} else {
			kv.log.Debug("kvstore value inserted", "orgId", orgId, "namespace", namespace, "key", key, "value", value)
		}
		return err
	})
}
