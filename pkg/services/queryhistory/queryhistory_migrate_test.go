//go:build integration
// +build integration

package queryhistory

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/grafana/grafana/pkg/components/simplejson"
	"github.com/stretchr/testify/require"
)

func TestMigrateQueriesToQueryHistory(t *testing.T) {
	testScenario(t, "When users tries to migrate 1 query in query history it should succeed",
		func(t *testing.T, sc scenarioContext) {
			command := MigrateQueriesToQueryHistoryCommand{
				Queries: []QueryToMigrate{
					{
						DatasourceUID: "NCzh67i",
						Queries: simplejson.NewFromAny(map[string]interface{}{
							"expr": "test",
						}),
						Comment:   "",
						Starred:   false,
						CreatedAt: time.Now().Unix(),
					},
				},
			}
			sc.reqContext.Req.Body = mockRequestBody(command)
			resp := sc.service.migrateHandler(sc.reqContext)
			var response QueryHistoryMigrationResponse
			err := json.Unmarshal(resp.Body(), &response)
			require.NoError(t, err)
			require.Equal(t, 200, resp.Status())
			require.Equal(t, 1, len(response.Result))
		})

	testScenario(t, "When users tries to migrate multiple queries in query history it should succeed",
		func(t *testing.T, sc scenarioContext) {
			command := MigrateQueriesToQueryHistoryCommand{
				Queries: []QueryToMigrate{
					{
						DatasourceUID: "NCzh67i",
						Queries: simplejson.NewFromAny(map[string]interface{}{
							"expr": "test1",
						}),
						Comment:   "",
						Starred:   false,
						CreatedAt: time.Now().Unix(),
					},
					{
						DatasourceUID: "NCzh67i",
						Queries: simplejson.NewFromAny(map[string]interface{}{
							"expr": "test2",
						}),
						Comment:   "",
						Starred:   false,
						CreatedAt: time.Now().Unix() - int64(100),
					},
					{
						DatasourceUID: "ABch68f",
						Queries: simplejson.NewFromAny(map[string]interface{}{
							"expr": "test3",
						}),
						Comment:   "",
						Starred:   false,
						CreatedAt: time.Now().Unix() - int64(1000),
					},
				},
			}
			sc.reqContext.Req.Body = mockRequestBody(command)
			resp := sc.service.migrateHandler(sc.reqContext)
			var response QueryHistoryMigrationResponse
			err := json.Unmarshal(resp.Body(), &response)
			require.NoError(t, err)
			require.Equal(t, 200, resp.Status())
			require.Equal(t, 3, len(response.Result))
		})
	testScenario(t, "When users tries to migrate starred query in query history it should succeed",
		func(t *testing.T, sc scenarioContext) {
			command := MigrateQueriesToQueryHistoryCommand{
				Queries: []QueryToMigrate{
					{
						DatasourceUID: "NCzh67i",
						Queries: simplejson.NewFromAny(map[string]interface{}{
							"expr": "test1",
						}),
						Comment:   "",
						Starred:   true,
						CreatedAt: time.Now().Unix(),
					},
				},
			}
			sc.reqContext.Req.Body = mockRequestBody(command)
			resp := sc.service.migrateHandler(sc.reqContext)
			var response QueryHistoryMigrationResponse
			err := json.Unmarshal(resp.Body(), &response)
			require.NoError(t, err)
			require.Equal(t, 200, resp.Status())
			require.Equal(t, 1, len(response.Result))
			require.Equal(t, true, response.Result[0].Starred)
		})

	testScenario(t, "When users tries to migrate starred and not starred query in query history it should succeed",
		func(t *testing.T, sc scenarioContext) {
			command := MigrateQueriesToQueryHistoryCommand{
				Queries: []QueryToMigrate{
					{
						DatasourceUID: "NCzh67i",
						Queries: simplejson.NewFromAny(map[string]interface{}{
							"expr": "test1",
						}),
						Comment:   "",
						Starred:   true,
						CreatedAt: time.Now().Unix(),
					},
					{
						DatasourceUID: "NCzh67i",
						Queries: simplejson.NewFromAny(map[string]interface{}{
							"expr": "test2",
						}),
						Comment:   "",
						Starred:   false,
						CreatedAt: time.Now().Unix() - int64(100),
					},
				},
			}
			sc.reqContext.Req.Body = mockRequestBody(command)
			resp := sc.service.migrateHandler(sc.reqContext)
			var response QueryHistoryMigrationResponse
			err := json.Unmarshal(resp.Body(), &response)
			require.NoError(t, err)
			require.Equal(t, 200, resp.Status())
			require.Equal(t, 2, len(response.Result))
			require.Equal(t, true, response.Result[0].Starred)
			require.Equal(t, false, response.Result[1].Starred)
		})
}
