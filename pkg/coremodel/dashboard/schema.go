package dashboard

import (
	"embed"
	"path/filepath"

	"github.com/grafana/thema"

	"github.com/grafana/grafana/pkg/cuectx"
)

var (
	//go:embed lineage.cue
	cueFS embed.FS

	// TODO: this should be generated by Thema.
	currentVersion = thema.SV(0, 0)
)

// HandoffSchemaVersion is the minimum schemaVersion for dashboards at which the
// Thema-based dashboard schema is known to be valid.
//
// schemaVersion is the original version numbering system for dashboards. If a
// dashboard is below this schemaVersion, it is necessary for the frontend
// typescript dashboard migration logic to first run and get it past this
// number, after which Thema can take over.
const HandoffSchemaVersion = 36

// Lineage returns the Thema lineage representing Grafana dashboards. The
// lineage is the canonical specification of the current datasource schema, all
// prior schema versions, and the mappings that allow migration between schema
// versions.
//
// This is the base variant of the schema, which does not include any composed
// plugin schemas.
func Lineage(lib thema.Library, opts ...thema.BindOption) (thema.Lineage, error) {
	return cuectx.LoadGrafanaInstancesWithThema(filepath.Join("pkg", "coremodel", "dashboard"), cueFS, lib, opts...)
}

// Model is a dummy struct stand-in for dashboards.
//
// It exists solely to trick compgen into accepting the dashboard coremodel as valid.
type Model struct{}

// model is a hacky Go struct representing a dashboard.
//
// This exists solely because the coremodel framework enforces that there is a Go struct to which
// all valid Thema schema instances can be assigned, per Thema's assignability checker. See
// https://github.com/grafana/thema/blob/main/docs/invariants.md#go-assignability for rules.
//
// DO NOT RELY ON THIS FOR ANYTHING REAL. It is unclear whether we will ever attempt to have a correct, complete
// Go struct representation of dashboards, let alone compress it into a single struct.
type model struct {
	Title        string   `json:"title"`
	Description  string   `json:"description"`
	GnetId       string   `json:"gnetId"`
	Tags         []string `json:"tags"`
	Style        string   `json:"style"`
	Timezone     string   `json:"timezone"`
	Editable     bool     `json:"editable"`
	GraphTooltip uint8    `json:"graphTooltip"`
	Time         struct {
		From string `json:"from"`
		To   string `json:"to"`
	} `json:"time"`
	Timepicker struct {
		Collapse         bool     `json:"collapse"`
		Enable           bool     `json:"enable"`
		Hidden           bool     `json:"hidden"`
		RefreshIntervals []string `json:"refresh_intervals"`
	} `json:"timepicker"`
	Templating struct {
		List []interface{} `json:"list"`
	} `json:"templating"`
	Annotations struct {
		List []struct {
			Name       string `json:"name"`
			Type       string `json:"type"`
			BuiltIn    uint8  `json:"builtIn"`
			Datasource struct {
				Type string `json:"type"`
				Uid  string `json:"uid"`
			} `json:"datasource"`
			Enable    bool        `json:"enable"`
			Hide      bool        `json:"hide,omitempty"`
			IconColor string      `json:"iconColor"`
			RawQuery  string      `json:"rawQuery,omitempty"`
			ShowIn    int         `json:"showIn"`
			Target    interface{} `json:"target"`
		} `json:"list"`
	} `json:"annotations"`
	Refresh       interface{} `json:"refresh"` // (bool|string)
	SchemaVersion int         `json:"schemaVersion"`
	Links         []struct {
		Title       string   `json:"title"`
		Type        string   `json:"type"`
		Icon        string   `json:"icon,omitempty"`
		Tooltip     string   `json:"tooltip,omitempty"`
		Url         string   `json:"url,omitempty"`
		Tags        []string `json:"tags"`
		AsDropdown  bool     `json:"asDropdown"`
		TargetBlank bool     `json:"targetBlank"`
		IncludeVars bool     `json:"includeVars"`
		KeepTime    bool     `json:"keepTime"`
	} `json:"links"`
	Panels               []interface{} `json:"panels"`
	FiscalYearStartMonth uint8         `json:"fiscalYearStartMonth"`
	LiveNow              bool          `json:"liveNow"`
	WeekStart            string        `json:"weekStart"`

	// //

	Uid string `json:"uid"`
	// OrgId   int64  `json:"orgId"`
	Id      int64 `json:"id,omitempty"`
	Version int   `json:"version"`
}
