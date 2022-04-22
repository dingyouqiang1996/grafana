package export

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/featuremgmt"
	"github.com/grafana/grafana/pkg/services/sqlstore"
)

type ExportService interface {
	// List folder contents
	HandleGetStatus(c *models.ReqContext) response.Response

	// Read raw file contents out of the store
	HandleRequestExport(c *models.ReqContext) response.Response
}

type StandardExport struct {
	logger log.Logger
	sql    *sqlstore.SQLStore
	mutex  sync.Mutex

	// updated with mutex
	exportJob Job
}

func ProvideService(sql *sqlstore.SQLStore, features featuremgmt.FeatureToggles) ExportService {
	if !features.IsEnabled(featuremgmt.FlagExport) {
		return &StubExport{}
	}

	return &StandardExport{
		sql:       sql,
		logger:    log.New("export_service"),
		exportJob: &stoppedJob{},
	}
}

func (ex *StandardExport) HandleGetStatus(c *models.ReqContext) response.Response {
	ex.mutex.Lock()
	defer ex.mutex.Unlock()

	return response.JSON(http.StatusOK, ex.exportJob.getStatus())
}

func (ex *StandardExport) HandleRequestExport(c *models.ReqContext) response.Response {
	var cfg ExportConfig
	err := json.NewDecoder(c.Req.Body).Decode(&cfg)
	if err != nil {
		return response.Error(http.StatusBadRequest, "unable to read config", err)
	}

	ex.mutex.Lock()
	defer ex.mutex.Unlock()

	status := ex.exportJob.getStatus()
	if status.Running {
		ex.logger.Error("export already running")
		return response.Error(http.StatusLocked, "export already running", nil)
	}

	job, err := startDummyExportJob(cfg)
	if err != nil {
		ex.logger.Error("failed to start export job", "err", err)
		return response.Error(http.StatusBadRequest, "failed to start export job", err)
	}

	ex.exportJob = job
	return response.JSON(http.StatusOK, ex.exportJob.getStatus())
}
