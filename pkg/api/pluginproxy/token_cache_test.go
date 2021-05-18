package pluginproxy

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type fakeCredential struct {
	key                string
	calledTimes        int
	getAccessTokenFunc func(ctx context.Context, scopes []string) (*AccessToken, error)
}

func (c *fakeCredential) GetCacheKey() string {
	return c.key
}

func (c *fakeCredential) GetAccessToken(ctx context.Context, scopes []string) (*AccessToken, error) {
	c.calledTimes = c.calledTimes + 1
	if c.getAccessTokenFunc != nil {
		return c.getAccessTokenFunc(ctx, scopes)
	}
	fakeAccessToken := &AccessToken{Token: fmt.Sprintf("%v-token-%v", c.key, c.calledTimes), ExpiresOn: timeNow().Add(time.Hour)}
	return fakeAccessToken, nil
}

func TestConcurrentTokenCache_GetAccessToken(t *testing.T) {
	ctx := context.Background()

	scopes1 := []string{"Scope1"}
	scopes2 := []string{"Scope2"}

	t.Run("should request access token from credential", func(t *testing.T) {
		cache := NewConcurrentTokenCache()
		credential := &fakeCredential{key: "credential-1"}

		token, err := cache.GetAccessToken(ctx, credential, scopes1)
		require.NoError(t, err)
		assert.Equal(t, "credential-1-token-1", token)

		assert.Equal(t, 1, credential.calledTimes)
	})

	t.Run("should return cached token for same scopes", func(t *testing.T) {
		var token1, token2 string
		var err error

		cache := NewConcurrentTokenCache()
		credential := &fakeCredential{key: "credential-1"}

		token1, err = cache.GetAccessToken(ctx, credential, scopes1)
		require.NoError(t, err)
		assert.Equal(t, "credential-1-token-1", token1)

		token2, err = cache.GetAccessToken(ctx, credential, scopes2)
		require.NoError(t, err)
		assert.Equal(t, "credential-1-token-2", token2)

		token1, err = cache.GetAccessToken(ctx, credential, scopes1)
		require.NoError(t, err)
		assert.Equal(t, "credential-1-token-1", token1)

		token2, err = cache.GetAccessToken(ctx, credential, scopes2)
		require.NoError(t, err)
		assert.Equal(t, "credential-1-token-2", token2)

		assert.Equal(t, 2, credential.calledTimes)
	})

	t.Run("should return cached token for same credentials", func(t *testing.T) {
		var token1, token2 string
		var err error

		cache := NewConcurrentTokenCache()
		credential1 := &fakeCredential{key: "credential-1"}
		credential2 := &fakeCredential{key: "credential-2"}

		token1, err = cache.GetAccessToken(ctx, credential1, scopes1)
		require.NoError(t, err)
		assert.Equal(t, "credential-1-token-1", token1)

		token2, err = cache.GetAccessToken(ctx, credential2, scopes1)
		require.NoError(t, err)
		assert.Equal(t, "credential-2-token-1", token2)

		token1, err = cache.GetAccessToken(ctx, credential1, scopes1)
		require.NoError(t, err)
		assert.Equal(t, "credential-1-token-1", token1)

		token2, err = cache.GetAccessToken(ctx, credential2, scopes1)
		require.NoError(t, err)
		assert.Equal(t, "credential-2-token-1", token2)

		assert.Equal(t, 1, credential1.calledTimes)
		assert.Equal(t, 1, credential2.calledTimes)
	})
}

func TestScopesCacheEntry_GetAccessToken(t *testing.T) {
	ctx := context.Background()

	scopes := []string{"Scope1"}

	t.Run("when credential returns error", func(t *testing.T) {
		credential := &fakeCredential{
			getAccessTokenFunc: func(ctx context.Context, scopes []string) (*AccessToken, error) {
				invalidToken := &AccessToken{Token: "invalid_token", ExpiresOn: timeNow().Add(time.Hour)}
				return invalidToken, errors.New("unable to get access token")
			},
		}

		t.Run("should return error", func(t *testing.T) {
			cacheEntry := &scopesCacheEntry{
				credential: credential,
				scopes:     scopes,
				cond:       sync.NewCond(&sync.Mutex{}),
			}

			accessToken, err := cacheEntry.getAccessToken(ctx)

			assert.Error(t, err)
			assert.Equal(t, "", accessToken)
		})

		t.Run("should call credential again each time and return error", func(t *testing.T) {
			credential.calledTimes = 0

			cacheEntry := &scopesCacheEntry{
				credential: credential,
				scopes:     scopes,
				cond:       sync.NewCond(&sync.Mutex{}),
			}

			var err error
			_, err = cacheEntry.getAccessToken(ctx)
			assert.Error(t, err)

			_, err = cacheEntry.getAccessToken(ctx)
			assert.Error(t, err)

			_, err = cacheEntry.getAccessToken(ctx)
			assert.Error(t, err)

			assert.Equal(t, 3, credential.calledTimes)
		})
	})

	t.Run("when credential returns error only once", func(t *testing.T) {
		var times = 0
		credential := &fakeCredential{
			getAccessTokenFunc: func(ctx context.Context, scopes []string) (*AccessToken, error) {
				times = times + 1
				if times == 1 {
					invalidToken := &AccessToken{Token: "invalid_token", ExpiresOn: timeNow().Add(time.Hour)}
					return invalidToken, errors.New("unable to get access token")
				}
				fakeAccessToken := &AccessToken{Token: fmt.Sprintf("token-%v", times), ExpiresOn: timeNow().Add(time.Hour)}
				return fakeAccessToken, nil
			},
		}

		t.Run("should call credential again only while it returns error", func(t *testing.T) {
			cacheEntry := &scopesCacheEntry{
				credential: credential,
				scopes:     scopes,
				cond:       sync.NewCond(&sync.Mutex{}),
			}

			var accessToken string
			var err error

			_, err = cacheEntry.getAccessToken(ctx)
			assert.Error(t, err)

			accessToken, err = cacheEntry.getAccessToken(ctx)
			assert.NoError(t, err)
			assert.Equal(t, "token-2", accessToken)

			accessToken, err = cacheEntry.getAccessToken(ctx)
			assert.NoError(t, err)
			assert.Equal(t, "token-2", accessToken)

			assert.Equal(t, 2, credential.calledTimes)
		})
	})

	t.Run("when credential panics", func(t *testing.T) {
		credential := &fakeCredential{
			getAccessTokenFunc: func(ctx context.Context, scopes []string) (*AccessToken, error) {
				panic(errors.New("unable to get access token"))
			},
		}

		t.Run("should call credential again each time", func(t *testing.T) {
			credential.calledTimes = 0

			cacheEntry := &scopesCacheEntry{
				credential: credential,
				scopes:     scopes,
				cond:       sync.NewCond(&sync.Mutex{}),
			}

			func() {
				defer func() {
					assert.NotNil(t, recover(), "credential expected to panic")
				}()
				_, _ = cacheEntry.getAccessToken(ctx)
			}()

			func() {
				defer func() {
					assert.NotNil(t, recover(), "credential expected to panic")
				}()
				_, _ = cacheEntry.getAccessToken(ctx)
			}()

			func() {
				defer func() {
					assert.NotNil(t, recover(), "credential expected to panic")
				}()
				_, _ = cacheEntry.getAccessToken(ctx)
			}()

			assert.Equal(t, 3, credential.calledTimes)
		})
	})

	t.Run("when credential panics only once", func(t *testing.T) {
		var times = 0
		credential := &fakeCredential{
			getAccessTokenFunc: func(ctx context.Context, scopes []string) (*AccessToken, error) {
				times = times + 1
				if times == 1 {
					panic(errors.New("unable to get access token"))
				}
				fakeAccessToken := &AccessToken{Token: fmt.Sprintf("token-%v", times), ExpiresOn: timeNow().Add(time.Hour)}
				return fakeAccessToken, nil
			},
		}

		t.Run("should call credential again only while it panics", func(t *testing.T) {
			cacheEntry := &scopesCacheEntry{
				credential: credential,
				scopes:     scopes,
				cond:       sync.NewCond(&sync.Mutex{}),
			}

			var accessToken string
			var err error

			func() {
				defer func() {
					assert.NotNil(t, recover(), "credential expected to panic")
				}()
				_, _ = cacheEntry.getAccessToken(ctx)
			}()

			func() {
				defer func() {
					assert.Nil(t, recover(), "credential not expected to panic")
				}()
				accessToken, err = cacheEntry.getAccessToken(ctx)
				assert.NoError(t, err)
				assert.Equal(t, "token-2", accessToken)
			}()

			func() {
				defer func() {
					assert.Nil(t, recover(), "credential not expected to panic")
				}()
				accessToken, err = cacheEntry.getAccessToken(ctx)
				assert.NoError(t, err)
				assert.Equal(t, "token-2", accessToken)
			}()

			assert.Equal(t, 2, credential.calledTimes)
		})
	})
}
