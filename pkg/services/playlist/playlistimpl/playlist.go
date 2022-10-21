package playlistimpl

import (
	"context"

	"github.com/grafana/grafana/pkg/infra/db"
	"github.com/grafana/grafana/pkg/services/featuremgmt"
	"github.com/grafana/grafana/pkg/services/playlist"
	"github.com/grafana/grafana/pkg/services/store/object"
)

type Service struct {
	store store
}

var _ playlist.Service = &Service{}

func ProvideService(db db.DB, toggles featuremgmt.FeatureToggles, objserver object.ObjectStoreServer) playlist.Service {
	var sqlstore store

	// 🐢🐢🐢 pick the store
	if toggles.IsEnabled("newDBLibrary") { // hymmm not a registered feature flag
		sqlstore = &sqlxStore{
			sess: db.GetSqlxSession(),
		}
	} else {
		sqlstore = &sqlStore{
			db: db,
		}
	}

	// This is currently a developement only feature toggle
	if toggles.IsEnabled(featuremgmt.FlagObjectStore) {
		impl := &objectStoreImpl{
			backup: sqlstore,
			server: objserver,
			sess:   db.GetSqlxSession(),
		}
		impl.sync() // load everythign from the existing SQL setup into the new object store
		return impl
	}

	return &Service{store: sqlstore}
}

func (s *Service) Create(ctx context.Context, cmd *playlist.CreatePlaylistCommand) (*playlist.Playlist, error) {
	return s.store.Insert(ctx, cmd)
}

func (s *Service) Update(ctx context.Context, cmd *playlist.UpdatePlaylistCommand) (*playlist.PlaylistDTO, error) {
	return s.store.Update(ctx, cmd)
}

func (s *Service) GetWithoutItems(ctx context.Context, q *playlist.GetPlaylistByUidQuery) (*playlist.Playlist, error) {
	return s.store.Get(ctx, q)
}

func (s *Service) Get(ctx context.Context, q *playlist.GetPlaylistByUidQuery) (*playlist.PlaylistDTO, error) {
	v, err := s.store.Get(ctx, q)
	if err != nil {
		return nil, err
	}
	rawItems, err := s.store.GetItems(ctx, &playlist.GetPlaylistItemsByUidQuery{
		PlaylistUID: v.UID,
		OrgId:       q.OrgId,
	})
	if err != nil {
		return nil, err
	}
	items := make([]playlist.PlaylistItemDTO, len(rawItems))
	for i := 0; i < len(rawItems); i++ {
		items[i].Type = playlist.PlaylistItemType(rawItems[i].Type)
		items[i].Value = rawItems[i].Value

		// Add the unused title to the result
		title := rawItems[i].Title
		if title != "" {
			items[i].Title = &title
		}
	}
	return &playlist.PlaylistDTO{
		Uid:      v.UID,
		Name:     v.Name,
		Interval: v.Interval,
		Items:    &items,
	}, nil
}

func (s *Service) Search(ctx context.Context, q *playlist.GetPlaylistsQuery) (playlist.Playlists, error) {
	return s.store.List(ctx, q)
}

func (s *Service) Delete(ctx context.Context, cmd *playlist.DeletePlaylistCommand) error {
	return s.store.Delete(ctx, cmd)
}
