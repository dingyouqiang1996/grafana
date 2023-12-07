package sqlstash

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"
	"strings"
	"time"

	"xorm.io/xorm"

	"github.com/bwmarrin/snowflake"
	"github.com/google/uuid"
	"github.com/grafana/grafana/pkg/infra/appcontext"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/services/sqlstore/migrator"
	"github.com/grafana/grafana/pkg/services/sqlstore/session"
	"github.com/grafana/grafana/pkg/services/store"
	"github.com/grafana/grafana/pkg/services/store/entity"
	"github.com/grafana/grafana/pkg/setting"
)

type EntityDB interface {
	Init() error
	GetSession() (*session.SessionDB, error)
	GetEngine() (*xorm.Engine, error)
	GetCfg() *setting.Cfg
}

// Make sure we implement both store + admin
var _ entity.EntityStoreServer = &sqlEntityServer{}

func ProvideSQLEntityServer(db EntityDB /*, cfg *setting.Cfg */) (entity.EntityStoreServer, error) {
	snode, err := snowflake.NewNode(rand.Int63n(1024))
	if err != nil {
		return nil, err
	}

	entityServer := &sqlEntityServer{
		db:        db,
		log:       log.New("sql-entity-server"),
		snowflake: snode,
	}

	return entityServer, nil
}

type sqlEntityServer struct {
	log       log.Logger
	db        EntityDB // needed to keep xorm engine in scope
	sess      *session.SessionDB
	dialect   migrator.Dialect
	snowflake *snowflake.Node
}

func (s *sqlEntityServer) Init() error {
	if s.sess != nil {
		return nil
	}

	if s.db == nil {
		return errors.New("missing db")
	}

	err := s.db.Init()
	if err != nil {
		return err
	}

	sess, err := s.db.GetSession()
	if err != nil {
		return err
	}

	engine, err := s.db.GetEngine()
	if err != nil {
		return err
	}

	s.sess = sess
	s.dialect = migrator.NewDialect(engine.DriverName())
	return nil
}

func (s *sqlEntityServer) getReadFields(r *entity.ReadEntityRequest) []string {
	fields := []string{
		"guid",
		"key",
		"namespace", "group", "group_version", "resource", "uid", "folder",
		"version", "size", "etag", "errors", // errors are always returned
		"created_at", "created_by",
		"updated_at", "updated_by",
		"origin", "origin_key", "origin_ts"}

	if r.WithBody {
		fields = append(fields, `body`)
	}
	if r.WithMeta {
		fields = append(fields, `meta`)
	}
	if r.WithSummary {
		fields = append(fields, "name", "slug", "description", "labels", "fields")
	}
	if r.WithStatus {
		fields = append(fields, "status")
	}
	return fields
}

func (s *sqlEntityServer) getReadSelect(r *entity.ReadEntityRequest) (string, error) {
	if err := s.Init(); err != nil {
		return "", err
	}

	fields := s.getReadFields(r)

	quotedFields := make([]string, len(fields))
	for i, f := range fields {
		quotedFields[i] = s.dialect.Quote(f)
	}
	return "SELECT " + strings.Join(quotedFields, ","), nil
}

func (s *sqlEntityServer) rowToReadEntityResponse(ctx context.Context, rows *sql.Rows, r *entity.ReadEntityRequest) (*entity.Entity, error) {
	raw := &entity.Entity{
		Origin: &entity.EntityOriginInfo{},
	}

	errors := ""
	labels := ""
	fields := ""

	args := []any{
		&raw.Guid,
		&raw.Key,
		&raw.Namespace, &raw.Group, &raw.GroupVersion, &raw.Resource, &raw.Uid, &raw.Folder,
		&raw.Version, &raw.Size, &raw.ETag, &errors,
		&raw.CreatedAt, &raw.CreatedBy,
		&raw.UpdatedAt, &raw.UpdatedBy,
		&raw.Origin.Source, &raw.Origin.Key, &raw.Origin.Time,
	}
	if r.WithBody {
		args = append(args, &raw.Body)
	}
	if r.WithMeta {
		args = append(args, &raw.Meta)
	}
	if r.WithSummary {
		args = append(args, &raw.Name, &raw.Slug, &raw.Description, &labels, &fields)
	}
	if r.WithStatus {
		args = append(args, &raw.Status)
	}

	err := rows.Scan(args...)
	if err != nil {
		return nil, err
	}

	if raw.Origin.Source == "" {
		raw.Origin = nil
	}

	// unmarshal json labels
	if labels != "" {
		if err := json.Unmarshal([]byte(labels), &raw.Labels); err != nil {
			return nil, err
		}
	}

	return raw, nil
}

func (s *sqlEntityServer) Read(ctx context.Context, r *entity.ReadEntityRequest) (*entity.Entity, error) {
	if err := s.Init(); err != nil {
		return nil, err
	}

	return s.read(ctx, s.sess, r)
}

func (s *sqlEntityServer) read(ctx context.Context, tx session.SessionQuerier, r *entity.ReadEntityRequest) (*entity.Entity, error) {
	table := "entity"
	where := []string{}
	args := []any{}

	if r.Key == "" {
		return nil, fmt.Errorf("missing key")
	}

	key, err := entity.ParseKey(r.Key)
	if err != nil {
		return nil, err
	}

	where = append(where, s.dialect.Quote("namespace")+"=?", s.dialect.Quote("group")+"=?", s.dialect.Quote("resource")+"=?", s.dialect.Quote("uid")+"=?")
	args = append(args, key.Namespace, key.Group, key.Resource, key.Name)

	if r.Version != "" {
		table = "entity_history"
		where = append(where, s.dialect.Quote("version")+"=?")
		args = append(args, r.Version)
	}

	query, err := s.getReadSelect(r)
	if err != nil {
		return nil, err
	}

	if false { // TODO, MYSQL/PosgreSQL can lock the row " FOR UPDATE"
		query += " FOR UPDATE"
	}

	query += " FROM " + table +
		" WHERE " + strings.Join(where, " AND ")

	s.log.Debug("read", "query", query, "args", args)

	rows, err := tx.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()

	if !rows.Next() {
		return &entity.Entity{}, nil
	}

	return s.rowToReadEntityResponse(ctx, rows, r)
}

func (s *sqlEntityServer) BatchRead(ctx context.Context, b *entity.BatchReadEntityRequest) (*entity.BatchReadEntityResponse, error) {
	if len(b.Batch) < 1 {
		return nil, fmt.Errorf("missing querires")
	}

	first := b.Batch[0]
	args := []any{}
	constraints := []string{}

	for _, r := range b.Batch {
		if r.WithBody != first.WithBody || r.WithSummary != first.WithSummary {
			return nil, fmt.Errorf("requests must want the same things")
		}

		if r.Key == "" {
			return nil, fmt.Errorf("missing key")
		}

		constraints = append(constraints, s.dialect.Quote("key")+"=?")
		args = append(args, r.Key)

		if r.Version != "" {
			return nil, fmt.Errorf("version not supported for batch read (yet?)")
		}
	}

	req := b.Batch[0]
	query, err := s.getReadSelect(req)
	if err != nil {
		return nil, err
	}

	query += " FROM entity" +
		" WHERE (" + strings.Join(constraints, " OR ") + ")"
	rows, err := s.sess.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()

	// TODO? make sure the results are in order?
	rsp := &entity.BatchReadEntityResponse{}
	for rows.Next() {
		r, err := s.rowToReadEntityResponse(ctx, rows, req)
		if err != nil {
			return nil, err
		}
		rsp.Results = append(rsp.Results, r)
	}
	return rsp, nil
}

func (s *sqlEntityServer) Create(ctx context.Context, r *entity.CreateEntityRequest) (*entity.CreateEntityResponse, error) {
	if err := s.Init(); err != nil {
		return nil, err
	}

	createdAt := r.Entity.CreatedAt
	createdBy := r.Entity.CreatedBy
	if createdBy == "" {
		modifier, err := appcontext.User(ctx)
		if err != nil {
			return nil, err
		}
		if modifier == nil {
			return nil, fmt.Errorf("can not find user in context")
		}
		createdBy = store.GetUserIDString(modifier)
	}
	updatedAt := r.Entity.UpdatedAt
	updatedBy := r.Entity.UpdatedBy

	rsp := &entity.CreateEntityResponse{
		Entity: &entity.Entity{},
		Status: entity.CreateEntityResponse_CREATED, // Will be changed if not true
	}

	err := s.sess.WithTransaction(ctx, func(tx *session.SessionTx) error {
		current, err := s.read(ctx, tx, &entity.ReadEntityRequest{
			Key:         r.Entity.Key,
			WithMeta:    true,
			WithBody:    true,
			WithStatus:  true,
			WithSummary: true,
		})
		if err != nil {
			return err
		}

		// if we found an existing entity
		if current.Guid != "" {
			return fmt.Errorf("entity already exists")
		}

		// generate guid for new entity
		current.Guid = uuid.New().String()

		// parse provided key
		key, err := entity.ParseKey(r.Entity.Key)
		if err != nil {
			return err
		}

		current.Key = r.Entity.Key
		current.Namespace = key.Namespace
		current.Group = key.Group
		current.GroupVersion = r.Entity.GroupVersion
		current.Resource = key.Resource
		current.Uid = key.Name

		if r.Entity.Folder != "" {
			current.Folder = r.Entity.Folder
		}
		if r.Entity.Slug != "" {
			current.Slug = r.Entity.Slug
		}

		if r.Entity.Body != nil {
			current.Body = r.Entity.Body
			current.Size = int64(len(current.Body))
		}

		if r.Entity.Meta != nil {
			current.Meta = r.Entity.Meta
		}

		if r.Entity.Status != nil {
			current.Status = r.Entity.Status
		}

		etag := createContentsHash(current.Body, current.Meta, current.Status)
		current.ETag = etag
		current.UpdatedAt = updatedAt
		current.UpdatedBy = updatedBy

		if r.Entity.Name != "" {
			current.Name = r.Entity.Name
		}
		if r.Entity.Description != "" {
			current.Description = r.Entity.Description
		}

		labels, err := json.Marshal(r.Entity.Labels)
		if err != nil {
			s.log.Error("error marshalling labels", "msg", err.Error())
			return err
		}

		fields, err := json.Marshal(r.Entity.Fields)
		if err != nil {
			s.log.Error("error marshalling fields", "msg", err.Error())
			return err
		}

		errors, err := json.Marshal(r.Entity.Errors)
		if err != nil {
			s.log.Error("error marshalling errors", "msg", err.Error())
			return err
		}

		if current.Origin == nil {
			current.Origin = &entity.EntityOriginInfo{}
		}

		if r.Entity.Origin != nil {
			if r.Entity.Origin.Source != "" {
				current.Origin.Source = r.Entity.Origin.Source
			}
			if r.Entity.Origin.Key != "" {
				current.Origin.Key = r.Entity.Origin.Key
			}
			if r.Entity.Origin.Time > 0 {
				current.Origin.Time = r.Entity.Origin.Time
			}
		}

		// Set the comment on this write
		if r.Entity.Message != "" {
			current.Message = r.Entity.Message
		}

		// Update version
		current.Version = s.snowflake.Generate().String()

		values := map[string]any{
			"guid":          current.Guid,
			"key":           current.Key,
			"namespace":     current.Namespace,
			"group":         current.Group,
			"resource":      current.Resource,
			"uid":           current.Uid,
			"created_at":    createdAt,
			"created_by":    createdBy,
			"group_version": current.GroupVersion,
			"folder":        current.Folder,
			"slug":          current.Slug,
			"updated_at":    updatedAt,
			"updated_by":    updatedBy,
			"body":          current.Body,
			"meta":          current.Meta,
			"status":        current.Status,
			"size":          current.Size,
			"etag":          current.ETag,
			"version":       current.Version,
			"name":          current.Name,
			"description":   current.Description,
			"labels":        labels,
			"fields":        fields,
			"errors":        errors,
			"origin":        current.Origin.Source,
			"origin_key":    current.Origin.Key,
			"origin_ts":     current.Origin.Time,
			"message":       current.Message,
		}

		// 1. Add row to the `entity_history` values
		query, args, err := s.dialect.InsertQuery("entity_history", values)
		if err != nil {
			s.log.Error("error building entity history insert", "msg", err.Error())
			return err
		}

		s.log.Debug("create", "query", query, "args", args)

		_, err = tx.Exec(ctx, query, args...)
		if err != nil {
			s.log.Error("error writing entity history", "msg", err.Error())
			return err
		}

		// 2. Add row to the main `entity` table
		query, args, err = s.dialect.InsertQuery("entity", values)
		if err != nil {
			s.log.Error("error building entity insert sql", "msg", err.Error())
			return err
		}

		s.log.Debug("create", "query", query, "args", args)

		_, err = tx.Exec(ctx, query, args...)
		if err != nil {
			s.log.Error("error inserting entity", "msg", err.Error())
			return err
		}

		switch current.Group {
		case entity.FolderGroupName:
			switch current.Resource {
			case entity.FolderResourceName:
				err = updateFolderTree(ctx, tx, current.Namespace)
				if err != nil {
					s.log.Error("error updating folder tree", "msg", err.Error())
					return err
				}
			}
		}

		rsp.Entity = current

		return nil // s.writeSearchInfo(ctx, tx, current)
	})
	if err != nil {
		s.log.Error("error creating entity", "msg", err.Error())
		rsp.Status = entity.CreateEntityResponse_ERROR
	}

	return rsp, err
}

//nolint:gocyclo
func (s *sqlEntityServer) Update(ctx context.Context, r *entity.UpdateEntityRequest) (*entity.UpdateEntityResponse, error) {
	if err := s.Init(); err != nil {
		return nil, err
	}

	timestamp := time.Now().UnixMilli()
	updatedAt := r.Entity.UpdatedAt
	updatedBy := r.Entity.UpdatedBy
	if updatedBy == "" {
		modifier, err := appcontext.User(ctx)
		if err != nil {
			return nil, err
		}
		if modifier == nil {
			return nil, fmt.Errorf("can not find user in context")
		}
		updatedBy = store.GetUserIDString(modifier)
	}
	if updatedAt < 1000 {
		updatedAt = timestamp
	}

	rsp := &entity.UpdateEntityResponse{
		Entity: &entity.Entity{},
		Status: entity.UpdateEntityResponse_UPDATED, // Will be changed if not true
	}

	err := s.sess.WithTransaction(ctx, func(tx *session.SessionTx) error {
		current, err := s.read(ctx, tx, &entity.ReadEntityRequest{
			Key:         r.Entity.Key,
			WithMeta:    true,
			WithBody:    true,
			WithStatus:  true,
			WithSummary: true,
		})
		if err != nil {
			return err
		}

		// Optimistic locking
		if r.PreviousVersion != "" && r.PreviousVersion != current.Version {
			return fmt.Errorf("optimistic lock failed")
		}

		// if we didn't find an existing entity
		if current.Guid == "" {
			return fmt.Errorf("entity not found")
		}

		rsp.Entity.Guid = current.Guid

		// Clear the labels+refs
		if _, err := tx.Exec(ctx, "DELETE FROM entity_labels WHERE guid=?", rsp.Entity.Guid); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, "DELETE FROM entity_ref WHERE guid=?", rsp.Entity.Guid); err != nil {
			return err
		}

		if r.Entity.GroupVersion != "" {
			current.GroupVersion = r.Entity.GroupVersion
		}

		if r.Entity.Folder != "" {
			current.Folder = r.Entity.Folder
		}
		if r.Entity.Slug != "" {
			current.Slug = r.Entity.Slug
		}

		if r.Entity.Body != nil {
			current.Body = r.Entity.Body
			current.Size = int64(len(current.Body))
		}

		if r.Entity.Meta != nil {
			current.Meta = r.Entity.Meta
		}

		if r.Entity.Status != nil {
			current.Status = r.Entity.Status
		}

		etag := createContentsHash(current.Body, current.Meta, current.Status)
		current.ETag = etag
		current.UpdatedAt = updatedAt
		current.UpdatedBy = updatedBy

		if r.Entity.Name != "" {
			current.Name = r.Entity.Name
		}
		if r.Entity.Description != "" {
			current.Description = r.Entity.Description
		}

		labels, err := json.Marshal(r.Entity.Labels)
		if err != nil {
			s.log.Error("error marshalling labels", "msg", err.Error())
			return err
		}

		fields, err := json.Marshal(r.Entity.Fields)
		if err != nil {
			s.log.Error("error marshalling fields", "msg", err.Error())
			return err
		}

		errors, err := json.Marshal(r.Entity.Errors)
		if err != nil {
			s.log.Error("error marshalling errors", "msg", err.Error())
			return err
		}

		if current.Origin == nil {
			current.Origin = &entity.EntityOriginInfo{}
		}

		if r.Entity.Origin != nil {
			if r.Entity.Origin.Source != "" {
				current.Origin.Source = r.Entity.Origin.Source
			}
			if r.Entity.Origin.Key != "" {
				current.Origin.Key = r.Entity.Origin.Key
			}
			if r.Entity.Origin.Time > 0 {
				current.Origin.Time = r.Entity.Origin.Time
			}
		}

		// Set the comment on this write
		if r.Entity.Message != "" {
			current.Message = r.Entity.Message
		}

		// Update version
		current.Version = s.snowflake.Generate().String()

		values := map[string]any{
			// below are only set in history table
			"guid":       current.Guid,
			"key":        current.Key,
			"namespace":  current.Namespace,
			"group":      current.Group,
			"resource":   current.Resource,
			"uid":        current.Uid,
			"created_at": current.CreatedAt,
			"created_by": current.CreatedBy,
			// below are updated
			"group_version": current.GroupVersion,
			"folder":        current.Folder,
			"slug":          current.Slug,
			"updated_at":    updatedAt,
			"updated_by":    updatedBy,
			"body":          current.Body,
			"meta":          current.Meta,
			"status":        current.Status,
			"size":          current.Size,
			"etag":          current.ETag,
			"version":       current.Version,
			"name":          current.Name,
			"description":   current.Description,
			"labels":        labels,
			"fields":        fields,
			"errors":        errors,
			"origin":        current.Origin.Source,
			"origin_key":    current.Origin.Key,
			"origin_ts":     current.Origin.Time,
			"message":       current.Message,
		}

		// 1. Add the `entity_history` values
		query, args, err := s.dialect.InsertQuery("entity_history", values)
		if err != nil {
			s.log.Error("error building entity history insert", "msg", err.Error())
			return err
		}

		_, err = tx.Exec(ctx, query, args...)
		if err != nil {
			s.log.Error("error writing entity history", "msg", err.Error())
			return err
		}

		// 2. update the main `entity` table

		// remove values that are only set at insert
		delete(values, "guid")
		delete(values, "key")
		delete(values, "namespace")
		delete(values, "group")
		delete(values, "resource")
		delete(values, "uid")
		delete(values, "created_at")
		delete(values, "created_by")

		query, args, err = s.dialect.UpdateQuery(
			"entity",
			values,
			map[string]any{
				"guid": current.Guid,
			},
		)
		if err != nil {
			s.log.Error("error building entity update sql", "msg", err.Error())
			return err
		}

		_, err = tx.Exec(ctx, query, args...)
		if err != nil {
			s.log.Error("error updating entity", "msg", err.Error())
			return err
		}

		switch current.Group {
		case entity.FolderGroupName:
			switch current.Resource {
			case entity.FolderResourceName:
				err = updateFolderTree(ctx, tx, current.Namespace)
				if err != nil {
					s.log.Error("error updating folder tree", "msg", err.Error())
					return err
				}
			}
		}

		rsp.Entity = current

		return nil // s.writeSearchInfo(ctx, tx, current)
	})
	if err != nil {
		s.log.Error("error updating entity", "msg", err.Error())
		rsp.Status = entity.UpdateEntityResponse_ERROR
	}

	return rsp, err
}

/*
func (s *sqlEntityServer) writeSearchInfo(
	ctx context.Context,
	tx *session.SessionTx,
	current *entity.Entity,
) error {
	// parent_key := current.getParentKey()

	// Add the labels rows
	for k, v := range current.Labels {
		query, args, err := s.dialect.InsertQuery(
			"entity_labels",
			map[string]any{
				"key":   current.Key,
				"label": k,
				"value": v,
				// "parent_key": parent_key,
			},
		)
		if err != nil {
			return err
		}

		_, err = tx.Exec(ctx, query, args...)
		if err != nil {
			return err
		}
	}

	return nil
}
*/

func (s *sqlEntityServer) Delete(ctx context.Context, r *entity.DeleteEntityRequest) (*entity.DeleteEntityResponse, error) {
	if err := s.Init(); err != nil {
		return nil, err
	}

	rsp := &entity.DeleteEntityResponse{}

	err := s.sess.WithTransaction(ctx, func(tx *session.SessionTx) error {
		var err error
		rsp.Entity, err = s.Read(ctx, &entity.ReadEntityRequest{
			Key:         r.Key,
			WithBody:    true,
			WithMeta:    true,
			WithStatus:  true,
			WithSummary: true,
		})
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				rsp.Status = entity.DeleteEntityResponse_NOTFOUND
			} else {
				rsp.Status = entity.DeleteEntityResponse_ERROR
			}
			return err
		}

		if r.PreviousVersion != "" && r.PreviousVersion != rsp.Entity.Version {
			rsp.Status = entity.DeleteEntityResponse_ERROR
			return fmt.Errorf("optimistic lock failed")
		}

		err = s.doDelete(ctx, tx, rsp.Entity)
		if err != nil {
			rsp.Status = entity.DeleteEntityResponse_ERROR
			return err
		}

		rsp.Status = entity.DeleteEntityResponse_DELETED
		return nil
	})

	return rsp, err
}

func (s *sqlEntityServer) doDelete(ctx context.Context, tx *session.SessionTx, ent *entity.Entity) error {
	_, err := tx.Exec(ctx, "DELETE FROM entity WHERE guid=?", ent.Guid)
	if err != nil {
		return err
	}

	// TODO: keep history? would need current version bump, and the "write" would have to get from history
	_, err = tx.Exec(ctx, "DELETE FROM entity_history WHERE guid=?", ent.Guid)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, "DELETE FROM entity_labels WHERE guid=?", ent.Guid)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, "DELETE FROM entity_ref WHERE guid=?", ent.Guid)
	if err != nil {
		return err
	}

	switch ent.Group {
	case entity.FolderGroupName:
		switch ent.Resource {
		case entity.FolderResourceName:
			err = updateFolderTree(ctx, tx, ent.Namespace)
			if err != nil {
				s.log.Error("error updating folder tree", "msg", err.Error())
				return err
			}
		}
	}

	return nil
}

func (s *sqlEntityServer) History(ctx context.Context, r *entity.EntityHistoryRequest) (*entity.EntityHistoryResponse, error) {
	if err := s.Init(); err != nil {
		return nil, err
	}

	var limit int64 = 100
	if r.Limit > 0 && r.Limit < 100 {
		limit = r.Limit
	}

	rr := &entity.ReadEntityRequest{
		Key:         r.Key,
		WithMeta:    true,
		WithBody:    false,
		WithStatus:  true,
		WithSummary: true,
	}

	query, err := s.getReadSelect(rr)
	if err != nil {
		return nil, err
	}

	query += " FROM entity_history" +
		" WHERE " + s.dialect.Quote("key") + "=?"
	args := []any{
		r.Key,
	}

	if r.NextPageToken != "" {
		query += " AND version <= ?"
		args = append(args, r.NextPageToken)
	}

	query += " ORDER BY version DESC" +
		// select 1 more than we need to see if there is a next page
		" LIMIT " + fmt.Sprint(limit+1)

	rows, err := s.sess.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()

	rsp := &entity.EntityHistoryResponse{
		Key: r.Key,
	}
	for rows.Next() {
		v, err := s.rowToReadEntityResponse(ctx, rows, rr)
		if err != nil {
			return nil, err
		}

		// found more than requested
		if int64(len(rsp.Versions)) >= limit {
			rsp.NextPageToken = v.Version
			break
		}

		rsp.Versions = append(rsp.Versions, v)
	}
	return rsp, err
}

func (s *sqlEntityServer) List(ctx context.Context, r *entity.EntityListRequest) (*entity.EntityListResponse, error) {
	if err := s.Init(); err != nil {
		return nil, err
	}

	user, err := appcontext.User(ctx)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, fmt.Errorf("missing user in context")
	}

	if r.NextPageToken != "" || len(r.Sort) > 0 {
		return nil, fmt.Errorf("not yet supported")
	}

	fields := []string{
		"guid", "guid", "key",
		"namespace", "group", "group_version", "resource", "uid",
		"version", "folder", "slug", "errors", // errors are always returned
		"size", "updated_at", "updated_by",
		"name", "description", // basic summary
	}

	if r.WithBody {
		fields = append(fields, "body", "meta", "status")
	}

	if r.WithLabels {
		fields = append(fields, "labels")
	}

	if r.WithFields {
		fields = append(fields, "fields")
	}

	entityQuery := selectQuery{
		dialect:  s.dialect,
		fields:   fields,
		from:     "entity", // the table
		args:     []any{},
		limit:    r.Limit,
		oneExtra: true, // request one more than the limit (and show next token if it exists)
	}
	// TODO fix this
	// entityQuery.addWhere("namespace", user.OrgID)

	if len(r.Resource) > 0 {
		entityQuery.addWhereIn("resource", r.Resource)
	}

	if len(r.Key) > 0 {
		where := []string{}
		args := []any{}
		for _, k := range r.Key {
			args = append(args, k+"/%")
			where = append(where, s.dialect.Quote("key")+" LIKE ?")
		}

		entityQuery.addWhere("("+strings.Join(where, " OR ")+")", args...)
	}

	// Folder guid
	if r.Folder != "" {
		entityQuery.addWhere("folder", r.Folder)
	}

	if r.NextPageToken != "" {
		entityQuery.addWhere("guid>?", r.NextPageToken)
	}

	if len(r.Labels) > 0 {
		var args []any
		var conditions []string
		for labelKey, labelValue := range r.Labels {
			args = append(args, labelKey)
			args = append(args, labelValue)
			conditions = append(conditions, "(label = ? AND value = ?)")
		}
		query := "SELECT guid FROM entity_labels" +
			" WHERE (" + strings.Join(conditions, " OR ") + ")" +
			" GROUP BY guid" +
			" HAVING COUNT(label) = ?"
		args = append(args, len(r.Labels))

		entityQuery.addWhereInSubquery("guid", query, args)
	}

	query, args := entityQuery.toQuery()

	s.log.Debug("listing", "query", query, "args", args)

	rows, err := s.sess.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()
	token := ""
	rsp := &entity.EntityListResponse{}
	for rows.Next() {
		result := &entity.Entity{}

		var labels []byte
		var errors []byte
		var fields []byte

		args := []any{
			&token, &result.Guid, &result.Key,
			&result.Namespace, &result.Group, &result.GroupVersion, &result.Resource, &result.Uid,
			&result.Version, &result.Folder, &result.Slug, &errors,
			&result.Size, &result.UpdatedAt, &result.UpdatedBy,
			&result.Name, &result.Description,
		}
		if r.WithBody {
			args = append(args, &result.Body, &result.Meta, &result.Status)
		}
		if r.WithLabels {
			args = append(args, &labels)
		}
		if r.WithFields {
			args = append(args, &fields)
		}

		err = rows.Scan(args...)
		if err != nil {
			return rsp, err
		}

		// found more than requested
		if int64(len(rsp.Results)) >= entityQuery.limit {
			// TODO? this only works if we sort by guid
			rsp.NextPageToken = token
			break
		}

		if labels != nil {
			err = json.Unmarshal(labels, &result.Labels)
			if err != nil {
				return rsp, err
			}
		}

		if fields != nil {
			err = json.Unmarshal(fields, &result.Fields)
			if err != nil {
				return rsp, err
			}
		}

		rsp.Results = append(rsp.Results, result)
	}

	return rsp, err
}

func (s *sqlEntityServer) Watch(*entity.EntityWatchRequest, entity.EntityStore_WatchServer) error {
	if err := s.Init(); err != nil {
		return err
	}

	return fmt.Errorf("unimplemented")
}

func (s *sqlEntityServer) FindReferences(ctx context.Context, r *entity.ReferenceRequest) (*entity.EntityListResponse, error) {
	if err := s.Init(); err != nil {
		return nil, err
	}

	user, err := appcontext.User(ctx)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, fmt.Errorf("missing user in context")
	}

	if r.NextPageToken != "" {
		return nil, fmt.Errorf("not yet supported")
	}

	fields := []string{
		"guid", "guid",
		"namespace", "group", "group_version", "resource", "uid",
		"version", "folder", "slug", "errors", // errors are always returned
		"size", "updated_at", "updated_by",
		"name", "description", "meta",
	}

	// SELECT entity_ref.* FROM entity_ref
	// 	JOIN entity ON entity_ref.key = entity.key
	// 	WHERE family='librarypanel' AND resolved_to='a7975b7a-fb53-4ab7-951d-15810953b54f';

	sql := strings.Builder{}
	_, _ = sql.WriteString("SELECT ")
	for i, f := range fields {
		if i > 0 {
			_, _ = sql.WriteString(",")
		}
		_, _ = sql.WriteString(fmt.Sprintf("entity.%s", f))
	}
	_, _ = sql.WriteString(" FROM entity_ref JOIN entity ON entity_ref.key = entity.key")
	_, _ = sql.WriteString(" WHERE family=? AND resolved_to=?") // TODO tenant ID!!!!

	rows, err := s.sess.Query(ctx, sql.String(), r.Resource, r.Uid)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()
	token := ""
	rsp := &entity.EntityListResponse{}
	for rows.Next() {
		result := &entity.Entity{}

		args := []any{
			&token, &result.Guid,
			&result.Namespace, &result.Group, &result.GroupVersion, &result.Resource, &result.Uid,
			&result.Version, &result.Folder, &result.Slug, &result.Errors,
			&result.Size, &result.UpdatedAt, &result.UpdatedBy,
			&result.Name, &result.Description, &result.Meta,
		}

		err = rows.Scan(args...)
		if err != nil {
			return rsp, err
		}

		// // found one more than requested
		// if int64(len(rsp.Results)) >= entityQuery.limit {
		// 	// TODO? should this encode start+offset?
		// 	rsp.NextPageToken = token
		// 	break
		// }

		rsp.Results = append(rsp.Results, result)
	}

	return rsp, err
}
