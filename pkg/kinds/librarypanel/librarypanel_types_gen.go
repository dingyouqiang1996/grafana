// Code generated - EDITING IS FUTILE. DO NOT EDIT.
//
// Generated by:
//     kinds/gen.go
// Using jennies:
//     GoTypesJenny
//     LatestJenny
//
// Run 'make gen-cue' from repository root to regenerate.

package librarypanel

// LibraryElementDTOMeta defines model for LibraryElementDTOMeta.
type LibraryElementDTOMeta struct {
	ConnectedDashboards int64                     `json:"connectedDashboards"`
	Created             int64                     `json:"created"`
	CreatedBy           LibraryElementDTOMetaUser `json:"createdBy"`
	FolderName          string                    `json:"folderName"`
	FolderUid           string                    `json:"folderUid"`
	Updated             int64                     `json:"updated"`
	UpdatedBy           LibraryElementDTOMetaUser `json:"updatedBy"`
}

// LibraryElementDTOMetaUser defines model for LibraryElementDTOMetaUser.
type LibraryElementDTOMetaUser struct {
	AvatarUrl string `json:"avatarUrl"`
	Id        int64  `json:"id"`
	Name      string `json:"name"`
}

// LibraryPanel defines model for LibraryPanel.
type LibraryPanel struct {
	// Panel description (ideally optional, but avoid pointer issues)
	Description string `json:"description"`

	// TODO -- remove... do not expose internal ID
	FolderId int64 `json:"folderId"`

	// Folder UID
	FolderUid string `json:"folderUid"`

	// TODO: remove, should not be externally defined
	Id int64 `json:"id"`

	// TODO, remove?  always 1
	Kind int64                  `json:"kind"`
	Meta *LibraryElementDTOMeta `json:"meta,omitempty"`

	// TODO: this should the same panel type as defined inside dashboard
	Model interface{} `json:"model"`

	// Panel name (also saved in the model)
	Name string `json:"name"`

	// TODO: remove, should not be externally defined
	OrgId int64 `json:"orgId"`

	// Dashboard version when this was saved
	SchemaVersion int `json:"schemaVersion"`

	// The panel type (from inside the model)
	Type string `json:"type"`

	// Library element UID
	Uid string `json:"uid"`

	// panel version, incremented each time the dashboard is updated.
	Version int64 `json:"version"`
}
