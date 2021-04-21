package alerting

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	apimodels "github.com/grafana/alerting-api/pkg/api"
	"github.com/grafana/grafana/pkg/components/simplejson"
	"github.com/grafana/grafana/pkg/models"
	ngmodels "github.com/grafana/grafana/pkg/services/ngalert/models"
	"github.com/grafana/grafana/pkg/services/sqlstore"
	"github.com/grafana/grafana/pkg/tests/testinfra"
)

func TestUnifiedAlerting(t *testing.T) {
	dir, path := testinfra.CreateGrafDir(t, testinfra.GrafanaOpts{
		EnableFeatureToggles: []string{"ngalert"},
		AnonymousUserRole:    models.ROLE_EDITOR,
	})
	store := testinfra.SetUpDatabase(t, dir)
	grafanaListedAddr := testinfra.StartGrafana(t, dir, path, store)

	t.Run("test alert and groups query", func(t *testing.T) {
		// When there are no alerts available, it returns an empty list.
		{
			alertsURL := fmt.Sprintf("http://%s/api/alertmanager/grafana/api/v2/alerts", grafanaListedAddr)
			// nolint:gosec
			resp, err := http.Get(alertsURL)
			require.NoError(t, err)
			t.Cleanup(func() {
				err := resp.Body.Close()
				require.NoError(t, err)
			})
			b, err := ioutil.ReadAll(resp.Body)
			require.NoError(t, err)
			require.Equal(t, 200, resp.StatusCode)
			require.JSONEq(t, "[]", string(b))
		}

		// When are there no alerts available, it returns an empty list of groups.
		{
			alertsURL := fmt.Sprintf("http://%s/api/alertmanager/grafana/api/v2/alerts/groups", grafanaListedAddr)
			// nolint:gosec
			resp, err := http.Get(alertsURL)
			require.NoError(t, err)
			t.Cleanup(func() {
				err := resp.Body.Close()
				require.NoError(t, err)
			})
			b, err := ioutil.ReadAll(resp.Body)
			require.NoError(t, err)
			require.NoError(t, err)
			require.Equal(t, 200, resp.StatusCode)
			require.JSONEq(t, "[]", string(b))
		}
	})

	t.Run("test eval condition", func(t *testing.T) {

		testCases := []struct {
			desc               string
			payload            string
			expectedStatusCode int
			expectedResponse   string
		}{
			{
				desc: "alerting condition",
				payload: `
				{
					"grafana_condition": {
					"condition": "A",
					"data": [
						{
							"refId": "A",
							"relativeTimeRange": {
								"from": 18000,
								"to": 10800
							},
							"model": {
								"datasourceUid": "-100",
								"type":"math",
								"expression":"1 < 2"
							}
						}
					],
					"now": "2021-04-11T14:38:14Z"
					}
				}
				`,
				expectedStatusCode: http.StatusOK,
				expectedResponse: `{
				"instances": [
				  {
					"schema": {
					  "name": "evaluation results",
					  "fields": [
						{
						  "name": "State",
						  "type": "string",
						  "typeInfo": {
							"frame": "string"
						  }
						}
					  ]
					},
					"data": {
					  "values": [
						[
						  "Alerting"
						]
					  ]
					}
				  }
				]
			  }`,
			},
			{
				desc: "normal condition",
				payload: `
				{
					"grafana_condition": {
					"condition": "A",
					"data": [
						{
							"refId": "A",
							"relativeTimeRange": {
								"from": 18000,
								"to": 10800
							},
							"model": {
								"datasourceUid": "-100",
								"type":"math",
								"expression":"1 > 2"
							}
						}
					],
					"now": "2021-04-11T14:38:14Z"
					}
				}
				`,
				expectedStatusCode: http.StatusOK,
				expectedResponse: `{
				"instances": [
				  {
					"schema": {
					  "name": "evaluation results",
					  "fields": [
						{
						  "name": "State",
						  "type": "string",
						  "typeInfo": {
							"frame": "string"
						  }
						}
					  ]
					},
					"data": {
					  "values": [
						[
						  "Normal"
						]
					  ]
					}
				  }
				]
			  }`,
			},
			{
				desc: "condition not found in any query or expression",
				payload: `
				{
					"grafana_condition": {
					"condition": "B",
					"data": [
						{
							"refId": "A",
							"relativeTimeRange": {
								"from": 18000,
								"to": 10800
							},
							"model": {
								"datasourceUid": "-100",
								"type":"math",
								"expression":"1 > 2"
							}
						}
					],
					"now": "2021-04-11T14:38:14Z"
					}
				}
				`,
				expectedStatusCode: http.StatusBadRequest,
				expectedResponse:   `{"error":"condition B not found in any query or expression","message":"invalid condition"}`,
			},
			{
				desc: "unknown query datasource",
				payload: `
				{
					"grafana_condition": {
					"condition": "A",
					"data": [
						{
							"refId": "A",
							"relativeTimeRange": {
								"from": 18000,
								"to": 10800
							},
							"model": {
								"datasourceUid": "unknown"
							}
						}
					],
					"now": "2021-04-11T14:38:14Z"
					}
				}
				`,
				expectedStatusCode: http.StatusBadRequest,
				expectedResponse:   `{"error":"failed to get datasource: unknown: data source not found","message":"invalid condition"}`,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.desc, func(t *testing.T) {
				u := fmt.Sprintf("http://%s/api/v1/rule/test/grafana", grafanaListedAddr)
				r := strings.NewReader(tc.payload)
				// nolint:gosec
				resp, err := http.Post(u, "application/json", r)
				require.NoError(t, err)
				t.Cleanup(func() {
					err := resp.Body.Close()
					require.NoError(t, err)
				})
				b, err := ioutil.ReadAll(resp.Body)
				require.NoError(t, err)

				assert.Equal(t, tc.expectedStatusCode, resp.StatusCode)
				require.JSONEq(t, tc.expectedResponse, string(b))
			})
		}
	})

	t.Run("test eval queries and expressions", func(t *testing.T) {
		testCases := []struct {
			desc               string
			payload            string
			expectedStatusCode int
			expectedResponse   string
		}{
			{
				desc: "alerting condition",
				payload: `
				{
					"data": [
							{
								"refId": "A",
								"relativeTimeRange": {
									"from": 18000,
									"to": 10800
								},
								"model": {
									"datasourceUid": "-100",
									"type":"math",
									"expression":"1 < 2"
								}
							}
						],
					"now": "2021-04-11T14:38:14Z"
				}
				`,
				expectedStatusCode: http.StatusOK,
				expectedResponse: `{
					"results": {
					"A": {
						"frames": [
						{
							"schema": {
							"refId": "A",
							"fields": [
								{
								"name": "A",
								"type": "number",
								"typeInfo": {
									"frame": "float64",
									"nullable": true
								}
								}
							]
							},
							"data": {
							"values": [
								[
								1
								]
							]
							}
						}
						]
					}
					}
				}`,
			},
			{
				desc: "normal condition",
				payload: `
				{
					"data": [
							{
								"refId": "A",
								"relativeTimeRange": {
									"from": 18000,
									"to": 10800
								},
								"model": {
									"datasourceUid": "-100",
									"type":"math",
									"expression":"1 > 2"
								}
							}
						],
					"now": "2021-04-11T14:38:14Z"
				}
				`,
				expectedStatusCode: http.StatusOK,
				expectedResponse: `{
					"results": {
					"A": {
						"frames": [
						{
							"schema": {
							"refId": "A",
							"fields": [
								{
								"name": "A",
								"type": "number",
								"typeInfo": {
									"frame": "float64",
									"nullable": true
								}
								}
							]
							},
							"data": {
							"values": [
								[
								0
								]
							]
							}
						}
						]
					}
					}
				}`,
			},
			{
				desc: "unknown query datasource",
				payload: `
				{
					"data": [
							{
								"refId": "A",
								"relativeTimeRange": {
									"from": 18000,
									"to": 10800
								},
								"model": {
									"datasourceUid": "unknown"
								}
							}
						],
					"now": "2021-04-11T14:38:14Z"
				}
				`,
				expectedStatusCode: http.StatusBadRequest,
				expectedResponse:   `{"error":"failed to get datasource: unknown: data source not found","message":"invalid queries or expressions"}`,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.desc, func(t *testing.T) {
				u := fmt.Sprintf("http://%s/api/v1/eval", grafanaListedAddr)
				r := strings.NewReader(tc.payload)
				// nolint:gosec
				resp, err := http.Post(u, "application/json", r)
				require.NoError(t, err)
				t.Cleanup(func() {
					err := resp.Body.Close()
					require.NoError(t, err)
				})
				b, err := ioutil.ReadAll(resp.Body)
				require.NoError(t, err)

				assert.Equal(t, tc.expectedStatusCode, resp.StatusCode)
				require.JSONEq(t, tc.expectedResponse, string(b))
			})
		}
	})

	t.Run("test alert rule CRUD", func(t *testing.T) {
		// Create the namespace we'll save our alerts to.
		require.NoError(t, createFolder(t, store, 0, "default"))

		// Now, let's create two alerts.
		{
			rules := apimodels.PostableRuleGroupConfig{
				Name: "arulegroup",
				Rules: []apimodels.PostableExtendedRuleNode{
					{
						GrafanaManagedAlert: &apimodels.PostableGrafanaRule{
							OrgID:     2,
							Title:     "AlwaysFiring",
							Condition: "A",
							Data: []ngmodels.AlertQuery{
								{
									RefID: "A",
									RelativeTimeRange: ngmodels.RelativeTimeRange{
										From: ngmodels.Duration(time.Duration(5) * time.Hour),
										To:   ngmodels.Duration(time.Duration(3) * time.Hour),
									},
									Model: json.RawMessage(`{
										"datasourceUid": "-100",
										"type": "math",
										"expression": "2 + 3 > 1"
										}`),
								},
							},
						},
					},
					{
						GrafanaManagedAlert: &apimodels.PostableGrafanaRule{
							OrgID:     2,
							Title:     "AlwaysFiringButSilenced",
							Condition: "A",
							Data: []ngmodels.AlertQuery{
								{
									RefID: "A",
									RelativeTimeRange: ngmodels.RelativeTimeRange{
										From: ngmodels.Duration(time.Duration(5) * time.Hour),
										To:   ngmodels.Duration(time.Duration(3) * time.Hour),
									},
									Model: json.RawMessage(`{
										"datasourceUid": "-100",
										"type": "math",
										"expression": "2 + 3 > 1"
										}`),
								},
							},
						},
					},
				},
			}
			buf := bytes.Buffer{}
			enc := json.NewEncoder(&buf)
			err := enc.Encode(&rules)
			require.NoError(t, err)

			u := fmt.Sprintf("http://%s/api/ruler/grafana/api/v1/rules/default", grafanaListedAddr)
			// nolint:gosec
			resp, err := http.Post(u, "application/json", &buf)
			require.NoError(t, err)
			t.Cleanup(func() {
				err := resp.Body.Close()
				require.NoError(t, err)
			})
			b, err := ioutil.ReadAll(resp.Body)
			require.NoError(t, err)

			assert.Equal(t, resp.StatusCode, 202)
			require.JSONEq(t, `{"message":"rule group updated successfully"}`, string(b))
		}

		// With the rules created, let's make sure that rule definition is stored correctly.
		{
			u := fmt.Sprintf("http://%s/api/ruler/grafana/api/v1/rules/default", grafanaListedAddr)
			// nolint:gosec
			resp, err := http.Get(u)
			require.NoError(t, err)
			t.Cleanup(func() {
				err := resp.Body.Close()
				require.NoError(t, err)
			})
			b, err := ioutil.ReadAll(resp.Body)
			require.NoError(t, err)

			assert.Equal(t, resp.StatusCode, 202)
			assert.JSONEq(t, `
	{
	"default":[
		{
			"name":"arulegroup",
			"interval":"1m",
			"rules":[
				{
				"expr":"",
				"grafana_alert":{
					"id":1,
					"orgId":2,
					"title":"AlwaysFiring",
					"condition":"A",
					"data":[
						{
							"refId":"A",
							"queryType":"",
							"relativeTimeRange":{
							"from":18000,
							"to":10800
							},
							"model":{
							"datasourceUid":"-100",
							"expression":"2 + 3 \u003e 1",
							"intervalMs":1000,
							"maxDataPoints":100,
							"type":"math"
							}
						}
					],
					"updated":"2021-02-21T01:10:30Z",
					"intervalSeconds":60,
					"version":1,
					"uid":"uid",
					"namespace_uid":"nsuid",
					"namespace_id":1,
					"rule_group":"arulegroup",
					"no_data_state":"",
					"exec_err_state":""
				}
				},
				{
				"expr":"",
				"grafana_alert":{
					"id":2,
					"orgId":2,
					"title":"AlwaysFiringButSilenced",
					"condition":"A",
					"data":[
						{
							"refId":"A",
							"queryType":"",
							"relativeTimeRange":{
							"from":18000,
							"to":10800
							},
							"model":{
							"datasourceUid":"-100",
							"expression":"2 + 3 \u003e 1",
							"intervalMs":1000,
							"maxDataPoints":100,
							"type":"math"
							}
						}
					],
					"updated":"2021-02-21T01:10:30Z",
					"intervalSeconds":60,
					"version":1,
					"uid":"uid",
					"namespace_uid":"nsuid",
					"namespace_id":1,
					"rule_group":"arulegroup",
					"no_data_state":"",
					"exec_err_state":""
				}
				}
			]
		}
	]
	}`, rulesNamespaceWithoutVariableValues(t, b))
		}

		client := &http.Client{}
		// Finally, make sure we can delete it.
		{
			// If the rule group name does not exists
			u := fmt.Sprintf("http://%s/api/ruler/grafana/api/v1/rules/default/groupnotexist", grafanaListedAddr)
			req, err := http.NewRequest(http.MethodDelete, u, nil)
			require.NoError(t, err)
			resp, err := client.Do(req)
			require.NoError(t, err)
			t.Cleanup(func() {
				err := resp.Body.Close()
				require.NoError(t, err)
			})
			b, err := ioutil.ReadAll(resp.Body)
			require.NoError(t, err)

			require.Equal(t, http.StatusNotFound, resp.StatusCode)
			require.JSONEq(t, `{"error":"rule group not found under this namespace", "message": "failed to delete rule group"}`, string(b))

			// If the rule group name does exist
			u = fmt.Sprintf("http://%s/api/ruler/grafana/api/v1/rules/default/arulegroup", grafanaListedAddr)
			req, err = http.NewRequest(http.MethodDelete, u, nil)
			require.NoError(t, err)
			resp, err = client.Do(req)
			require.NoError(t, err)
			t.Cleanup(func() {
				err := resp.Body.Close()
				require.NoError(t, err)
			})
			b, err = ioutil.ReadAll(resp.Body)
			require.NoError(t, err)

			require.Equal(t, http.StatusAccepted, resp.StatusCode)
			require.JSONEq(t, `{"message":"rule group deleted"}`, string(b))
		}
	})
}

// createFolder creates a folder for storing our alerts under. Grafana uses folders as a replacement for alert namespaces to match its permission model.
// We use the dashboard command using IsFolder = true to tell it's a folder, it takes the dashboard as the name of the folder.
func createFolder(t *testing.T, store *sqlstore.SQLStore, folderID int64, folderName string) error {
	t.Helper()

	cmd := models.SaveDashboardCommand{
		OrgId:    2, // This is the orgID of the anonymous user.
		FolderId: folderID,
		IsFolder: true,
		Dashboard: simplejson.NewFromAny(map[string]interface{}{
			"title": folderName,
		}),
	}
	_, err := store.SaveDashboard(cmd)

	return err
}

// rulesNamespaceWithoutVariableValues takes a apimodels.NamespaceConfigResponse JSON-based input and makes the dynamic fields static e.g. uid, dates, etc.
func rulesNamespaceWithoutVariableValues(t *testing.T, b []byte) string {
	t.Helper()

	var r apimodels.NamespaceConfigResponse
	require.NoError(t, json.Unmarshal(b, &r))
	for _, nodes := range r {
		for _, node := range nodes {
			for _, rule := range node.Rules {
				rule.GrafanaManagedAlert.UID = "uid"
				rule.GrafanaManagedAlert.NamespaceUID = "nsuid"
				rule.GrafanaManagedAlert.Updated = time.Date(2021, time.Month(2), 21, 1, 10, 30, 0, time.UTC)
			}
		}
	}

	json, err := json.Marshal(&r)
	require.NoError(t, err)
	return string(json)
}
