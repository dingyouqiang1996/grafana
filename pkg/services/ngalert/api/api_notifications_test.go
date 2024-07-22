package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strconv"
	"strings"
	"testing"

	"github.com/grafana/grafana/pkg/apimachinery/identity"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/infra/log/logtest"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/ngalert/api/tooling/definitions"
	"github.com/grafana/grafana/pkg/services/ngalert/models"
	"github.com/grafana/grafana/pkg/services/ngalert/notifier"
	"github.com/grafana/grafana/pkg/services/ngalert/tests/fakes"
	"github.com/grafana/grafana/pkg/services/user"
	"github.com/grafana/grafana/pkg/web"

	am_config "github.com/prometheus/alertmanager/config"
	"github.com/stretchr/testify/require"
)

func TestRouteGetReceiver(t *testing.T) {
	fakeReceiverSvc := fakes.NewFakeReceiverService()

	t.Run("returns expected model", func(t *testing.T) {
		expected := definitions.GettableApiReceiver{
			Receiver: am_config.Receiver{
				Name: "receiver1",
			},
			GettableGrafanaReceivers: definitions.GettableGrafanaReceivers{
				GrafanaManagedReceivers: []*definitions.GettableGrafanaReceiver{
					{
						UID:  "uid1",
						Name: "receiver1",
						Type: "slack",
					},
				},
			},
		}
		fakeReceiverSvc.GetReceiverFn = func(ctx context.Context, q models.GetReceiverQuery, u identity.Requester) (definitions.GettableApiReceiver, error) {
			return expected, nil
		}
		handler := NewNotificationsApi(newNotificationSrv(fakeReceiverSvc))
		rc := testReqCtx("GET")
		resp := handler.handleRouteGetReceiver(&rc, "receiver1")
		require.Equal(t, http.StatusOK, resp.Status())
		json, err := json.Marshal(expected)
		require.NoError(t, err)
		require.Equal(t, json, resp.Body())
	})

	t.Run("builds query from request context and url param", func(t *testing.T) {
		fakeReceiverSvc.GetReceiverFn = func(ctx context.Context, q models.GetReceiverQuery, u identity.Requester) (definitions.GettableApiReceiver, error) {
			return definitions.GettableApiReceiver{}, nil
		}
		handler := NewNotificationsApi(newNotificationSrv(fakeReceiverSvc))
		rc := testReqCtx("GET")
		rc.Context.Req.Form.Set("decrypt", "true")
		resp := handler.handleRouteGetReceiver(&rc, "receiver1")
		require.Equal(t, http.StatusOK, resp.Status())

		call := fakeReceiverSvc.PopMethodCall()
		require.Equal(t, "GetReceiver", call.Method)
		expectedQ := models.GetReceiverQuery{
			Name:    "receiver1",
			Decrypt: true,
			OrgID:   1,
		}
		require.Equal(t, expectedQ, call.Args[1])
	})

	t.Run("should pass along not found response", func(t *testing.T) {
		fakeReceiverSvc.GetReceiverFn = func(ctx context.Context, q models.GetReceiverQuery, u identity.Requester) (definitions.GettableApiReceiver, error) {
			return definitions.GettableApiReceiver{}, notifier.ErrNotFound
		}
		handler := NewNotificationsApi(newNotificationSrv(fakeReceiverSvc))
		rc := testReqCtx("GET")
		resp := handler.handleRouteGetReceiver(&rc, "receiver1")
		require.Equal(t, http.StatusNotFound, resp.Status())
	})

	t.Run("should pass along permission denied response", func(t *testing.T) {
		fakeReceiverSvc.GetReceiverFn = func(ctx context.Context, q models.GetReceiverQuery, u identity.Requester) (definitions.GettableApiReceiver, error) {
			return definitions.GettableApiReceiver{}, notifier.ErrPermissionDenied
		}
		handler := NewNotificationsApi(newNotificationSrv(fakeReceiverSvc))
		rc := testReqCtx("GET")
		resp := handler.handleRouteGetReceiver(&rc, "receiver1")
		require.Equal(t, http.StatusForbidden, resp.Status())
	})
}

func TestRouteGetReceivers(t *testing.T) {
	fakeReceiverSvc := fakes.NewFakeReceiverService()

	t.Run("returns expected model", func(t *testing.T) {
		expected := []definitions.GettableApiReceiver{
			{
				Receiver: am_config.Receiver{
					Name: "receiver1",
				},
				GettableGrafanaReceivers: definitions.GettableGrafanaReceivers{
					GrafanaManagedReceivers: []*definitions.GettableGrafanaReceiver{
						{
							UID:  "uid1",
							Name: "receiver1",
							Type: "slack",
						},
					},
				},
			},
		}
		fakeReceiverSvc.GetReceiversFn = func(ctx context.Context, q models.GetReceiversQuery, u identity.Requester) ([]definitions.GettableApiReceiver, error) {
			return expected, nil
		}
		handler := NewNotificationsApi(newNotificationSrv(fakeReceiverSvc))
		rc := testReqCtx("GET")
		rc.Context.Req.Form.Set("names", "receiver1")
		resp := handler.handleRouteGetReceivers(&rc)
		require.Equal(t, http.StatusOK, resp.Status())
		json, err := json.Marshal(expected)
		require.NoError(t, err)
		require.Equal(t, json, resp.Body())
	})

	t.Run("builds query from request context", func(t *testing.T) {
		fakeReceiverSvc.GetReceiversFn = func(ctx context.Context, q models.GetReceiversQuery, u identity.Requester) ([]definitions.GettableApiReceiver, error) {
			return []definitions.GettableApiReceiver{}, nil
		}
		handler := NewNotificationsApi(newNotificationSrv(fakeReceiverSvc))
		rc := testReqCtx("GET")
		rc.Context.Req.Form.Set("names", "receiver1")
		rc.Context.Req.Form.Add("names", "receiver2")
		rc.Context.Req.Form.Set("limit", "1")
		rc.Context.Req.Form.Set("offset", "2")
		rc.Context.Req.Form.Set("decrypt", "true")
		resp := handler.handleRouteGetReceivers(&rc)
		require.Equal(t, http.StatusOK, resp.Status())

		call := fakeReceiverSvc.PopMethodCall()
		require.Equal(t, "GetReceivers", call.Method)
		expectedQ := models.GetReceiversQuery{
			Names:   []string{"receiver1", "receiver2"},
			Limit:   1,
			Offset:  2,
			Decrypt: true,
			OrgID:   1,
		}
		require.Equal(t, expectedQ, call.Args[1])
	})

	t.Run("should pass along permission denied response", func(t *testing.T) {
		fakeReceiverSvc.GetReceiversFn = func(ctx context.Context, q models.GetReceiversQuery, u identity.Requester) ([]definitions.GettableApiReceiver, error) {
			return nil, notifier.ErrPermissionDenied
		}
		handler := NewNotificationsApi(newNotificationSrv(fakeReceiverSvc))
		rc := testReqCtx("GET")
		resp := handler.handleRouteGetReceivers(&rc)
		require.Equal(t, http.StatusForbidden, resp.Status())
	})
}

func TestRouteGetReceiversResponses(t *testing.T) {
	createTestEnv := func(t *testing.T, testConfig string) testEnvironment {
		env := createTestEnv(t, testConfig)
		env.ac = &recordingAccessControlFake{
			Callback: func(user *user.SignedInUser, evaluator accesscontrol.Evaluator) (bool, error) {
				if strings.Contains(evaluator.String(), accesscontrol.ActionAlertingNotificationsRead) {
					return true, nil
				}
				if strings.Contains(evaluator.String(), accesscontrol.ActionAlertingReceiversList) {
					return true, nil
				}
				return false, nil
			},
		}
		return env
	}

	t.Run("list receivers", func(t *testing.T) {
		t.Run("GET returns 200", func(t *testing.T) {
			env := createTestEnv(t, testConfig)
			sut := createNotificationSrvSutFromEnv(t, &env)
			rc := createTestRequestCtx()

			response := sut.RouteGetReceivers(&rc)

			require.Equal(t, 200, response.Status())
		})
		t.Run("decrypt true without alert.provisioning.secrets:read permissions returns 403", func(t *testing.T) {
			recPermCheck := false
			env := createTestEnv(t, testConfig)
			env.ac = &recordingAccessControlFake{
				Callback: func(user *user.SignedInUser, evaluator accesscontrol.Evaluator) (bool, error) {
					if strings.Contains(evaluator.String(), accesscontrol.ActionAlertingProvisioningReadSecrets) {
						recPermCheck = true
					}
					return false, nil
				},
			}

			sut := createNotificationSrvSutFromEnv(t, &env)
			rc := createTestRequestCtx()

			rc.Context.Req.Form.Set("decrypt", "true")

			response := sut.RouteGetReceivers(&rc)

			require.True(t, recPermCheck)
			require.Equal(t, 403, response.Status())
		})

		t.Run("json body content is as expected", func(t *testing.T) {
			expectedDecryptedResponse := `[{"name":"grafana-default-email","grafana_managed_receiver_configs":[{"uid":"ad95bd8a-49ed-4adc-bf89-1b444fa1aa5b","name":"grafana-default-email","type":"email","disableResolveMessage":false,"settings":{"addresses":"\u003cexample@email.com\u003e"},"secureFields":{}}]},{"name":"multiple integrations","grafana_managed_receiver_configs":[{"uid":"c2090fda-f824-4add-b545-5a4d5c2ef082","name":"multiple integrations","type":"prometheus-alertmanager","disableResolveMessage":true,"settings":{"basicAuthPassword":"testpass","basicAuthUser":"test","url":"http://localhost:9093"},"secureFields":{"basicAuthPassword":true}},{"uid":"c84539ec-f87e-4fc5-9a91-7a687d34bbd1","name":"multiple integrations","type":"discord","disableResolveMessage":false,"settings":{"avatar_url":"some avatar","url":"some url","use_discord_username":true},"secureFields":{}}]},{"name":"pagerduty test","grafana_managed_receiver_configs":[{"uid":"b9bf06f8-bde2-4438-9d4a-bba0522dcd4d","name":"pagerduty test","type":"pagerduty","disableResolveMessage":false,"settings":{"client":"some client","integrationKey":"some key","severity":"criticalish"},"secureFields":{"integrationKey":true}}]},{"name":"slack test","grafana_managed_receiver_configs":[{"uid":"cbfd0976-8228-4126-b672-4419f30a9e50","name":"slack test","type":"slack","disableResolveMessage":true,"settings":{"text":"title body test","title":"title test","url":"some secure slack webhook"},"secureFields":{"url":true}}]}]`
			expectedRedactedResponse := `[{"name":"grafana-default-email","grafana_managed_receiver_configs":[{"uid":"ad95bd8a-49ed-4adc-bf89-1b444fa1aa5b","name":"grafana-default-email","type":"email","disableResolveMessage":false,"settings":{"addresses":"\u003cexample@email.com\u003e"},"secureFields":{}}]},{"name":"multiple integrations","grafana_managed_receiver_configs":[{"uid":"c2090fda-f824-4add-b545-5a4d5c2ef082","name":"multiple integrations","type":"prometheus-alertmanager","disableResolveMessage":true,"settings":{"basicAuthPassword":"[REDACTED]","basicAuthUser":"test","url":"http://localhost:9093"},"secureFields":{"basicAuthPassword":true}},{"uid":"c84539ec-f87e-4fc5-9a91-7a687d34bbd1","name":"multiple integrations","type":"discord","disableResolveMessage":false,"settings":{"avatar_url":"some avatar","url":"some url","use_discord_username":true},"secureFields":{}}]},{"name":"pagerduty test","grafana_managed_receiver_configs":[{"uid":"b9bf06f8-bde2-4438-9d4a-bba0522dcd4d","name":"pagerduty test","type":"pagerduty","disableResolveMessage":false,"settings":{"client":"some client","integrationKey":"[REDACTED]","severity":"criticalish"},"secureFields":{"integrationKey":true}}]},{"name":"slack test","grafana_managed_receiver_configs":[{"uid":"cbfd0976-8228-4126-b672-4419f30a9e50","name":"slack test","type":"slack","disableResolveMessage":true,"settings":{"text":"title body test","title":"title test","url":"[REDACTED]"},"secureFields":{"url":true}}]}]`
			expectedListResponse := `[{"name":"grafana-default-email","grafana_managed_receiver_configs":[{"uid":"ad95bd8a-49ed-4adc-bf89-1b444fa1aa5b","name":"grafana-default-email","type":"email","disableResolveMessage":false,"secureFields":null}]},{"name":"multiple integrations","grafana_managed_receiver_configs":[{"uid":"c2090fda-f824-4add-b545-5a4d5c2ef082","name":"multiple integrations","type":"prometheus-alertmanager","disableResolveMessage":false,"secureFields":null},{"uid":"c84539ec-f87e-4fc5-9a91-7a687d34bbd1","name":"multiple integrations","type":"discord","disableResolveMessage":false,"secureFields":null}]},{"name":"pagerduty test","grafana_managed_receiver_configs":[{"uid":"b9bf06f8-bde2-4438-9d4a-bba0522dcd4d","name":"pagerduty test","type":"pagerduty","disableResolveMessage":false,"secureFields":null}]},{"name":"slack test","grafana_managed_receiver_configs":[{"uid":"cbfd0976-8228-4126-b672-4419f30a9e50","name":"slack test","type":"slack","disableResolveMessage":false,"secureFields":null}]}]`
			t.Run("limit offset", func(t *testing.T) {
				env := createTestEnv(t, testContactPointConfig)
				sut := createNotificationSrvSutFromEnv(t, &env)
				rc := createTestRequestCtx()

				rc.Context.Req.Header.Add("Accept", "application/json")
				rc.Context.Req.Form.Set("decrypt", "false")

				var expected []definitions.GettableApiReceiver
				err := json.Unmarshal([]byte(expectedRedactedResponse), &expected)
				require.NoError(t, err)
				type testcase struct {
					limit    int
					offset   int
					expected []definitions.GettableApiReceiver
				}
				testcases := []testcase{
					{limit: 1, offset: 0, expected: expected[:1]},
					{limit: 2, offset: 0, expected: expected[:2]},
					{limit: 4, offset: 0, expected: expected[:4]},
					{limit: 1, offset: 1, expected: expected[1:2]},
					{limit: 2, offset: 2, expected: expected[2:4]},
					{limit: 2, offset: 99, expected: nil},
					{limit: 0, offset: 0, expected: expected},
					{limit: 0, offset: 1, expected: expected[1:]},
				}
				for _, tc := range testcases {
					t.Run(fmt.Sprintf("limit %d offset %d", tc.limit, tc.offset), func(t *testing.T) {
						rc.Context.Req.Form.Set("limit", strconv.Itoa(tc.limit))
						rc.Context.Req.Form.Set("offset", strconv.Itoa(tc.offset))

						response := sut.RouteGetReceivers(&rc)
						require.Equal(t, 200, response.Status())

						var configs []definitions.GettableApiReceiver
						err := json.Unmarshal(response.Body(), &configs)
						require.NoError(t, err)

						require.Equal(t, configs, tc.expected)
					})
				}

			})
			t.Run("decrypt false with read permissions is redacted", func(t *testing.T) {
				env := createTestEnv(t, testContactPointConfig)
				sut := createNotificationSrvSutFromEnv(t, &env)
				rc := createTestRequestCtx()

				rc.Context.Req.Header.Add("Accept", "application/json")
				rc.Context.Req.Form.Set("decrypt", "false")

				response := sut.RouteGetReceivers(&rc)

				require.Equal(t, 200, response.Status())
				require.Equal(t, expectedRedactedResponse, string(response.Body())) // TODO: Should this endpoint ever return settings?
			})
			t.Run("decrypt false with only list permissions, does not have settings", func(t *testing.T) {
				env := createTestEnv(t, testContactPointConfig)
				env.ac = &recordingAccessControlFake{
					Callback: func(user *user.SignedInUser, evaluator accesscontrol.Evaluator) (bool, error) {
						if strings.Contains(evaluator.String(), accesscontrol.ActionAlertingReceiversList) {
							return true, nil
						}
						return false, nil
					},
				}
				sut := createNotificationSrvSutFromEnv(t, &env)
				rc := createTestRequestCtx()

				rc.Context.Req.Header.Add("Accept", "application/json")
				rc.Context.Req.Form.Set("decrypt", "false")

				response := sut.RouteGetReceivers(&rc)

				require.Equal(t, 200, response.Status())
				require.Equal(t, expectedListResponse, string(response.Body()))
			})
			t.Run("decrypt true with all permissions, contains decrypted settings", func(t *testing.T) {
				env := createTestEnv(t, testContactPointConfig)
				env.ac = &recordingAccessControlFake{
					Callback: func(user *user.SignedInUser, evaluator accesscontrol.Evaluator) (bool, error) {
						return true, nil
					},
				}
				sut := createNotificationSrvSutFromEnv(t, &env)
				rc := createTestRequestCtx()

				rc.Context.Req.Header.Add("Accept", "application/json")
				rc.Context.Req.Form.Set("decrypt", "true")

				response := sut.RouteGetReceivers(&rc)

				require.Equal(t, 200, response.Status())
				require.Equal(t, expectedDecryptedResponse, string(response.Body())) // TODO: Should this endpoint ever return settings?
			})
		})
	})

	t.Run("get receiver", func(t *testing.T) {
		t.Run("GET returns 200", func(t *testing.T) {
			env := createTestEnv(t, testConfig)
			sut := createNotificationSrvSutFromEnv(t, &env)
			rc := createTestRequestCtx()

			response := sut.RouteGetReceiver(&rc, "grafana-default-email")

			require.Equal(t, 200, response.Status())
		})

		t.Run("decrypt true without secrets:read permissions returns 403", func(t *testing.T) {
			recPermCheck := false
			env := createTestEnv(t, testConfig)
			env.ac = &recordingAccessControlFake{
				Callback: func(user *user.SignedInUser, evaluator accesscontrol.Evaluator) (bool, error) {
					if strings.Contains(evaluator.String(), accesscontrol.ActionAlertingReceiversReadSecrets) {
						recPermCheck = true
					}
					return false, nil
				},
			}

			sut := createNotificationSrvSutFromEnv(t, &env)
			rc := createTestRequestCtx()

			rc.Context.Req.Form.Set("decrypt", "true")

			response := sut.RouteGetReceiver(&rc, "grafana-default-email")

			require.True(t, recPermCheck)
			require.Equal(t, 403, response.Status())
		})

		t.Run("json body content is as expected", func(t *testing.T) {
			expectedRedactedResponse := `{"name":"multiple integrations","grafana_managed_receiver_configs":[{"uid":"c2090fda-f824-4add-b545-5a4d5c2ef082","name":"multiple integrations","type":"prometheus-alertmanager","disableResolveMessage":true,"settings":{"basicAuthPassword":"[REDACTED]","basicAuthUser":"test","url":"http://localhost:9093"},"secureFields":{"basicAuthPassword":true}},{"uid":"c84539ec-f87e-4fc5-9a91-7a687d34bbd1","name":"multiple integrations","type":"discord","disableResolveMessage":false,"settings":{"avatar_url":"some avatar","url":"some url","use_discord_username":true},"secureFields":{}}]}`
			expectedDecryptedResponse := `{"name":"multiple integrations","grafana_managed_receiver_configs":[{"uid":"c2090fda-f824-4add-b545-5a4d5c2ef082","name":"multiple integrations","type":"prometheus-alertmanager","disableResolveMessage":true,"settings":{"basicAuthPassword":"testpass","basicAuthUser":"test","url":"http://localhost:9093"},"secureFields":{"basicAuthPassword":true}},{"uid":"c84539ec-f87e-4fc5-9a91-7a687d34bbd1","name":"multiple integrations","type":"discord","disableResolveMessage":false,"settings":{"avatar_url":"some avatar","url":"some url","use_discord_username":true},"secureFields":{}}]}`
			t.Run("decrypt false", func(t *testing.T) {
				env := createTestEnv(t, testContactPointConfig)
				sut := createNotificationSrvSutFromEnv(t, &env)
				rc := createTestRequestCtx()

				rc.Context.Req.Header.Add("Accept", "application/json")
				rc.Context.Req.Form.Set("decrypt", "false")

				response := sut.RouteGetReceiver(&rc, "multiple integrations")

				require.Equal(t, 200, response.Status())
				require.Equal(t, expectedRedactedResponse, string(response.Body()))
			})
			t.Run("decrypt true", func(t *testing.T) {
				env := createTestEnv(t, testContactPointConfig)
				env.ac = &recordingAccessControlFake{
					Callback: func(user *user.SignedInUser, evaluator accesscontrol.Evaluator) (bool, error) {
						return true, nil
					},
				}
				sut := createNotificationSrvSutFromEnv(t, &env)
				rc := createTestRequestCtx()

				rc.Context.Req.Header.Add("Accept", "application/json")
				rc.Context.Req.Form.Set("decrypt", "true")

				response := sut.RouteGetReceiver(&rc, "multiple integrations")

				require.Equal(t, 200, response.Status())
				require.Equal(t, expectedDecryptedResponse, string(response.Body()))
			})
		})
	})
}

func createNotificationSrvSutFromEnv(t *testing.T, env *testEnvironment) NotificationSrv {
	t.Helper()

	receiverSvc := notifier.NewReceiverService(env.ac, env.configs, env.prov, env.secrets, env.xact, env.log)
	return NotificationSrv{
		logger:          env.log,
		receiverService: receiverSvc,
	}
}

func newNotificationSrv(receiverService ReceiverService) *NotificationSrv {
	return &NotificationSrv{
		logger:          log.NewNopLogger(),
		receiverService: receiverService,
	}
}

func testReqCtx(method string) contextmodel.ReqContext {
	return contextmodel.ReqContext{
		Context: &web.Context{
			Req: &http.Request{
				Header: make(http.Header),
				Form:   make(url.Values),
			},
			Resp: web.NewResponseWriter(method, httptest.NewRecorder()),
		},
		SignedInUser: &user.SignedInUser{
			OrgID: 1,
		},
		Logger: &logtest.Fake{},
	}
}
