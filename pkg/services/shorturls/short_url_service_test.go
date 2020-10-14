package shorturls

import (
	"context"
	"testing"

	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/sqlstore"
	"github.com/stretchr/testify/require"
)

func TestShortURLService(t *testing.T) {
	user := &models.SignedInUser{UserId: 1}
	sqlStore := sqlstore.InitTestDB(t)

	t.Run("User can create and read short URLs", func(t *testing.T) {
		const refPath = "mock/path?test=true"

		service := ShortURLService{SQLStore: sqlStore}

		newShortURL, err := service.CreateShortURL(context.Background(), user, refPath)
		require.NoError(t, err)
		require.NotNil(t, newShortURL)
		require.NotEmpty(t, newShortURL.Uid)

		existingShortURL, err := service.GetShortURLByUID(context.Background(), user, newShortURL.Uid)
		require.NoError(t, err)
		require.NotNil(t, existingShortURL)
		require.NotEmpty(t, existingShortURL.Path)
		require.Equal(t, refPath, existingShortURL.Path)
	})

	t.Run("User cannot look up nonexistent short URLs", func(t *testing.T) {
		service := ShortURLService{SQLStore: sqlStore}

		shortURL, err := service.GetShortURLByUID(context.Background(), user, "testnotfounduid")
		require.Error(t, err)
		require.Equal(t, models.ErrShortURLNotFound, err)
		require.Nil(t, shortURL)
	})
}
