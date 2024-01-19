package anonimpl

import (
	"context"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/infra/db"
	"github.com/grafana/grafana/pkg/infra/usagestats"
	"github.com/grafana/grafana/pkg/services/accesscontrol/actest"
	"github.com/grafana/grafana/pkg/services/anonymous"
	"github.com/grafana/grafana/pkg/services/anonymous/anonimpl/anonstore"
	"github.com/grafana/grafana/pkg/services/authn/authntest"
	"github.com/grafana/grafana/pkg/services/org/orgtest"
	"github.com/grafana/grafana/pkg/setting"
)

func TestIntegrationDeviceService_tag(t *testing.T) {
	type tagReq struct {
		httpReq *http.Request
		kind    anonymous.DeviceKind
	}
	testCases := []struct {
		name                string
		req                 []tagReq
		expectedAnonUICount int64
		expectedKey         string
		expectedDevice      *anonstore.Device
	}{
		{
			name: "no requests",
			req:  []tagReq{{httpReq: &http.Request{}, kind: anonymous.AnonDeviceUI}},
		},
		{
			name: "missing info should not tag",
			req: []tagReq{{httpReq: &http.Request{
				Header: http.Header{
					"User-Agent": []string{"test"},
				},
			},
				kind: anonymous.AnonDeviceUI,
			}},
		},
		{
			name: "should tag device ID once",
			req: []tagReq{{httpReq: &http.Request{
				Header: http.Header{
					"User-Agent":                            []string{"test"},
					"X-Forwarded-For":                       []string{"10.30.30.1"},
					http.CanonicalHeaderKey(deviceIDHeader): []string{"32mdo31deeqwes"},
				},
			},
				kind: anonymous.AnonDeviceUI,
			},
			},
			expectedAnonUICount: 1,
			expectedKey:         "ui-anon-session:32mdo31deeqwes",
			expectedDevice: &anonstore.Device{
				DeviceID:  "32mdo31deeqwes",
				ClientIP:  "10.30.30.1",
				UserAgent: "test"},
		},
		{
			name: "repeat request should not tag",
			req: []tagReq{{httpReq: &http.Request{
				Header: http.Header{
					"User-Agent":                            []string{"test"},
					http.CanonicalHeaderKey(deviceIDHeader): []string{"32mdo31deeqwes"},
					"X-Forwarded-For":                       []string{"10.30.30.1"},
				},
			},
				kind: anonymous.AnonDeviceUI,
			}, {httpReq: &http.Request{
				Header: http.Header{
					"User-Agent":                            []string{"test"},
					http.CanonicalHeaderKey(deviceIDHeader): []string{"32mdo31deeqwes"},
					"X-Forwarded-For":                       []string{"10.30.30.1"},
				},
			},
				kind: anonymous.AnonDeviceUI,
			},
			},
			expectedAnonUICount: 1,
		}, {
			name: "tag 2 different requests",
			req: []tagReq{{httpReq: &http.Request{
				Header: http.Header{
					http.CanonicalHeaderKey("User-Agent"):      []string{"test"},
					http.CanonicalHeaderKey("X-Forwarded-For"): []string{"10.30.30.1"},
					http.CanonicalHeaderKey(deviceIDHeader):    []string{"a"},
				},
			},
				kind: anonymous.AnonDeviceUI,
			}, {httpReq: &http.Request{
				Header: http.Header{
					"User-Agent":                            []string{"test"},
					"X-Forwarded-For":                       []string{"10.30.30.2"},
					http.CanonicalHeaderKey(deviceIDHeader): []string{"b"},
				},
			},
				kind: anonymous.AnonDeviceUI,
			},
			},
			expectedAnonUICount: 2,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			store := db.InitTestDB(t)
			anonService := ProvideAnonymousDeviceService(&usagestats.UsageStatsMock{},
				&authntest.FakeService{}, store, setting.NewCfg(), orgtest.NewOrgServiceFake(), nil, actest.FakeAccessControl{}, &routing.RouteRegisterImpl{})

			for _, req := range tc.req {
				err := anonService.TagDevice(context.Background(), req.httpReq, req.kind)
				require.NoError(t, err)
			}

			devices, err := anonService.anonStore.ListDevices(context.Background(), nil, nil)
			require.NoError(t, err)
			require.Len(t, devices, int(tc.expectedAnonUICount))
			if tc.expectedDevice != nil {
				device := devices[0]
				assert.NotZero(t, device.ID)
				assert.NotZero(t, device.CreatedAt)
				assert.NotZero(t, device.UpdatedAt)

				tc.expectedDevice.ID = device.ID
				tc.expectedDevice.CreatedAt = device.CreatedAt
				tc.expectedDevice.UpdatedAt = device.UpdatedAt

				assert.Equal(t, tc.expectedDevice, devices[0])
			}

			stats, err := anonService.usageStatFn(context.Background())
			require.NoError(t, err)

			assert.Equal(t, tc.expectedAnonUICount, stats["stats.anonymous.device.ui.count"].(int64), stats)
		})
	}
}

// Ensure that the local cache prevents request from being tagged
func TestIntegrationAnonDeviceService_localCacheSafety(t *testing.T) {
	store := db.InitTestDB(t)
	anonService := ProvideAnonymousDeviceService(&usagestats.UsageStatsMock{},
		&authntest.FakeService{}, store, setting.NewCfg(), orgtest.NewOrgServiceFake(), nil, actest.FakeAccessControl{}, &routing.RouteRegisterImpl{})

	req := &http.Request{
		Header: http.Header{
			"User-Agent":                            []string{"test"},
			"X-Forwarded-For":                       []string{"10.30.30.2"},
			http.CanonicalHeaderKey(deviceIDHeader): []string{"32mdo31deeqwes"},
		},
	}

	anonDevice := &anonstore.Device{
		DeviceID:  "32mdo31deeqwes",
		ClientIP:  "10.30.30.2",
		UserAgent: "test",
		UpdatedAt: time.Now().UTC(),
	}

	key := anonDevice.CacheKey()
	anonService.localCache.SetDefault(key, true)

	err := anonService.TagDevice(context.Background(), req, anonymous.AnonDeviceUI)
	require.NoError(t, err)

	stats, err := anonService.usageStatFn(context.Background())
	require.NoError(t, err)

	assert.Equal(t, int64(0), stats["stats.anonymous.device.ui.count"].(int64))
}

func TestIntegrationDeviceService_SearchDevice(t *testing.T) {
	testCases := []struct {
		name           string
		insertDevices  []*anonstore.Device
		searchQuery    anonstore.SearchDeviceQuery
		expectedCount  int
		expectedDevice *anonstore.Device
	}{
		{
			name: "two devices and limit set to 1",
			insertDevices: []*anonstore.Device{
				{
					DeviceID:  "32mdo31deeqwes",
					ClientIP:  "",
					UserAgent: "test",
					CreatedAt: time.Now().Add(-10 * time.Hour).UTC(),
					UpdatedAt: time.Now().Add(-9 * time.Hour).UTC(),
				},
				{
					DeviceID:  "32mdo31deeqwes2",
					ClientIP:  "",
					UserAgent: "test2",
					CreatedAt: time.Now().Add(-10 * time.Hour).UTC(),
					UpdatedAt: time.Now().Add(-9 * time.Hour).UTC(),
				},
			},
			searchQuery: anonstore.SearchDeviceQuery{
				Query: "",
				Page:  1,
				Limit: 1,
			},
			expectedCount: 1,
		},
		{
			name: "two devices and search for client ip 192.1",
			insertDevices: []*anonstore.Device{
				{
					DeviceID:  "32mdo31deeqwes",
					ClientIP:  "192.168.0.2:10",
					UserAgent: "",
					CreatedAt: time.Now().Add(-10 * time.Hour).UTC(),
					UpdatedAt: time.Now().Add(-9 * time.Hour).UTC(),
				},
				{
					DeviceID:  "32mdo31deeqwes2",
					ClientIP:  "192.268.1.3:200",
					UserAgent: "",
					CreatedAt: time.Now().Add(-10 * time.Hour).UTC(),
					UpdatedAt: time.Now().Add(-9 * time.Hour).UTC(),
				},
			},
			searchQuery: anonstore.SearchDeviceQuery{
				Query: "192.1",
				Page:  1,
				Limit: 50,
			},
			expectedCount: 1,
			expectedDevice: &anonstore.Device{
				DeviceID:  "32mdo31deeqwes",
				ClientIP:  "192.168.0.2:10",
				UserAgent: "",
				CreatedAt: time.Now().Add(-10 * time.Hour).UTC(),
				UpdatedAt: time.Now().Add(-9 * time.Hour).UTC(),
			},
		},
	}
	store := db.InitTestDB(t)
	cfg := setting.NewCfg()
	cfg.AnonymousEnabled = true
	anonService := ProvideAnonymousDeviceService(&usagestats.UsageStatsMock{}, &authntest.FakeService{}, store, cfg, orgtest.NewOrgServiceFake(), nil, actest.FakeAccessControl{}, &routing.RouteRegisterImpl{})

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			for _, device := range tc.insertDevices {
				err := anonService.anonStore.CreateOrUpdateDevice(context.Background(), device)
				require.NoError(t, err)
			}

			devices, err := anonService.anonStore.SearchDevices(context.Background(), &tc.searchQuery)
			require.NoError(t, err)
			require.Len(t, devices.Devices, tc.expectedCount)
			if tc.expectedDevice != nil {
				device := devices.Devices[0]
				require.Equal(t, tc.expectedDevice.UserAgent, device.UserAgent)
			}
		})
	}
}
