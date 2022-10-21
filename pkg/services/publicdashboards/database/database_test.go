package database

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/grafana/grafana/pkg/components/simplejson"
	"github.com/grafana/grafana/pkg/infra/db"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/dashboards"
	dashboardsDB "github.com/grafana/grafana/pkg/services/dashboards/database"
	"github.com/grafana/grafana/pkg/services/featuremgmt"
	"github.com/grafana/grafana/pkg/services/publicdashboards/internal/tokens"
	. "github.com/grafana/grafana/pkg/services/publicdashboards/models"
	"github.com/grafana/grafana/pkg/services/tag/tagimpl"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/grafana/grafana/pkg/util"
)

// This is what the db sets empty time settings to
var DefaultTimeSettings = &TimeSettings{}

// Default time to pass in with seconds rounded
var DefaultTime = time.Now().UTC().Round(time.Second)

func TestLogPrefix(t *testing.T) {
	assert.Equal(t, LogPrefix, "publicdashboards.store")
}

func TestIntegrationListPublicDashboard(t *testing.T) {
	sqlStore, cfg := db.InitTestDBwithCfg(t, db.InitTestDBOpt{FeatureFlags: []string{featuremgmt.FlagPublicDashboards}})
	dashboardStore := dashboardsDB.ProvideDashboardStore(sqlStore, cfg, featuremgmt.WithFeatures(), tagimpl.ProvideService(sqlStore, cfg))
	publicdashboardStore := ProvideStore(sqlStore)

	var orgId int64 = 1

	aDash := insertTestDashboard(t, dashboardStore, "a", orgId, 0, true)
	bDash := insertTestDashboard(t, dashboardStore, "b", orgId, 0, true)
	cDash := insertTestDashboard(t, dashboardStore, "c", orgId, 0, true)

	// these are in order of how they should be returned from ListPUblicDashboards
	a := insertPublicDashboard(t, publicdashboardStore, bDash.Uid, orgId, true)
	b := insertPublicDashboard(t, publicdashboardStore, cDash.Uid, orgId, true)
	c := insertPublicDashboard(t, publicdashboardStore, aDash.Uid, orgId, false)

	// this is case that can happen as of now, however, postgres and mysql sort
	// null in the exact opposite fashion and there is no shared syntax to sort
	// nulls in the same way in all 3 db's.
	//d := insertPublicDashboard(t, publicdashboardStore, "missing", orgId, false)

	// should not be included in response
	_ = insertPublicDashboard(t, publicdashboardStore, "wrongOrgId", 777, false)

	resp, err := publicdashboardStore.ListPublicDashboards(context.Background(), orgId)
	require.NoError(t, err)

	assert.Len(t, resp, 3)
	assert.Equal(t, resp[0].Uid, a.Uid)
	assert.Equal(t, resp[1].Uid, b.Uid)
	assert.Equal(t, resp[2].Uid, c.Uid)
}

func TestIntegrationGetDashboard(t *testing.T) {
	var sqlStore db.DB
	var cfg *setting.Cfg
	var dashboardStore *dashboardsDB.DashboardStore
	var publicdashboardStore *PublicDashboardStoreImpl
	var savedDashboard *models.Dashboard

	setup := func() {
		sqlStore, cfg = db.InitTestDBwithCfg(t)
		dashboardStore = dashboardsDB.ProvideDashboardStore(sqlStore, cfg, featuremgmt.WithFeatures(), tagimpl.ProvideService(sqlStore, cfg))
		publicdashboardStore = ProvideStore(sqlStore)
		savedDashboard = insertTestDashboard(t, dashboardStore, "testDashie", 1, 0, true)
	}

	t.Run("GetDashboard can get original dashboard by uid", func(t *testing.T) {
		setup()

		dashboard, err := publicdashboardStore.GetDashboard(context.Background(), savedDashboard.Uid)

		require.NoError(t, err)
		require.Equal(t, savedDashboard.Uid, dashboard.Uid)
	})
}

func TestIntegrationEnabledPublicDashboardExistsByAccessToken(t *testing.T) {
	var sqlStore db.DB
	var cfg *setting.Cfg
	var dashboardStore *dashboardsDB.DashboardStore
	var publicdashboardStore *PublicDashboardStoreImpl
	var savedDashboard *models.Dashboard

	setup := func() {
		sqlStore, cfg = db.InitTestDBwithCfg(t)
		dashboardStore = dashboardsDB.ProvideDashboardStore(sqlStore, cfg, featuremgmt.WithFeatures(), tagimpl.ProvideService(sqlStore, cfg))
		publicdashboardStore = ProvideStore(sqlStore)
		savedDashboard = insertTestDashboard(t, dashboardStore, "testDashie", 1, 0, true)
	}
	t.Run("PublicDashboardEnabledExistsByAccessToken will return true when at least one public dashboard has a matching access token", func(t *testing.T) {
		setup()

		err := publicdashboardStore.SavePublicDashboard(context.Background(), SavePublicDashboardConfigCommand{
			PublicDashboard: PublicDashboard{
				IsEnabled:    true,
				Uid:          "abc123",
				DashboardUid: savedDashboard.Uid,
				OrgId:        savedDashboard.OrgId,
				CreatedAt:    time.Now(),
				CreatedBy:    7,
				AccessToken:  "accessToken",
			},
		})
		require.NoError(t, err)

		res, err := publicdashboardStore.PublicDashboardEnabledExistsByAccessToken(context.Background(), "accessToken")
		require.NoError(t, err)

		require.True(t, res)
	})

	t.Run("PublicDashboardEnabledExistsByAccessToken will return false when IsEnabled=false", func(t *testing.T) {
		setup()

		err := publicdashboardStore.SavePublicDashboard(context.Background(), SavePublicDashboardConfigCommand{
			PublicDashboard: PublicDashboard{
				IsEnabled:    false,
				Uid:          "abc123",
				DashboardUid: savedDashboard.Uid,
				OrgId:        savedDashboard.OrgId,
				CreatedAt:    time.Now(),
				CreatedBy:    7,
				AccessToken:  "accessToken",
			},
		})
		require.NoError(t, err)

		res, err := publicdashboardStore.PublicDashboardEnabledExistsByAccessToken(context.Background(), "accessToken")
		require.NoError(t, err)

		require.False(t, res)
	})

	t.Run("PublicDashboardEnabledExistsByAccessToken will return false when no public dashboard has matching access token", func(t *testing.T) {
		setup()

		res, err := publicdashboardStore.PublicDashboardEnabledExistsByAccessToken(context.Background(), "accessToken")

		require.NoError(t, err)
		require.False(t, res)
	})
}

func TestIntegrationEnabledPublicDashboardExistsByDashboardUid(t *testing.T) {
	var sqlStore db.DB
	var cfg *setting.Cfg
	var dashboardStore *dashboardsDB.DashboardStore
	var publicdashboardStore *PublicDashboardStoreImpl
	var savedDashboard *models.Dashboard

	setup := func() {
		sqlStore, cfg = db.InitTestDBwithCfg(t)
		dashboardStore = dashboardsDB.ProvideDashboardStore(sqlStore, cfg, featuremgmt.WithFeatures(), tagimpl.ProvideService(sqlStore, cfg))
		publicdashboardStore = ProvideStore(sqlStore)
		savedDashboard = insertTestDashboard(t, dashboardStore, "testDashie", 1, 0, true)
	}

	t.Run("PublicDashboardEnabledExistsByDashboardUid Will return true when dashboard has at least one enabled public dashboard", func(t *testing.T) {
		setup()

		err := publicdashboardStore.SavePublicDashboard(context.Background(), SavePublicDashboardConfigCommand{
			PublicDashboard: PublicDashboard{
				IsEnabled:    true,
				Uid:          "abc123",
				DashboardUid: savedDashboard.Uid,
				OrgId:        savedDashboard.OrgId,
				CreatedAt:    time.Now(),
				CreatedBy:    7,
				AccessToken:  "NOTAREALUUID",
			},
		})
		require.NoError(t, err)

		res, err := publicdashboardStore.PublicDashboardEnabledExistsByDashboardUid(context.Background(), savedDashboard.Uid)
		require.NoError(t, err)

		require.True(t, res)
	})

	t.Run("PublicDashboardEnabledExistsByDashboardUid will return false when dashboard has public dashboards but they are not enabled", func(t *testing.T) {
		setup()

		err := publicdashboardStore.SavePublicDashboard(context.Background(), SavePublicDashboardConfigCommand{
			PublicDashboard: PublicDashboard{
				IsEnabled:    false,
				Uid:          "abc123",
				DashboardUid: savedDashboard.Uid,
				OrgId:        savedDashboard.OrgId,
				CreatedAt:    time.Now(),
				CreatedBy:    7,
				AccessToken:  "NOTAREALUUID",
			},
		})
		require.NoError(t, err)

		res, err := publicdashboardStore.PublicDashboardEnabledExistsByDashboardUid(context.Background(), savedDashboard.Uid)
		require.NoError(t, err)

		require.False(t, res)
	})
}

func TestIntegrationGetPublicDashboardAndDashboard(t *testing.T) {
	var sqlStore db.DB
	var cfg *setting.Cfg
	var dashboardStore *dashboardsDB.DashboardStore
	var publicdashboardStore *PublicDashboardStoreImpl
	var savedDashboard *models.Dashboard

	setup := func() {
		sqlStore, cfg = db.InitTestDBwithCfg(t)
		dashboardStore = dashboardsDB.ProvideDashboardStore(sqlStore, cfg, featuremgmt.WithFeatures(), tagimpl.ProvideService(sqlStore, cfg))
		publicdashboardStore = ProvideStore(sqlStore)
		savedDashboard = insertTestDashboard(t, dashboardStore, "testDashie", 1, 0, true)
	}

	t.Run("returns PublicDashboard and Dashboard", func(t *testing.T) {
		setup()
		cmd := SavePublicDashboardConfigCommand{
			PublicDashboard: PublicDashboard{
				IsEnabled:    true,
				Uid:          "abc1234",
				DashboardUid: savedDashboard.Uid,
				OrgId:        savedDashboard.OrgId,
				TimeSettings: DefaultTimeSettings,
				CreatedAt:    DefaultTime,
				CreatedBy:    7,
				AccessToken:  "NOTAREALUUID",
			},
		}

		err := publicdashboardStore.SavePublicDashboard(context.Background(), cmd)
		require.NoError(t, err)

		pd, d, err := publicdashboardStore.GetPublicDashboardAndDashboard(context.Background(), "NOTAREALUUID")
		require.NoError(t, err)

		assert.Equal(t, pd, &cmd.PublicDashboard)
		assert.Equal(t, d.Uid, cmd.PublicDashboard.DashboardUid)
	})

	t.Run("returns ErrPublicDashboardNotFound with empty uid", func(t *testing.T) {
		setup()
		_, _, err := publicdashboardStore.GetPublicDashboardAndDashboard(context.Background(), "")
		require.Error(t, ErrPublicDashboardIdentifierNotSet, err)
	})

	t.Run("returns ErrPublicDashboardNotFound when PublicDashboard not found", func(t *testing.T) {
		setup()
		_, _, err := publicdashboardStore.GetPublicDashboardAndDashboard(context.Background(), "zzzzzz")
		require.Error(t, ErrPublicDashboardNotFound, err)
	})

	t.Run("returns ErrDashboardNotFound when Dashboard not found", func(t *testing.T) {
		setup()
		err := publicdashboardStore.SavePublicDashboard(context.Background(), SavePublicDashboardConfigCommand{
			PublicDashboard: PublicDashboard{
				IsEnabled:    true,
				Uid:          "abc1234",
				DashboardUid: "nevergonnafindme",
				OrgId:        savedDashboard.OrgId,
				CreatedAt:    DefaultTime,
				CreatedBy:    7,
			},
		})
		require.NoError(t, err)
		_, _, err = publicdashboardStore.GetPublicDashboardAndDashboard(context.Background(), "abc1234")
		require.Error(t, dashboards.ErrDashboardNotFound, err)
	})
}

func TestIntegrationGetPublicDashboard(t *testing.T) {
	var sqlStore db.DB
	var cfg *setting.Cfg
	var dashboardStore *dashboardsDB.DashboardStore
	var publicdashboardStore *PublicDashboardStoreImpl
	var savedDashboard *models.Dashboard

	setup := func() {
		sqlStore, cfg = db.InitTestDBwithCfg(t)
		dashboardStore = dashboardsDB.ProvideDashboardStore(sqlStore, cfg, featuremgmt.WithFeatures(), tagimpl.ProvideService(sqlStore, cfg))
		publicdashboardStore = ProvideStore(sqlStore)
		savedDashboard = insertTestDashboard(t, dashboardStore, "testDashie", 1, 0, true)
	}

	t.Run("returns isPublic and set dashboardUid and orgId", func(t *testing.T) {
		setup()
		pubdash, err := publicdashboardStore.GetPublicDashboard(context.Background(), savedDashboard.OrgId, savedDashboard.Uid)
		require.NoError(t, err)
		assert.Equal(t, &PublicDashboard{IsEnabled: false, DashboardUid: savedDashboard.Uid, OrgId: savedDashboard.OrgId}, pubdash)
	})

	t.Run("returns dashboard errDashboardIdentifierNotSet", func(t *testing.T) {
		setup()
		_, err := publicdashboardStore.GetPublicDashboard(context.Background(), savedDashboard.OrgId, "")
		require.Error(t, dashboards.ErrDashboardIdentifierNotSet, err)
	})

	t.Run("returns along with public dashboard when exists", func(t *testing.T) {
		setup()
		cmd := SavePublicDashboardConfigCommand{
			PublicDashboard: PublicDashboard{
				IsEnabled:    true,
				Uid:          "pubdash-uid",
				DashboardUid: savedDashboard.Uid,
				OrgId:        savedDashboard.OrgId,
				TimeSettings: DefaultTimeSettings,
				CreatedAt:    DefaultTime,
				CreatedBy:    7,
			},
		}

		// insert test public dashboard
		err := publicdashboardStore.SavePublicDashboard(context.Background(), cmd)
		require.NoError(t, err)

		// retrieve from db
		pubdash, err := publicdashboardStore.GetPublicDashboard(context.Background(), savedDashboard.OrgId, savedDashboard.Uid)
		require.NoError(t, err)

		assert.True(t, assert.ObjectsAreEqualValues(&cmd.PublicDashboard, pubdash))
	})
}

func TestIntegrationSavePublicDashboard(t *testing.T) {
	var sqlStore db.DB
	var cfg *setting.Cfg
	var dashboardStore *dashboardsDB.DashboardStore
	var publicdashboardStore *PublicDashboardStoreImpl
	var savedDashboard *models.Dashboard
	var savedDashboard2 *models.Dashboard

	setup := func() {
		sqlStore, cfg = db.InitTestDBwithCfg(t, db.InitTestDBOpt{FeatureFlags: []string{featuremgmt.FlagPublicDashboards}})
		dashboardStore = dashboardsDB.ProvideDashboardStore(sqlStore, cfg, featuremgmt.WithFeatures(), tagimpl.ProvideService(sqlStore, cfg))
		publicdashboardStore = ProvideStore(sqlStore)
		savedDashboard = insertTestDashboard(t, dashboardStore, "testDashie", 1, 0, true)
		savedDashboard2 = insertTestDashboard(t, dashboardStore, "testDashie2", 1, 0, true)
	}

	t.Run("saves new public dashboard", func(t *testing.T) {
		setup()
		err := publicdashboardStore.SavePublicDashboard(context.Background(), SavePublicDashboardConfigCommand{
			PublicDashboard: PublicDashboard{
				IsEnabled:    true,
				Uid:          "pubdash-uid",
				DashboardUid: savedDashboard.Uid,
				OrgId:        savedDashboard.OrgId,
				TimeSettings: DefaultTimeSettings,
				CreatedAt:    DefaultTime,
				CreatedBy:    7,
				AccessToken:  "NOTAREALUUID",
			},
		})
		require.NoError(t, err)

		pubdash, err := publicdashboardStore.GetPublicDashboard(context.Background(), savedDashboard.OrgId, savedDashboard.Uid)
		require.NoError(t, err)

		// verify we have a valid uid
		assert.True(t, util.IsValidShortUID(pubdash.Uid))

		// verify we didn't update all dashboards
		pubdash2, err := publicdashboardStore.GetPublicDashboard(context.Background(), savedDashboard2.OrgId, savedDashboard2.Uid)
		require.NoError(t, err)
		assert.False(t, pubdash2.IsEnabled)
	})

	t.Run("guards from saving without dashboardUid", func(t *testing.T) {
		setup()
		err := publicdashboardStore.SavePublicDashboard(context.Background(), SavePublicDashboardConfigCommand{
			PublicDashboard: PublicDashboard{
				IsEnabled:    true,
				Uid:          "pubdash-uid",
				DashboardUid: "",
				OrgId:        savedDashboard.OrgId,
				TimeSettings: DefaultTimeSettings,
				CreatedAt:    DefaultTime,
				CreatedBy:    7,
				AccessToken:  "NOTAREALUUID",
			},
		})
		assert.Error(t, err, dashboards.ErrDashboardIdentifierNotSet)
	})
}

func TestIntegrationUpdatePublicDashboard(t *testing.T) {
	var sqlStore db.DB
	var cfg *setting.Cfg
	var dashboardStore *dashboardsDB.DashboardStore
	var publicdashboardStore *PublicDashboardStoreImpl
	var savedDashboard *models.Dashboard
	var anotherSavedDashboard *models.Dashboard

	setup := func() {
		sqlStore, cfg = db.InitTestDBwithCfg(t, db.InitTestDBOpt{FeatureFlags: []string{featuremgmt.FlagPublicDashboards}})
		dashboardStore = dashboardsDB.ProvideDashboardStore(sqlStore, cfg, featuremgmt.WithFeatures(), tagimpl.ProvideService(sqlStore, cfg))
		publicdashboardStore = ProvideStore(sqlStore)
		savedDashboard = insertTestDashboard(t, dashboardStore, "testDashie", 1, 0, true)
		anotherSavedDashboard = insertTestDashboard(t, dashboardStore, "test another Dashie", 1, 0, true)
	}

	t.Run("updates an existing dashboard", func(t *testing.T) {
		setup()

		pdUid := "asdf1234"
		err := publicdashboardStore.SavePublicDashboard(context.Background(), SavePublicDashboardConfigCommand{
			PublicDashboard: PublicDashboard{
				Uid:          pdUid,
				DashboardUid: savedDashboard.Uid,
				OrgId:        savedDashboard.OrgId,
				IsEnabled:    true,
				CreatedAt:    DefaultTime,
				CreatedBy:    7,
				AccessToken:  "NOTAREALUUID",
			},
		})
		require.NoError(t, err)

		// inserting two different public dashboards to test update works and only affect the desired pd by uid
		anotherPdUid := "anotherUid"
		err = publicdashboardStore.SavePublicDashboard(context.Background(), SavePublicDashboardConfigCommand{
			PublicDashboard: PublicDashboard{
				Uid:          anotherPdUid,
				DashboardUid: anotherSavedDashboard.Uid,
				OrgId:        anotherSavedDashboard.OrgId,
				IsEnabled:    true,
				CreatedAt:    DefaultTime,
				CreatedBy:    7,
				AccessToken:  "fakeaccesstoken",
			},
		})
		require.NoError(t, err)

		updatedPublicDashboard := PublicDashboard{
			Uid:          pdUid,
			DashboardUid: savedDashboard.Uid,
			OrgId:        savedDashboard.OrgId,
			IsEnabled:    false,
			TimeSettings: &TimeSettings{From: "now-8", To: "now"},
			UpdatedAt:    time.Now().UTC().Round(time.Second),
			UpdatedBy:    8,
		}
		// update initial record
		err = publicdashboardStore.UpdatePublicDashboard(context.Background(), SavePublicDashboardConfigCommand{
			PublicDashboard: updatedPublicDashboard,
		})
		require.NoError(t, err)

		// updated dashboard should have changed
		pdRetrieved, err := publicdashboardStore.GetPublicDashboard(context.Background(), savedDashboard.OrgId, savedDashboard.Uid)
		require.NoError(t, err)

		assert.Equal(t, updatedPublicDashboard.UpdatedAt, pdRetrieved.UpdatedAt)
		// make sure we're correctly updated IsEnabled because we have to call
		// UseBool with xorm
		assert.Equal(t, updatedPublicDashboard.IsEnabled, pdRetrieved.IsEnabled)

		// not updated dashboard shouldn't have changed
		pdNotUpdatedRetrieved, err := publicdashboardStore.GetPublicDashboard(context.Background(), anotherSavedDashboard.OrgId, anotherSavedDashboard.Uid)
		require.NoError(t, err)
		assert.NotEqual(t, updatedPublicDashboard.UpdatedAt, pdNotUpdatedRetrieved.UpdatedAt)
		assert.NotEqual(t, updatedPublicDashboard.IsEnabled, pdNotUpdatedRetrieved.IsEnabled)
	})
}

// GetPublicDashboardOrgId
func TestIntegrationGetPublicDashboardOrgId(t *testing.T) {
	var sqlStore db.DB
	var cfg *setting.Cfg
	var dashboardStore *dashboardsDB.DashboardStore
	var publicdashboardStore *PublicDashboardStoreImpl
	var savedDashboard *models.Dashboard

	setup := func() {
		sqlStore, cfg = db.InitTestDBwithCfg(t)
		dashboardStore = dashboardsDB.ProvideDashboardStore(sqlStore, cfg, featuremgmt.WithFeatures(), tagimpl.ProvideService(sqlStore, cfg))
		publicdashboardStore = ProvideStore(sqlStore)
		savedDashboard = insertTestDashboard(t, dashboardStore, "testDashie", 1, 0, true)
	}
	t.Run("GetPublicDashboardOrgId will OrgId when enabled", func(t *testing.T) {
		setup()

		err := publicdashboardStore.SavePublicDashboard(context.Background(), SavePublicDashboardConfigCommand{
			PublicDashboard: PublicDashboard{
				IsEnabled:    true,
				Uid:          "abc123",
				DashboardUid: savedDashboard.Uid,
				OrgId:        savedDashboard.OrgId,
				CreatedAt:    time.Now(),
				CreatedBy:    7,
				AccessToken:  "accessToken",
			},
		})
		require.NoError(t, err)

		orgId, err := publicdashboardStore.GetPublicDashboardOrgId(context.Background(), "accessToken")
		require.NoError(t, err)

		assert.Equal(t, savedDashboard.OrgId, orgId)
	})

	t.Run("GetPublicDashboardOrgId will return 0 when IsEnabled=false", func(t *testing.T) {
		setup()

		err := publicdashboardStore.SavePublicDashboard(context.Background(), SavePublicDashboardConfigCommand{
			PublicDashboard: PublicDashboard{
				IsEnabled:    false,
				Uid:          "abc123",
				DashboardUid: savedDashboard.Uid,
				OrgId:        savedDashboard.OrgId,
				CreatedAt:    time.Now(),
				CreatedBy:    7,
				AccessToken:  "accessToken",
			},
		})
		require.NoError(t, err)
		orgId, err := publicdashboardStore.GetPublicDashboardOrgId(context.Background(), "accessToken")
		require.NoError(t, err)
		assert.NotEqual(t, savedDashboard.OrgId, orgId)
	})

	t.Run("GetPublicDashboardOrgId will return 0 when no public dashboard has matching access token", func(t *testing.T) {
		setup()

		orgId, err := publicdashboardStore.GetPublicDashboardOrgId(context.Background(), "nonExistentAccessToken")
		require.NoError(t, err)
		assert.NotEqual(t, savedDashboard.OrgId, orgId)
	})
}

// helper function to insert a dashboard
func insertTestDashboard(t *testing.T, dashboardStore *dashboardsDB.DashboardStore, title string, orgId int64,
	folderId int64, isFolder bool, tags ...interface{}) *models.Dashboard {
	t.Helper()
	cmd := models.SaveDashboardCommand{
		OrgId:    orgId,
		FolderId: folderId,
		IsFolder: isFolder,
		Dashboard: simplejson.NewFromAny(map[string]interface{}{
			"id":    nil,
			"title": title,
			"tags":  tags,
		}),
	}
	dash, err := dashboardStore.SaveDashboard(context.Background(), cmd)
	require.NoError(t, err)
	require.NotNil(t, dash)
	dash.Data.Set("id", dash.Id)
	dash.Data.Set("uid", dash.Uid)
	return dash
}

// helper function to insert a public dashboard
func insertPublicDashboard(t *testing.T, publicdashboardStore *PublicDashboardStoreImpl, dashboardUid string, orgId int64, isEnabled bool) *PublicDashboard {
	ctx := context.Background()

	uid, err := publicdashboardStore.GenerateNewPublicDashboardUid(ctx)
	require.NoError(t, err)

	accessToken, err := tokens.GenerateAccessToken()
	require.NoError(t, err)

	cmd := SavePublicDashboardConfigCommand{
		PublicDashboard: PublicDashboard{
			Uid:          uid,
			DashboardUid: dashboardUid,
			OrgId:        orgId,
			IsEnabled:    isEnabled,
			TimeSettings: &TimeSettings{},
			CreatedBy:    1,
			CreatedAt:    time.Now(),
			AccessToken:  accessToken,
		},
	}

	err = publicdashboardStore.SavePublicDashboard(ctx, cmd)
	require.NoError(t, err)

	pubdash, err := publicdashboardStore.GetPublicDashboardByUid(ctx, uid)
	require.NoError(t, err)

	return pubdash
}
