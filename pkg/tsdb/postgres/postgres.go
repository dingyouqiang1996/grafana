package postgres

import (
	"database/sql"
	"net/url"
	"strconv"

	"github.com/grafana/grafana/pkg/setting"

	"github.com/go-xorm/core"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/tsdb"
	"github.com/grafana/grafana/pkg/tsdb/sqleng"
)

func init() {
	tsdb.RegisterTsdbQueryEndpoint("postgres", newPostgresQueryEndpoint)
}

func newPostgresQueryEndpoint(datasource *models.DataSource) (tsdb.TsdbQueryEndpoint, error) {
	logger := log.New("tsdb.postgres")

	cnnstr := generateConnectionString(datasource, logger)
	if setting.Env == setting.DEV {
		logger.Debug("getEngine", "connection", cnnstr)
	}

	config := sqleng.SqlQueryEndpointConfiguration{
		DriverName:        "postgres",
		ConnectionString:  cnnstr,
		Datasource:        datasource,
		MetricColumnTypes: []string{"UNKNOWN", "TEXT", "VARCHAR", "CHAR"},
	}

	queryResultTransformer := postgresQueryResultTransformer{
		log: logger,
	}

	timescaledb := datasource.JsonData.Get("timescaledb").MustBool(false)

	return sqleng.NewSqlQueryEndpoint(&config, &queryResultTransformer, newPostgresMacroEngine(timescaledb), logger)
}

func generateConnectionString(datasource *models.DataSource, logger log.Logger) string {
	sslmode := datasource.JsonData.Get("sslmode").MustString("verify-full")

	// Always pass SSL mode
	sslopts := "sslmode=" + url.QueryEscape(sslmode)

	// Attach root certificate if provided
	if sslrootcert := datasource.JsonData.Get("sslrootcertfile").MustString(""); sslrootcert != "" {
		logger.Debug("Setting CA certificate: %s", sslrootcert)
		sslopts += "sslrootcert=" + url.QueryEscape(sslrootcert)
	}

	// Attach client certificate and key if both are provided
	sslcert := datasource.JsonData.Get("sslcertfile").MustString("")
	sslkey := datasource.JsonData.Get("sslkeyfile").MustString("")

	if sslcert != "" && sslkey != "" {
		logger.Debug("Setting TLS client certificate: %s key: %s", sslcert, sslkey)
		sslopts += "sslcert=" + url.QueryEscape(sslcert) + "sslkey=" + url.QueryEscape(sslkey)

	} else if (sslcert != "" && sslkey == "") || (sslcert == "" && sslkey != "") {
		logger.Error("TLS client and certificate must BOTH be specified")
	}

	// Build URL
	u := &url.URL{
		Scheme: "postgres",
		User:   url.UserPassword(datasource.User, datasource.DecryptedPassword()),
		Host:   datasource.Url, Path: datasource.Database,
		RawQuery: sslopts,
	}

	return u.String()
}

type postgresQueryResultTransformer struct {
	log log.Logger
}

func (t *postgresQueryResultTransformer) TransformQueryResult(columnTypes []*sql.ColumnType, rows *core.Rows) (tsdb.RowValues, error) {
	values := make([]interface{}, len(columnTypes))
	valuePtrs := make([]interface{}, len(columnTypes))

	for i := 0; i < len(columnTypes); i++ {
		valuePtrs[i] = &values[i]
	}

	if err := rows.Scan(valuePtrs...); err != nil {
		return nil, err
	}

	// convert types not handled by lib/pq
	// unhandled types are returned as []byte
	for i := 0; i < len(columnTypes); i++ {
		if value, ok := values[i].([]byte); ok {
			switch columnTypes[i].DatabaseTypeName() {
			case "NUMERIC":
				if v, err := strconv.ParseFloat(string(value), 64); err == nil {
					values[i] = v
				} else {
					t.log.Debug("Rows", "Error converting numeric to float", value)
				}
			case "UNKNOWN", "CIDR", "INET", "MACADDR":
				// char literals have type UNKNOWN
				values[i] = string(value)
			default:
				t.log.Debug("Rows", "Unknown database type", columnTypes[i].DatabaseTypeName(), "value", value)
				values[i] = string(value)
			}
		}
	}

	return values, nil
}

func (t *postgresQueryResultTransformer) TransformQueryError(err error) error {
	return err
}
