package libraryelements

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/grafana/grafana/pkg/services/search"

	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/sqlstore"
	"github.com/grafana/grafana/pkg/util"
)

const (
	selectLibraryElementDTOWithMeta = `
SELECT DISTINCT
	le.name, le.id, le.org_id, le.folder_id, le.uid, le.kind, le.type, le.description, le.model, le.created, le.created_by, le.updated, le.updated_by, le.version
	, u1.login AS created_by_name
	, u1.email AS created_by_email
	, u2.login AS updated_by_name
	, u2.email AS updated_by_email
	, (SELECT COUNT(connection_id) FROM ` + connectionTableName + ` WHERE library_element_id = le.id AND connection_kind=1) AS connections`
	fromLibraryElementDTOWithMeta = `
FROM library_element AS le
	LEFT JOIN user AS u1 ON le.created_by = u1.id
	LEFT JOIN user AS u2 ON le.updated_by = u2.id
`
)

func syncFieldsWithModel(libraryElement *LibraryElement) error {
	var model map[string]interface{}
	if err := json.Unmarshal(libraryElement.Model, &model); err != nil {
		return err
	}

	if LibraryElementKind(libraryElement.Kind) == Panel {
		model["title"] = libraryElement.Name
	} else if LibraryElementKind(libraryElement.Kind) == Variable {
		model["name"] = libraryElement.Name
	}
	if model["type"] != nil {
		libraryElement.Type = model["type"].(string)
	} else {
		model["type"] = libraryElement.Type
	}
	if model["description"] != nil {
		libraryElement.Description = model["description"].(string)
	} else {
		model["description"] = libraryElement.Description
	}
	syncedModel, err := json.Marshal(&model)
	if err != nil {
		return err
	}

	libraryElement.Model = syncedModel

	return nil
}

func getLibraryElement(session *sqlstore.DBSession, uid string, orgID int64) (LibraryElementWithMeta, error) {
	elements := make([]LibraryElementWithMeta, 0)
	sql := selectLibraryElementDTOWithMeta +
		", coalesce(dashboard.title, 'General') AS folder_name" +
		", coalesce(dashboard.uid, '') AS folder_uid" +
		fromLibraryElementDTOWithMeta +
		" LEFT JOIN dashboard AS dashboard ON dashboard.id = le.folder_id" +
		" WHERE le.uid=? AND le.org_id=?"
	sess := session.SQL(sql, uid, orgID)
	err := sess.Find(&elements)
	if err != nil {
		return LibraryElementWithMeta{}, err
	}
	if len(elements) == 0 {
		return LibraryElementWithMeta{}, errLibraryElementNotFound
	}
	if len(elements) > 1 {
		return LibraryElementWithMeta{}, fmt.Errorf("found %d elements, while expecting at most one", len(elements))
	}

	return elements[0], nil
}

// createLibraryElement adds a library element.
func (l *libraryElementServiceImpl) createLibraryElement(c *models.ReqContext, cmd CreateLibraryElementCommand) (LibraryElementDTO, error) {
	if err := l.requireSupportedElementKind(cmd.Kind); err != nil {
		return LibraryElementDTO{}, err
	}
	element := LibraryElement{
		OrgID:    c.SignedInUser.OrgId,
		FolderID: cmd.FolderID,
		UID:      util.GenerateShortUID(),
		Name:     cmd.Name,
		Model:    cmd.Model,
		Version:  1,
		Kind:     cmd.Kind,

		Created: time.Now(),
		Updated: time.Now(),

		CreatedBy: c.SignedInUser.UserId,
		UpdatedBy: c.SignedInUser.UserId,
	}

	if err := syncFieldsWithModel(&element); err != nil {
		return LibraryElementDTO{}, err
	}

	err := l.SQLStore.WithTransactionalDbSession(c.Context.Req.Context(), func(session *sqlstore.DBSession) error {
		if err := l.requirePermissionsOnFolder(c.SignedInUser, cmd.FolderID); err != nil {
			return err
		}
		if _, err := session.Insert(&element); err != nil {
			if l.SQLStore.Dialect.IsUniqueConstraintViolation(err) {
				return errLibraryElementAlreadyExists
			}
			return err
		}
		return nil
	})

	dto := LibraryElementDTO{
		ID:          element.ID,
		OrgID:       element.OrgID,
		FolderID:    element.FolderID,
		UID:         element.UID,
		Name:        element.Name,
		Kind:        element.Kind,
		Type:        element.Type,
		Description: element.Description,
		Model:       element.Model,
		Version:     element.Version,
		Meta: LibraryElementDTOMeta{
			Connections: 0,
			Created:     element.Created,
			Updated:     element.Updated,
			CreatedBy: LibraryElementDTOMetaUser{
				ID:        element.CreatedBy,
				Name:      c.SignedInUser.Login,
				AvatarURL: dtos.GetGravatarUrl(c.SignedInUser.Email),
			},
			UpdatedBy: LibraryElementDTOMetaUser{
				ID:        element.UpdatedBy,
				Name:      c.SignedInUser.Login,
				AvatarURL: dtos.GetGravatarUrl(c.SignedInUser.Email),
			},
		},
	}

	return dto, err
}

// deleteLibraryElement deletes a library element.
func (l *libraryElementServiceImpl) deleteLibraryElement(c *models.ReqContext, uid string) error {
	return l.SQLStore.WithTransactionalDbSession(c.Context.Req.Context(), func(session *sqlstore.DBSession) error {
		element, err := getLibraryElement(session, uid, c.SignedInUser.OrgId)
		if err != nil {
			return err
		}
		if err := l.requirePermissionsOnFolder(c.SignedInUser, element.FolderID); err != nil {
			return err
		}
		var connectionIDs []struct {
			ConnectionID int64 `xorm:"connection_id"`
		}
		sql := "SELECT connection_id FROM library_element_connection WHERE library_element_id=?"
		if err := session.SQL(sql, element.ID).Find(&connectionIDs); err != nil {
			return err
		} else if len(connectionIDs) > 0 {
			return errLibraryElementHasConnections
		}

		result, err := session.Exec("DELETE FROM library_element WHERE id=?", element.ID)
		if err != nil {
			return err
		}
		if rowsAffected, err := result.RowsAffected(); err != nil {
			return err
		} else if rowsAffected != 1 {
			return errLibraryElementNotFound
		}

		return nil
	})
}

// getLibraryElement gets a Library Element.
func (l *libraryElementServiceImpl) getLibraryElement(c *models.ReqContext, uid string) (LibraryElementDTO, error) {
	var libraryElement LibraryElementWithMeta
	err := l.SQLStore.WithDbSession(c.Context.Req.Context(), func(session *sqlstore.DBSession) error {
		libraryElements := make([]LibraryElementWithMeta, 0)
		builder := sqlstore.SQLBuilder{}
		builder.Write(selectLibraryElementDTOWithMeta)
		builder.Write(", 'General' as folder_name ")
		builder.Write(", '' as folder_uid ")
		builder.Write(fromLibraryElementDTOWithMeta)
		builder.Write(` WHERE le.uid=? AND le.org_id=? AND le.folder_id=0`, uid, c.SignedInUser.OrgId)
		builder.Write(" UNION ")
		builder.Write(selectLibraryElementDTOWithMeta)
		builder.Write(", dashboard.title as folder_name ")
		builder.Write(", dashboard.uid as folder_uid ")
		builder.Write(fromLibraryElementDTOWithMeta)
		builder.Write(" INNER JOIN dashboard AS dashboard on le.folder_id = dashboard.id AND le.folder_id <> 0")
		builder.Write(` WHERE le.uid=? AND le.org_id=?`, uid, c.SignedInUser.OrgId)
		if c.SignedInUser.OrgRole != models.ROLE_ADMIN {
			builder.WriteDashboardPermissionFilter(c.SignedInUser, models.PERMISSION_VIEW)
		}
		builder.Write(` OR dashboard.id=0`)
		if err := session.SQL(builder.GetSQLString(), builder.GetParams()...).Find(&libraryElements); err != nil {
			return err
		}
		if len(libraryElements) == 0 {
			return errLibraryElementNotFound
		}
		if len(libraryElements) > 1 {
			return fmt.Errorf("found %d elements, while expecting at most one", len(libraryElements))
		}

		libraryElement = libraryElements[0]

		return nil
	})
	if err != nil {
		return LibraryElementDTO{}, err
	}

	dto := LibraryElementDTO{
		ID:          libraryElement.ID,
		OrgID:       libraryElement.OrgID,
		FolderID:    libraryElement.FolderID,
		UID:         libraryElement.UID,
		Name:        libraryElement.Name,
		Kind:        libraryElement.Kind,
		Type:        libraryElement.Type,
		Description: libraryElement.Description,
		Model:       libraryElement.Model,
		Version:     libraryElement.Version,
		Meta: LibraryElementDTOMeta{
			FolderName:  libraryElement.FolderName,
			FolderUID:   libraryElement.FolderUID,
			Connections: libraryElement.Connections,
			Created:     libraryElement.Created,
			Updated:     libraryElement.Updated,
			CreatedBy: LibraryElementDTOMetaUser{
				ID:        libraryElement.CreatedBy,
				Name:      libraryElement.CreatedByName,
				AvatarURL: dtos.GetGravatarUrl(libraryElement.CreatedByEmail),
			},
			UpdatedBy: LibraryElementDTOMetaUser{
				ID:        libraryElement.UpdatedBy,
				Name:      libraryElement.UpdatedByName,
				AvatarURL: dtos.GetGravatarUrl(libraryElement.UpdatedByEmail),
			},
		},
	}

	return dto, nil
}

// getAllLibraryElements gets all Library Elements.
func (l *libraryElementServiceImpl) getAllLibraryElements(c *models.ReqContext, query searchLibraryElementsQuery) (LibraryElementSearchResult, error) {
	elements := make([]LibraryElementWithMeta, 0)
	result := LibraryElementSearchResult{}
	if query.perPage <= 0 {
		query.perPage = 100
	}
	if query.page <= 0 {
		query.page = 1
	}
	var typeFilter []string
	if len(strings.TrimSpace(query.typeFilter)) > 0 {
		typeFilter = strings.Split(query.typeFilter, ",")
	}
	folderFilter := parseFolderFilter(query)
	if folderFilter.parseError != nil {
		return LibraryElementSearchResult{}, folderFilter.parseError
	}
	err := l.SQLStore.WithDbSession(c.Context.Req.Context(), func(session *sqlstore.DBSession) error {
		builder := sqlstore.SQLBuilder{}
		if folderFilter.includeGeneralFolder {
			builder.Write(selectLibraryElementDTOWithMeta)
			builder.Write(", 'General' as folder_name ")
			builder.Write(", '' as folder_uid ")
			builder.Write(fromLibraryElementDTOWithMeta)
			builder.Write(` WHERE le.org_id=?  AND le.folder_id=0`, c.SignedInUser.OrgId)
			writeKindSQL(query, &builder)
			writeSearchStringSQL(query, l.SQLStore, &builder)
			writeExcludeSQL(query, &builder)
			writeTypeFilterSQL(typeFilter, &builder)
			builder.Write(" UNION ")
		}
		builder.Write(selectLibraryElementDTOWithMeta)
		builder.Write(", dashboard.title as folder_name ")
		builder.Write(", dashboard.uid as folder_uid ")
		builder.Write(fromLibraryElementDTOWithMeta)
		builder.Write(" INNER JOIN dashboard AS dashboard on le.folder_id = dashboard.id AND le.folder_id<>0")
		builder.Write(` WHERE le.org_id=?`, c.SignedInUser.OrgId)
		writeKindSQL(query, &builder)
		writeSearchStringSQL(query, l.SQLStore, &builder)
		writeExcludeSQL(query, &builder)
		writeTypeFilterSQL(typeFilter, &builder)
		if err := folderFilter.writeFolderFilterSQL(false, &builder); err != nil {
			return err
		}
		if c.SignedInUser.OrgRole != models.ROLE_ADMIN {
			builder.WriteDashboardPermissionFilter(c.SignedInUser, models.PERMISSION_VIEW)
		}
		if query.sortDirection == search.SortAlphaDesc.Name {
			builder.Write(" ORDER BY 1 DESC")
		} else {
			builder.Write(" ORDER BY 1 ASC")
		}
		writePerPageSQL(query, l.SQLStore, &builder)
		if err := session.SQL(builder.GetSQLString(), builder.GetParams()...).Find(&elements); err != nil {
			return err
		}

		retDTOs := make([]LibraryElementDTO, 0)
		for _, element := range elements {
			retDTOs = append(retDTOs, LibraryElementDTO{
				ID:          element.ID,
				OrgID:       element.OrgID,
				FolderID:    element.FolderID,
				UID:         element.UID,
				Name:        element.Name,
				Kind:        element.Kind,
				Type:        element.Type,
				Description: element.Description,
				Model:       element.Model,
				Version:     element.Version,
				Meta: LibraryElementDTOMeta{
					FolderName:  element.FolderName,
					FolderUID:   element.FolderUID,
					Connections: element.Connections,
					Created:     element.Created,
					Updated:     element.Updated,
					CreatedBy: LibraryElementDTOMetaUser{
						ID:        element.CreatedBy,
						Name:      element.CreatedByName,
						AvatarURL: dtos.GetGravatarUrl(element.CreatedByEmail),
					},
					UpdatedBy: LibraryElementDTOMetaUser{
						ID:        element.UpdatedBy,
						Name:      element.UpdatedByName,
						AvatarURL: dtos.GetGravatarUrl(element.UpdatedByEmail),
					},
				},
			})
		}

		var libraryElements []LibraryElement
		countBuilder := sqlstore.SQLBuilder{}
		countBuilder.Write("SELECT * FROM library_element AS le")
		countBuilder.Write(` WHERE le.org_id=?`, c.SignedInUser.OrgId)
		writeKindSQL(query, &countBuilder)
		writeSearchStringSQL(query, l.SQLStore, &countBuilder)
		writeExcludeSQL(query, &countBuilder)
		writeTypeFilterSQL(typeFilter, &countBuilder)
		if err := folderFilter.writeFolderFilterSQL(true, &countBuilder); err != nil {
			return err
		}
		if err := session.SQL(countBuilder.GetSQLString(), countBuilder.GetParams()...).Find(&libraryElements); err != nil {
			return err
		}

		result = LibraryElementSearchResult{
			TotalCount: int64(len(libraryElements)),
			Elements:   retDTOs,
			Page:       query.page,
			PerPage:    query.perPage,
		}

		return nil
	})

	return result, err
}

func (l *libraryElementServiceImpl) handleFolderIDPatches(elementToPatch *LibraryElement, fromFolderID int64, toFolderID int64, user *models.SignedInUser) error {
	// FolderID was not provided in the PATCH request
	if toFolderID == -1 {
		toFolderID = fromFolderID
	}

	// FolderID was provided in the PATCH request
	if toFolderID != -1 && toFolderID != fromFolderID {
		if err := l.requirePermissionsOnFolder(user, toFolderID); err != nil {
			return err
		}
	}

	// Always check permissions for the folder where library element resides
	if err := l.requirePermissionsOnFolder(user, fromFolderID); err != nil {
		return err
	}

	elementToPatch.FolderID = toFolderID

	return nil
}

// patchLibraryElement updates a Library Element.
func (l *libraryElementServiceImpl) patchLibraryElement(c *models.ReqContext, cmd patchLibraryElementCommand, uid string) (LibraryElementDTO, error) {
	var dto LibraryElementDTO
	if err := l.requireSupportedElementKind(cmd.Kind); err != nil {
		return LibraryElementDTO{}, err
	}
	err := l.SQLStore.WithTransactionalDbSession(c.Context.Req.Context(), func(session *sqlstore.DBSession) error {
		elementInDB, err := getLibraryElement(session, uid, c.SignedInUser.OrgId)
		if err != nil {
			return err
		}
		if elementInDB.Version != cmd.Version {
			return errLibraryElementVersionMismatch
		}

		var libraryElement = LibraryElement{
			ID:          elementInDB.ID,
			OrgID:       c.SignedInUser.OrgId,
			FolderID:    cmd.FolderID,
			UID:         uid,
			Name:        cmd.Name,
			Kind:        elementInDB.Kind,
			Type:        elementInDB.Type,
			Description: elementInDB.Description,
			Model:       cmd.Model,
			Version:     elementInDB.Version + 1,
			Created:     elementInDB.Created,
			CreatedBy:   elementInDB.CreatedBy,
			Updated:     time.Now(),
			UpdatedBy:   c.SignedInUser.UserId,
		}

		if cmd.Name == "" {
			libraryElement.Name = elementInDB.Name
		}
		if cmd.Model == nil {
			libraryElement.Model = elementInDB.Model
		}
		if err := l.handleFolderIDPatches(&libraryElement, elementInDB.FolderID, cmd.FolderID, c.SignedInUser); err != nil {
			return err
		}
		if err := syncFieldsWithModel(&libraryElement); err != nil {
			return err
		}
		if rowsAffected, err := session.ID(elementInDB.ID).Update(&libraryElement); err != nil {
			if l.SQLStore.Dialect.IsUniqueConstraintViolation(err) {
				return errLibraryElementAlreadyExists
			}
			return err
		} else if rowsAffected != 1 {
			return errLibraryElementNotFound
		}

		dto = LibraryElementDTO{
			ID:          libraryElement.ID,
			OrgID:       libraryElement.OrgID,
			FolderID:    libraryElement.FolderID,
			UID:         libraryElement.UID,
			Name:        libraryElement.Name,
			Kind:        libraryElement.Kind,
			Type:        libraryElement.Type,
			Description: libraryElement.Description,
			Model:       libraryElement.Model,
			Version:     libraryElement.Version,
			Meta: LibraryElementDTOMeta{
				Connections: elementInDB.Connections,
				Created:     libraryElement.Created,
				Updated:     libraryElement.Updated,
				CreatedBy: LibraryElementDTOMetaUser{
					ID:        elementInDB.CreatedBy,
					Name:      elementInDB.CreatedByName,
					AvatarURL: dtos.GetGravatarUrl(elementInDB.CreatedByEmail),
				},
				UpdatedBy: LibraryElementDTOMetaUser{
					ID:        libraryElement.UpdatedBy,
					Name:      c.SignedInUser.Login,
					AvatarURL: dtos.GetGravatarUrl(c.SignedInUser.Email),
				},
			},
		}

		return nil
	})

	return dto, err
}

// getConnections gets all connections for a Library Element.
func (l *libraryElementServiceImpl) getConnections(c *models.ReqContext, uid string) ([]LibraryElementConnectionDTO, error) {
	connections := make([]LibraryElementConnectionDTO, 0)
	err := l.SQLStore.WithDbSession(c.Context.Req.Context(), func(session *sqlstore.DBSession) error {
		element, err := getLibraryElement(session, uid, c.SignedInUser.OrgId)
		if err != nil {
			return err
		}
		var libraryElementConnections []libraryElementConnectionWithMeta
		builder := sqlstore.SQLBuilder{}
		builder.Write("SELECT lec.*, u1.login AS created_by_name, u1.email AS created_by_email")
		builder.Write(" FROM " + connectionTableName + " AS lec")
		builder.Write(" LEFT JOIN user AS u1 ON lec.created_by = u1.id")
		builder.Write(" INNER JOIN dashboard AS dashboard on lec.connection_id = dashboard.id")
		builder.Write(` WHERE lec.library_element_id=?`, element.ID)
		if c.SignedInUser.OrgRole != models.ROLE_ADMIN {
			builder.WriteDashboardPermissionFilter(c.SignedInUser, models.PERMISSION_VIEW)
		}
		if err := session.SQL(builder.GetSQLString(), builder.GetParams()...).Find(&libraryElementConnections); err != nil {
			return err
		}

		for _, connection := range libraryElementConnections {
			connections = append(connections, LibraryElementConnectionDTO{
				ID:           connection.ID,
				Kind:         connection.ConnectionKind,
				ElementID:    connection.LibraryElementID,
				ConnectionID: connection.ConnectionID,
				Created:      connection.Created,
				CreatedBy: LibraryElementDTOMetaUser{
					ID:        connection.CreatedBy,
					Name:      connection.CreatedByName,
					AvatarURL: dtos.GetGravatarUrl(connection.CreatedByEmail),
				},
			})
		}

		return nil
	})

	return connections, err
}

//getElementsForDashboardID gets all elements for a specific dashboard
func (l *libraryElementServiceImpl) getElementsForDashboardID(c *models.ReqContext, dashboardID int64) (map[string]LibraryElementDTO, error) {
	libraryElementMap := make(map[string]LibraryElementDTO)
	err := l.SQLStore.WithDbSession(c.Context.Req.Context(), func(session *sqlstore.DBSession) error {
		var libraryElements []LibraryElementWithMeta
		sql := selectLibraryElementDTOWithMeta +
			", coalesce(dashboard.title, 'General') AS folder_name" +
			", coalesce(dashboard.uid, '') AS folder_uid" +
			fromLibraryElementDTOWithMeta +
			" LEFT JOIN dashboard AS dashboard ON dashboard.id = le.folder_id" +
			" INNER JOIN " + connectionTableName + " AS lce ON lce.library_element_id = le.id AND lce.connection_kind=1 AND lce.connection_id=?"
		sess := session.SQL(sql, dashboardID)
		err := sess.Find(&libraryElements)
		if err != nil {
			return err
		}

		for _, element := range libraryElements {
			libraryElementMap[element.UID] = LibraryElementDTO{
				ID:          element.ID,
				OrgID:       element.OrgID,
				FolderID:    element.FolderID,
				UID:         element.UID,
				Name:        element.Name,
				Kind:        element.Kind,
				Type:        element.Type,
				Description: element.Description,
				Model:       element.Model,
				Version:     element.Version,
				Meta: LibraryElementDTOMeta{
					FolderName:  element.FolderName,
					FolderUID:   element.FolderUID,
					Connections: element.Connections,
					Created:     element.Created,
					Updated:     element.Updated,
					CreatedBy: LibraryElementDTOMetaUser{
						ID:        element.CreatedBy,
						Name:      element.CreatedByName,
						AvatarURL: dtos.GetGravatarUrl(element.CreatedByEmail),
					},
					UpdatedBy: LibraryElementDTOMetaUser{
						ID:        element.UpdatedBy,
						Name:      element.UpdatedByName,
						AvatarURL: dtos.GetGravatarUrl(element.UpdatedByEmail),
					},
				},
			}
		}

		return nil
	})

	return libraryElementMap, err
}

// connectElementsToDashboardID adds connections for all elements Library Elements in a Dashboard.
func (l *libraryElementServiceImpl) connectElementsToDashboardID(c *models.ReqContext, elementUIDs []string, dashboardID int64) error {
	err := l.SQLStore.WithTransactionalDbSession(c.Context.Req.Context(), func(session *sqlstore.DBSession) error {
		_, err := session.Exec("DELETE FROM "+connectionTableName+" WHERE connection_kind=1 AND connection_id=?", dashboardID)
		if err != nil {
			return err
		}
		for _, elementUID := range elementUIDs {
			element, err := getLibraryElement(session, elementUID, c.SignedInUser.OrgId)
			if err != nil {
				return err
			}
			if err := l.requirePermissionsOnFolder(c.SignedInUser, element.FolderID); err != nil {
				return err
			}

			connection := libraryElementConnection{
				LibraryElementID: element.ID,
				ConnectionKind:   1,
				ConnectionID:     dashboardID,
				Created:          time.Now(),
				CreatedBy:        c.SignedInUser.UserId,
			}
			if _, err := session.Insert(&connection); err != nil {
				if l.SQLStore.Dialect.IsUniqueConstraintViolation(err) {
					return nil
				}
				return err
			}
		}
		return nil
	})

	return err
}

// disconnectElementsFromDashboardID deletes connections for all Library Elements in a Dashboard.
func (l *libraryElementServiceImpl) disconnectElementsFromDashboardID(c *models.ReqContext, dashboardID int64) error {
	return l.SQLStore.WithTransactionalDbSession(c.Context.Req.Context(), func(session *sqlstore.DBSession) error {
		_, err := session.Exec("DELETE FROM "+connectionTableName+" WHERE connection_kind=1 AND connection_id=?", dashboardID)
		if err != nil {
			return err
		}
		return nil
	})
}

// deleteLibraryElementsInFolderUID deletes all Library Elements in a folder.
func (l *libraryElementServiceImpl) deleteLibraryElementsInFolderUID(c *models.ReqContext, folderUID string) error {
	return l.SQLStore.WithTransactionalDbSession(c.Context.Req.Context(), func(session *sqlstore.DBSession) error {
		var folderUIDs []struct {
			ID int64 `xorm:"id"`
		}
		err := session.SQL("SELECT id from dashboard WHERE uid=? AND org_id=? AND is_folder=1", folderUID, c.SignedInUser.OrgId).Find(&folderUIDs)
		if err != nil {
			return err
		}
		if len(folderUIDs) != 1 {
			return fmt.Errorf("found %d folders, while expecting at most one", len(folderUIDs))
		}
		folderID := folderUIDs[0].ID

		if err := l.requirePermissionsOnFolder(c.SignedInUser, folderID); err != nil {
			return err
		}
		var connectionIDs []struct {
			ConnectionID int64 `xorm:"connection_id"`
		}
		sql := "SELECT lec.connection_id FROM library_element AS le"
		sql += " INNER JOIN " + connectionTableName + " AS lec on le.id = lec.library_element_id"
		sql += " WHERE le.folder_id=? AND le.org_id=?"
		err = session.SQL(sql, folderID, c.SignedInUser.OrgId).Find(&connectionIDs)
		if err != nil {
			return err
		}
		if len(connectionIDs) > 0 {
			return ErrFolderHasConnectedLibraryElements
		}

		var elementIDs []struct {
			ID int64 `xorm:"id"`
		}
		err = session.SQL("SELECT id from library_element WHERE folder_id=? AND org_id=?", folderID, c.SignedInUser.OrgId).Find(&elementIDs)
		if err != nil {
			return err
		}
		for _, elementID := range elementIDs {
			_, err := session.Exec("DELETE FROM "+connectionTableName+" WHERE library_element_id=?", elementID.ID)
			if err != nil {
				return err
			}
		}
		if _, err := session.Exec("DELETE FROM library_element WHERE folder_id=? AND org_id=?", folderID, c.SignedInUser.OrgId); err != nil {
			return err
		}

		return nil
	})
}
