package remotecache

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/grafana/grafana/pkg/infra/db"
	"github.com/grafana/grafana/pkg/infra/log"
)

func TestDatabaseStorageGarbageCollection(t *testing.T) {
	sqlstore := db.InitTestDB(t)

	db := &databaseCache{
		SQLStore: sqlstore,
		codec:    &gobCodec{},
		log:      log.New("remotecache.database"),
	}

	obj := []byte("foolbar")

	// set time.now to 2 weeks ago
	var err error
	getTime = func() time.Time { return time.Now().AddDate(0, 0, -2) }
	err = db.SetByteArray(context.Background(), "key1", obj, 1000*time.Second)
	assert.Equal(t, err, nil)

	err = db.SetByteArray(context.Background(), "key2", obj, 1000*time.Second)
	assert.Equal(t, err, nil)

	err = db.SetByteArray(context.Background(), "key3", obj, 1000*time.Second)
	assert.Equal(t, err, nil)

	// insert object that should never expire
	err = db.SetByteArray(context.Background(), "key4", obj, 0)
	assert.Equal(t, err, nil)

	getTime = time.Now
	err = db.SetByteArray(context.Background(), "key5", obj, 1000*time.Second)
	assert.Equal(t, err, nil)

	// run GC
	db.internalRunGC()

	// try to read values
	_, err = db.GetByteArray(context.Background(), "key1")
	assert.Equal(t, err, ErrCacheItemNotFound, "expected cache item not found. got: ", err)
	_, err = db.GetByteArray(context.Background(), "key2")
	assert.Equal(t, err, ErrCacheItemNotFound)
	_, err = db.GetByteArray(context.Background(), "key3")
	assert.Equal(t, err, ErrCacheItemNotFound)

	_, err = db.GetByteArray(context.Background(), "key4")
	assert.Equal(t, err, nil)
	_, err = db.GetByteArray(context.Background(), "key5")
	assert.Equal(t, err, nil)
}

func TestSecondSet(t *testing.T) {
	var err error
	sqlstore := db.InitTestDB(t)

	db := &databaseCache{
		SQLStore: sqlstore,
		codec:    &gobCodec{},
		log:      log.New("remotecache.database"),
	}

	obj := []byte("hey!")

	err = db.SetByteArray(context.Background(), "killa-gorilla", obj, 0)
	assert.Equal(t, err, nil)

	err = db.SetByteArray(context.Background(), "killa-gorilla", obj, 0)
	assert.Equal(t, err, nil)
}

func TestDatabaseStorageCount(t *testing.T) {
	sqlstore := db.InitTestDB(t)

	db := &databaseCache{
		SQLStore: sqlstore,
		codec:    &gobCodec{},
		log:      log.New("remotecache.database"),
	}

	obj := []byte("foolbar")

	// set time.now to 2 weeks ago
	var err error
	getTime = func() time.Time { return time.Now().AddDate(0, 0, -2) }
	err = db.SetByteArray(context.Background(), "pref-key1", obj, 1000*time.Second)
	require.NoError(t, err)

	err = db.SetByteArray(context.Background(), "pref-key2", obj, 1000*time.Second)
	require.NoError(t, err)

	err = db.SetByteArray(context.Background(), "pref-key3", obj, 1000*time.Second)
	require.NoError(t, err)

	// insert object that should never expire
	err = db.SetByteArray(context.Background(), "pref-key4", obj, 0)
	require.NoError(t, err)

	getTime = time.Now
	err = db.SetByteArray(context.Background(), "pref-key5", obj, 1000*time.Second)
	require.NoError(t, err)

	// run GC
	db.internalRunGC()

	// try to read values
	n, errC := db.Count(context.Background(), "pref-")
	require.NoError(t, errC)
	assert.Equal(t, int64(2), n)
}
