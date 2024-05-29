package notifier

import (
	"context"
	"testing"
	"time"

	"github.com/google/go-cmp/cmp"
	"github.com/google/go-cmp/cmp/cmpopts"
	"github.com/prometheus/alertmanager/config"
	"github.com/prometheus/alertmanager/pkg/labels"
	"github.com/prometheus/common/model"
	"github.com/stretchr/testify/require"

	"github.com/grafana/grafana/pkg/infra/log/logtest"
	"github.com/grafana/grafana/pkg/services/ngalert/api/tooling/definitions"
	"github.com/grafana/grafana/pkg/services/ngalert/models"
	"github.com/grafana/grafana/pkg/util"
)

func TestAddAutogenConfig(t *testing.T) {
	rootRoute := func() *definitions.Route {
		return &definitions.Route{
			Receiver: "default",
		}
	}
	configGen := func(receivers []string, muteIntervals []string) *definitions.PostableApiAlertingConfig {
		cfg := &definitions.PostableApiAlertingConfig{
			Config: definitions.Config{
				Route: rootRoute(),
			},
		}
		for _, receiver := range receivers {
			cfg.Receivers = append(cfg.Receivers, &definitions.PostableApiReceiver{
				Receiver: config.Receiver{
					Name: receiver,
				},
			})
		}
		for _, muteInterval := range muteIntervals {
			cfg.MuteTimeIntervals = append(cfg.MuteTimeIntervals, config.MuteTimeInterval{
				Name: muteInterval,
			})
		}
		return cfg
	}

	withChildRoutes := func(route *definitions.Route, children ...*definitions.Route) *definitions.Route {
		route.Routes = append(route.Routes, children...)
		return route
	}

	matcher := func(key, val string) definitions.ObjectMatchers {
		m, err := labels.NewMatcher(labels.MatchEqual, key, val)
		require.NoError(t, err)
		return definitions.ObjectMatchers{m}
	}

	basicContactRoute := func(receiver string) *definitions.Route {
		return &definitions.Route{
			Receiver:       receiver,
			ObjectMatchers: matcher(models.AutogeneratedRouteReceiverNameLabel, receiver),
			GroupByStr:     []string{models.FolderTitleLabel, model.AlertNameLabel},
		}
	}

	testCases := []struct {
		name             string
		existingConfig   *definitions.PostableApiAlertingConfig
		storeSettings    []models.NotificationSettings
		skipInvalid      bool
		expRoute         *definitions.Route
		expErrorContains string
	}{
		{
			name:           "no settings or receivers, no change",
			existingConfig: configGen(nil, nil),
			storeSettings:  []models.NotificationSettings{},
			expRoute:       rootRoute(),
		},
		{
			name:           "no settings but some receivers, add default routes for receivers",
			existingConfig: configGen([]string{"receiver1", "receiver2", "receiver3"}, nil),
			storeSettings:  []models.NotificationSettings{},
			expRoute: withChildRoutes(rootRoute(), &definitions.Route{
				Receiver:       "default",
				ObjectMatchers: matcher(models.AutogeneratedRouteLabel, "true"),
				Routes: []*definitions.Route{
					basicContactRoute("receiver1"),
					basicContactRoute("receiver3"),
					basicContactRoute("receiver2"),
				},
			}),
		},
		{
			name:           "settings with no custom options, add default routes only",
			existingConfig: configGen([]string{"receiver1", "receiver2", "receiver3"}, nil),
			storeSettings:  []models.NotificationSettings{models.NewDefaultNotificationSettings("receiver1"), models.NewDefaultNotificationSettings("receiver2")},
			expRoute: withChildRoutes(rootRoute(), &definitions.Route{
				Receiver:       "default",
				ObjectMatchers: matcher(models.AutogeneratedRouteLabel, "true"),
				Routes: []*definitions.Route{
					basicContactRoute("receiver1"),
					basicContactRoute("receiver3"),
					basicContactRoute("receiver2"),
				},
			}),
		},
		{
			name:           "settings with custom options, add option-specific routes",
			existingConfig: configGen([]string{"receiver1", "receiver2", "receiver3", "receiver4", "receiver5"}, []string{"maintenance"}),
			storeSettings: []models.NotificationSettings{
				models.CopyNotificationSettings(models.NewDefaultNotificationSettings("receiver1"), models.NSMuts.WithGroupInterval(util.Pointer(1*time.Minute))),
				models.CopyNotificationSettings(models.NewDefaultNotificationSettings("receiver2"), models.NSMuts.WithGroupWait(util.Pointer(2*time.Minute))),
				models.CopyNotificationSettings(models.NewDefaultNotificationSettings("receiver3"), models.NSMuts.WithRepeatInterval(util.Pointer(3*time.Minute))),
				models.CopyNotificationSettings(models.NewDefaultNotificationSettings("receiver4"), models.NSMuts.WithGroupBy(model.AlertNameLabel, models.FolderTitleLabel, "custom")),
				models.CopyNotificationSettings(models.NewDefaultNotificationSettings("receiver5"), models.NSMuts.WithMuteTimeIntervals("maintenance")),
				{
					Receiver:          "receiver1",
					GroupBy:           []string{model.AlertNameLabel, models.FolderTitleLabel, "custom"},
					GroupInterval:     util.Pointer(model.Duration(1 * time.Minute)),
					GroupWait:         util.Pointer(model.Duration(2 * time.Minute)),
					RepeatInterval:    util.Pointer(model.Duration(3 * time.Minute)),
					MuteTimeIntervals: []string{"maintenance"},
				},
			},
			expRoute: withChildRoutes(rootRoute(), &definitions.Route{
				Receiver:       "default",
				ObjectMatchers: matcher(models.AutogeneratedRouteLabel, "true"),
				Routes: []*definitions.Route{
					withChildRoutes(basicContactRoute("receiver5"), &definitions.Route{
						Receiver:          "receiver5",
						ObjectMatchers:    matcher(models.AutogeneratedRouteSettingsHashLabel, "030d6474aec0b553"),
						MuteTimeIntervals: []string{"maintenance"},
					}),
					withChildRoutes(basicContactRoute("receiver1"), &definitions.Route{
						Receiver:          "receiver1",
						ObjectMatchers:    matcher(models.AutogeneratedRouteSettingsHashLabel, "4f095749ddf3eeeb"),
						GroupByStr:        []string{models.FolderTitleLabel, model.AlertNameLabel, "custom"},
						GroupInterval:     util.Pointer(model.Duration(1 * time.Minute)),
						GroupWait:         util.Pointer(model.Duration(2 * time.Minute)),
						RepeatInterval:    util.Pointer(model.Duration(3 * time.Minute)),
						MuteTimeIntervals: []string{"maintenance"},
					}, &definitions.Route{
						Receiver:       "receiver1",
						ObjectMatchers: matcher(models.AutogeneratedRouteSettingsHashLabel, "dde34b8127e68f31"),
						GroupInterval:  util.Pointer(model.Duration(1 * time.Minute)),
					}),
					withChildRoutes(basicContactRoute("receiver2"), &definitions.Route{
						Receiver:       "receiver2",
						ObjectMatchers: matcher(models.AutogeneratedRouteSettingsHashLabel, "27e1d1717c9ef621"),
						GroupWait:      util.Pointer(model.Duration(2 * time.Minute)),
					}),
					withChildRoutes(basicContactRoute("receiver4"), &definitions.Route{
						Receiver:       "receiver4",
						ObjectMatchers: matcher(models.AutogeneratedRouteSettingsHashLabel, "b3a2fa5e615dcc7e"),
						GroupByStr:     []string{models.FolderTitleLabel, model.AlertNameLabel, "custom"},
					}),
					withChildRoutes(basicContactRoute("receiver3"), &definitions.Route{
						Receiver:       "receiver3",
						ObjectMatchers: matcher(models.AutogeneratedRouteSettingsHashLabel, "9e282ef0193d830a"),
						RepeatInterval: util.Pointer(model.Duration(3 * time.Minute)),
					}),
				},
			}),
		},
		{
			name:           "settings with custom options and nil groupBy, groupBy should inherit from parent",
			existingConfig: configGen([]string{"receiver1"}, nil),
			storeSettings: []models.NotificationSettings{
				models.CopyNotificationSettings(models.NewDefaultNotificationSettings("receiver1"), models.NSMuts.WithGroupInterval(util.Pointer(1*time.Minute)), models.NSMuts.WithGroupBy()),
			},
			expRoute: withChildRoutes(rootRoute(), &definitions.Route{
				Receiver:       "default",
				ObjectMatchers: matcher(models.AutogeneratedRouteLabel, "true"),
				Routes: []*definitions.Route{
					withChildRoutes(basicContactRoute("receiver1"), &definitions.Route{
						Receiver:       "receiver1",
						ObjectMatchers: matcher(models.AutogeneratedRouteSettingsHashLabel, "dde34b8127e68f31"),
						GroupByStr:     nil,
						GroupInterval:  util.Pointer(model.Duration(1 * time.Minute)),
					}),
				},
			}),
		},
		{
			name:           "settings with nil groupBy should have different fingerprint than default groupBy",
			existingConfig: configGen([]string{"receiver1"}, nil),
			storeSettings: []models.NotificationSettings{
				models.CopyNotificationSettings(models.NewDefaultNotificationSettings("receiver1"), models.NSMuts.WithGroupInterval(util.Pointer(1*time.Minute)), models.NSMuts.WithGroupBy()),
				models.CopyNotificationSettings(models.NewDefaultNotificationSettings("receiver1"), models.NSMuts.WithGroupInterval(util.Pointer(1*time.Minute)), models.NSMuts.WithGroupBy(models.DefaultNotificationSettingsGroupBy...)),
			},
			expRoute: withChildRoutes(rootRoute(), &definitions.Route{
				Receiver:       "default",
				ObjectMatchers: matcher(models.AutogeneratedRouteLabel, "true"),
				Routes: []*definitions.Route{
					withChildRoutes(basicContactRoute("receiver1"), &definitions.Route{
						Receiver:       "receiver1",
						ObjectMatchers: matcher(models.AutogeneratedRouteSettingsHashLabel, "dde34b8127e68f31"),
						GroupByStr:     nil,
						GroupInterval:  util.Pointer(model.Duration(1 * time.Minute)),
					}, &definitions.Route{
						Receiver:       "receiver1",
						ObjectMatchers: matcher(models.AutogeneratedRouteSettingsHashLabel, "e1f3a275a8918385"), // Different hash.
						GroupByStr:     []string{models.FolderTitleLabel, model.AlertNameLabel},
						GroupInterval:  util.Pointer(model.Duration(1 * time.Minute)),
					}),
				},
			}),
		},
		{
			name:           "settings with incomplete required groupBy labels will be completed and should have the same fingerprint",
			existingConfig: configGen([]string{"receiver1"}, nil),
			storeSettings: []models.NotificationSettings{
				models.CopyNotificationSettings(models.NewDefaultNotificationSettings("receiver1"), models.NSMuts.WithGroupInterval(util.Pointer(1*time.Minute)), models.NSMuts.WithGroupBy(models.FolderTitleLabel)),
				models.CopyNotificationSettings(models.NewDefaultNotificationSettings("receiver1"), models.NSMuts.WithGroupInterval(util.Pointer(1*time.Minute)), models.NSMuts.WithGroupBy(model.AlertNameLabel)),
				models.CopyNotificationSettings(models.NewDefaultNotificationSettings("receiver1"), models.NSMuts.WithGroupInterval(util.Pointer(1*time.Minute)), models.NSMuts.WithGroupBy(models.DefaultNotificationSettingsGroupBy...)),
			},
			expRoute: withChildRoutes(rootRoute(), &definitions.Route{
				Receiver:       "default",
				ObjectMatchers: matcher(models.AutogeneratedRouteLabel, "true"),
				Routes: []*definitions.Route{
					withChildRoutes(basicContactRoute("receiver1"), &definitions.Route{
						Receiver:       "receiver1",
						ObjectMatchers: matcher(models.AutogeneratedRouteSettingsHashLabel, "e1f3a275a8918385"),
						GroupByStr:     []string{models.FolderTitleLabel, model.AlertNameLabel},
						GroupInterval:  util.Pointer(model.Duration(1 * time.Minute)),
					}),
				},
			}),
		},
		{
			name:           "when skipInvalid=true, invalid settings are skipped",
			existingConfig: configGen([]string{"receiver1", "receiver2", "receiver3"}, nil),
			storeSettings: []models.NotificationSettings{
				models.NewDefaultNotificationSettings("receiverA"), // Doesn't exist.
				models.CopyNotificationSettings(models.NewDefaultNotificationSettings("receiver1"), models.NSMuts.WithMuteTimeIntervals("maintenance")),        // Doesn't exist.
				models.CopyNotificationSettings(models.NewDefaultNotificationSettings("receiver2"), models.NSMuts.WithGroupWait(util.Pointer(-2*time.Minute))), // Negative.
			},
			skipInvalid: true,
			expRoute: withChildRoutes(rootRoute(), &definitions.Route{
				Receiver:       "default",
				ObjectMatchers: matcher(models.AutogeneratedRouteLabel, "true"),
				Routes: []*definitions.Route{
					basicContactRoute("receiver1"),
					basicContactRoute("receiver3"),
					basicContactRoute("receiver2"),
				},
			}),
		},
		{
			name:             "when skipInvalid=false, invalid receiver throws error",
			existingConfig:   configGen([]string{"receiver1", "receiver2", "receiver3"}, nil),
			storeSettings:    []models.NotificationSettings{models.NewDefaultNotificationSettings("receiverA")},
			skipInvalid:      false,
			expErrorContains: "receiverA",
		},
		{
			name:             "when skipInvalid=false, invalid settings throws error",
			existingConfig:   configGen([]string{"receiver1", "receiver2", "receiver3"}, nil),
			storeSettings:    []models.NotificationSettings{models.CopyNotificationSettings(models.NewDefaultNotificationSettings("receiver1"), models.NSMuts.WithMuteTimeIntervals("maintenance"))},
			skipInvalid:      false,
			expErrorContains: "maintenance",
		},
		{
			name:             "when skipInvalid=false, invalid settings throws error",
			existingConfig:   configGen([]string{"receiver1", "receiver2", "receiver3"}, nil),
			storeSettings:    []models.NotificationSettings{models.CopyNotificationSettings(models.NewDefaultNotificationSettings("receiver2"), models.NSMuts.WithGroupWait(util.Pointer(-2*time.Minute)))},
			skipInvalid:      false,
			expErrorContains: "group wait",
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			orgId := int64(1)
			store := &fakeConfigStore{
				notificationSettings: make(map[int64]map[models.AlertRuleKey][]models.NotificationSettings),
			}
			store.notificationSettings[orgId] = make(map[models.AlertRuleKey][]models.NotificationSettings)

			for _, setting := range tt.storeSettings {
				store.notificationSettings[orgId][models.AlertRuleKey{OrgID: orgId, UID: util.GenerateShortUID()}] = []models.NotificationSettings{setting}
			}

			err := AddAutogenConfig(context.Background(), &logtest.Fake{}, store, orgId, tt.existingConfig, tt.skipInvalid)
			if tt.expErrorContains != "" {
				require.Error(t, err)
				require.ErrorContains(t, err, tt.expErrorContains)
				return
			} else {
				require.NoError(t, err)
			}

			// We compare against the upstream normalized route.
			require.NoError(t, tt.expRoute.Validate())

			cOpt := []cmp.Option{
				cmpopts.IgnoreUnexported(definitions.Route{}, labels.Matcher{}),
			}
			if !cmp.Equal(tt.expRoute, tt.existingConfig.Route, cOpt...) {
				t.Errorf("Unexpected Route: %v", cmp.Diff(tt.expRoute, tt.existingConfig.Route, cOpt...))
			}
		})
	}
}
