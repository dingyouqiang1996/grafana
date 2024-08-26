package remotecache

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/prometheus/client_golang/prometheus"

	"github.com/grafana/grafana/pkg/infra/db"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/infra/remotecache/common"
	"github.com/grafana/grafana/pkg/infra/remotecache/ring"
	"github.com/grafana/grafana/pkg/infra/usagestats"
	"github.com/grafana/grafana/pkg/registry"
	"github.com/grafana/grafana/pkg/services/grpcserver"
	"github.com/grafana/grafana/pkg/services/secrets"
	"github.com/grafana/grafana/pkg/setting"
)

var (
	// ErrCacheItemNotFound is returned if cache does not exist
	ErrCacheItemNotFound = common.ErrCacheItemNotFound

	defaultMaxCacheExpiration = time.Hour * 24
)

func ProvideService(
	cfg *setting.Cfg, sqlStore db.DB, usageStats usagestats.Service,
	secretsService secrets.Service, grpcProvider grpcserver.Provider, reg prometheus.Registerer,
) (*RemoteCache, error) {
	logger := log.New("remote-cache")
	client, err := createClient(cfg, sqlStore, logger, secretsService, grpcProvider, reg)
	if err != nil {
		return nil, err
	}

	s := &RemoteCache{
		cfg:     cfg,
		client:  client,
		logger:  logger,
		metrics: newMetrics(reg),
	}

	usageStats.RegisterMetricsFunc(s.getUsageStats)

	return s, nil
}

func (ds *RemoteCache) getUsageStats(ctx context.Context) (map[string]any, error) {
	stats := map[string]any{}
	stats["stats.remote_cache."+ds.cfg.RemoteCache.Name+".count"] = 1
	encryptVal := 0
	if ds.cfg.RemoteCache.Encryption {
		encryptVal = 1
	}

	stats["stats.remote_cache.encrypt_enabled.count"] = encryptVal

	return stats, nil
}

// CacheStorage allows the caller to set, get and delete items in the cache.
// Cached items are stored as byte arrays and marshalled using "encoding/gob"
// so any struct added to the cache needs to be registered with `remotecache.Register`
// ex `remotecache.Register(CacheableStruct{})`
type CacheStorage interface {
	// Get gets the cache value as an byte array
	Get(ctx context.Context, key string) ([]byte, error)

	// Set saves the value as an byte array. if `expire` is set to zero it will default to 24h
	Set(ctx context.Context, key string, value []byte, expire time.Duration) error

	// Delete object from cache
	Delete(ctx context.Context, key string) error
}

// RemoteCache allows Grafana to cache data outside its own process
type RemoteCache struct {
	client  CacheStorage
	cfg     *setting.Cfg
	logger  log.Logger
	metrics *metrics
}

// Get returns the cached value as an byte array
func (ds *RemoteCache) Get(ctx context.Context, key string) ([]byte, error) {
	value, err := ds.client.Get(ctx, key)
	if err != nil {
		if errors.Is(err, ErrCacheItemNotFound) {
			ds.metrics.cacheUsage.WithLabelValues(cacheMiss).Inc()
		} else {
			ds.metrics.cacheUsage.WithLabelValues(cacheError).Inc()
		}
		return nil, err
	}

	ds.metrics.cacheUsage.WithLabelValues(cacheHit).Inc()
	return value, nil
}

// Set stored the byte array in the cache
func (ds *RemoteCache) Set(ctx context.Context, key string, value []byte, expire time.Duration) error {
	if expire == 0 {
		expire = defaultMaxCacheExpiration
	}

	return ds.client.Set(ctx, key, value, expire)
}

// Delete object from cache
func (ds *RemoteCache) Delete(ctx context.Context, key string) error {
	return ds.client.Delete(ctx, key)
}

// Run starts the backend processes for cache clients.
func (ds *RemoteCache) Run(ctx context.Context) error {
	// create new interface if more clients need GC jobs
	backgroundjob, ok := ds.client.(registry.BackgroundService)
	if ok {
		return backgroundjob.Run(ctx)
	}

	<-ctx.Done()
	return ctx.Err()
}

// ServeHTTP is used to expose debug endpoints for remote cache
func (ds *RemoteCache) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if ds.cfg.Env != setting.Dev {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	handler, ok := ds.client.(http.Handler)
	if !ok {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	handler.ServeHTTP(w, r)
}

func createClient(
	cfg *setting.Cfg, sqlstore db.DB, logger log.Logger,
	secretsService secrets.Service, grpcProvider grpcserver.Provider, reg prometheus.Registerer,
) (cache CacheStorage, err error) {
	switch cfg.RemoteCache.Name {
	case redisCacheType:
		cache, err = newRedisStorage(cfg.RemoteCache)
	case memcachedCacheType:
		cache = newMemcachedStorage(cfg.RemoteCache)
	case ring.CacheType:
		if !grpcProvider.IsDisabled() {
			cache, err = ring.NewCache(cfg, reg, grpcProvider)
		} else {
			logger.Warn("grpcServer feature toggle needs to be enabled when using ring cache, falling back to database")
			cache = newDatabaseCache(sqlstore)
		}
	default:
		cache = newDatabaseCache(sqlstore)
	}

	if err != nil {
		return nil, err
	}

	if cfg.RemoteCache.Prefix != "" {
		cache = &prefixCacheStorage{cache: cache, prefix: cfg.RemoteCache.Prefix}
	}

	if cfg.RemoteCache.Encryption {
		cache = &encryptedCacheStorage{cache: cache, secretsService: secretsService}
	}
	return cache, nil
}

type encryptedCacheStorage struct {
	cache          CacheStorage
	secretsService encryptionService
}

type encryptionService interface {
	Encrypt(ctx context.Context, payload []byte, opt secrets.EncryptionOptions) ([]byte, error)
	Decrypt(ctx context.Context, payload []byte) ([]byte, error)
}

func (pcs *encryptedCacheStorage) Get(ctx context.Context, key string) ([]byte, error) {
	data, err := pcs.cache.Get(ctx, key)
	if err != nil {
		return nil, err
	}

	return pcs.secretsService.Decrypt(ctx, data)
}
func (pcs *encryptedCacheStorage) Set(ctx context.Context, key string, value []byte, expire time.Duration) error {
	encrypted, err := pcs.secretsService.Encrypt(ctx, value, secrets.WithoutScope())
	if err != nil {
		return err
	}

	return pcs.cache.Set(ctx, key, encrypted, expire)
}
func (pcs *encryptedCacheStorage) Delete(ctx context.Context, key string) error {
	return pcs.cache.Delete(ctx, key)
}

type prefixCacheStorage struct {
	cache  CacheStorage
	prefix string
}

func (pcs *prefixCacheStorage) Get(ctx context.Context, key string) ([]byte, error) {
	return pcs.cache.Get(ctx, pcs.prefix+key)
}
func (pcs *prefixCacheStorage) Set(ctx context.Context, key string, value []byte, expire time.Duration) error {
	return pcs.cache.Set(ctx, pcs.prefix+key, value, expire)
}
func (pcs *prefixCacheStorage) Delete(ctx context.Context, key string) error {
	return pcs.cache.Delete(ctx, pcs.prefix+key)
}
