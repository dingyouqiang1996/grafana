package migration

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/matttproud/golang_protobuf_extensions/pbutil"
	pb "github.com/prometheus/alertmanager/silence/silencepb"
	"github.com/prometheus/common/model"

	migrationStore "github.com/grafana/grafana/pkg/services/ngalert/migration/store"
	"github.com/grafana/grafana/pkg/services/ngalert/models"
)

const (
	// Should be the same as 'NoDataAlertName' in pkg/services/schedule/compat.go.
	NoDataAlertName = "DatasourceNoData"

	ErrorAlertName = "DatasourceError"
)

func (m *migration) addErrorSilence(da migrationStore.DashAlert, rule *models.AlertRule) error {
	if da.ParsedSettings.ExecutionErrorState != "keep_state" {
		return nil
	}

	uid, err := uuid.NewRandom()
	if err != nil {
		return errors.New("failed to create uuid for silence")
	}

	s := &pb.MeshSilence{
		Silence: &pb.Silence{
			Id: uid.String(),
			Matchers: []*pb.Matcher{
				{
					Type:    pb.Matcher_EQUAL,
					Name:    model.AlertNameLabel,
					Pattern: ErrorAlertName,
				},
				{
					Type:    pb.Matcher_EQUAL,
					Name:    "rule_uid",
					Pattern: rule.UID,
				},
			},
			StartsAt:  time.Now(),
			EndsAt:    time.Now().AddDate(1, 0, 0), // 1 year
			CreatedBy: "Grafana Migration",
			Comment:   fmt.Sprintf("Created during migration to unified alerting to silence Error state for alert rule ID '%s' and Title '%s' because the option 'Keep Last State' was selected for Error state", rule.UID, rule.Title),
		},
		ExpiresAt: time.Now().AddDate(1, 0, 0), // 1 year
	}
	if _, ok := m.silences[da.OrgID]; !ok {
		m.silences[da.OrgID] = make([]*pb.MeshSilence, 0)
	}
	m.silences[da.OrgID] = append(m.silences[da.OrgID], s)
	return nil
}

func (m *migration) addNoDataSilence(da migrationStore.DashAlert, rule *models.AlertRule) error {
	if da.ParsedSettings.NoDataState != "keep_state" {
		return nil
	}

	uid, err := uuid.NewRandom()
	if err != nil {
		return errors.New("failed to create uuid for silence")
	}

	s := &pb.MeshSilence{
		Silence: &pb.Silence{
			Id: uid.String(),
			Matchers: []*pb.Matcher{
				{
					Type:    pb.Matcher_EQUAL,
					Name:    model.AlertNameLabel,
					Pattern: NoDataAlertName,
				},
				{
					Type:    pb.Matcher_EQUAL,
					Name:    "rule_uid",
					Pattern: rule.UID,
				},
			},
			StartsAt:  time.Now(),
			EndsAt:    time.Now().AddDate(1, 0, 0), // 1 year.
			CreatedBy: "Grafana Migration",
			Comment:   fmt.Sprintf("Created during migration to unified alerting to silence NoData state for alert rule ID '%s' and Title '%s' because the option 'Keep Last State' was selected for NoData state", rule.UID, rule.Title),
		},
		ExpiresAt: time.Now().AddDate(1, 0, 0), // 1 year.
	}
	_, ok := m.silences[da.OrgID]
	if !ok {
		m.silences[da.OrgID] = make([]*pb.MeshSilence, 0)
	}
	m.silences[da.OrgID] = append(m.silences[da.OrgID], s)
	return nil
}

func (m *migration) writeSilencesFile(orgID int64) error {
	var buf bytes.Buffer
	orgSilences, ok := m.silences[orgID]
	if !ok {
		return nil
	}

	for _, e := range orgSilences {
		if _, err := pbutil.WriteDelimited(&buf, e); err != nil {
			return err
		}
	}

	f, err := openReplace(silencesFileNameForOrg(m.cfg.DataPath, orgID))
	if err != nil {
		return err
	}

	if _, err := io.Copy(f, bytes.NewReader(buf.Bytes())); err != nil {
		return err
	}

	return f.Close()
}

func silencesFileNameForOrg(dataPath string, orgID int64) string {
	return filepath.Join(dataPath, "alerting", strconv.Itoa(int(orgID)), "silences")
}

// replaceFile wraps a file that is moved to another filename on closing.
type replaceFile struct {
	*os.File
	filename string
}

func (f *replaceFile) Close() error {
	if err := f.File.Sync(); err != nil {
		return err
	}
	if err := f.File.Close(); err != nil {
		return err
	}
	return os.Rename(f.File.Name(), f.filename)
}

// openReplace opens a new temporary file that is moved to filename on closing.
func openReplace(filename string) (*replaceFile, error) {
	tmpFilename := fmt.Sprintf("%s.%x", filename, uint64(rand.Int63()))

	if err := os.MkdirAll(filepath.Dir(tmpFilename), os.ModePerm); err != nil {
		return nil, err
	}

	//nolint:gosec
	f, err := os.Create(tmpFilename)
	if err != nil {
		return nil, err
	}

	rf := &replaceFile{
		File:     f,
		filename: filename,
	}
	return rf, nil
}

func getLabelForSilenceMatching(ruleUID string) (string, string) {
	return "rule_uid", ruleUID
}
