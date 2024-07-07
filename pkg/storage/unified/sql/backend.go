package sql

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"text/template"
	"time"

	"github.com/google/uuid"
	"github.com/prometheus/client_golang/prometheus"
	"go.opentelemetry.io/otel/trace"
	"go.opentelemetry.io/otel/trace/noop"

	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/infra/tracing"
	"github.com/grafana/grafana/pkg/services/sqlstore/migrator"
	"github.com/grafana/grafana/pkg/services/sqlstore/session"
	"github.com/grafana/grafana/pkg/services/store/entity/sqlstash"
	"github.com/grafana/grafana/pkg/storage/unified/resource"
	"github.com/grafana/grafana/pkg/storage/unified/sql/db"
	"github.com/grafana/grafana/pkg/storage/unified/sql/sqltemplate"
)

const trace_prefix = "sql.resource."

// Package-level errors.
var (
	ErrNotImplementedYet = errors.New("not implemented yet (sqlnext)")
)

func ProvideSQLResourceServer(db db.ResourceDBInterface, tracer tracing.Tracer) (resource.ResourceServer, error) {
	ctx, cancel := context.WithCancel(context.Background())

	store := &backend{
		db:     db,
		log:    log.New("sql-resource-server"),
		ctx:    ctx,
		cancel: cancel,
		tracer: tracer,
	}

	if err := prometheus.Register(sqlstash.NewStorageMetrics()); err != nil {
		return nil, err
	}

	return resource.NewResourceServer(resource.ResourceServerOptions{
		Tracer:      tracer,
		Backend:     store,
		Diagnostics: store,
		Lifecycle:   store,
	})
}

type backendOptions struct {
	DB     db.ResourceDBInterface
	Tracer trace.Tracer
}

func NewBackendStore(opts backendOptions) (*backend, error) {
	ctx, cancel := context.WithCancel(context.Background())

	if opts.Tracer == nil {
		opts.Tracer = noop.NewTracerProvider().Tracer("sql-backend")
	}

	return &backend{
		db:     opts.DB,
		log:    log.New("sql-resource-server"),
		ctx:    ctx,
		cancel: cancel,
		tracer: opts.Tracer,
	}, nil
}

type backend struct {
	log     log.Logger
	db      db.ResourceDBInterface // needed to keep xorm engine in scope
	sess    *session.SessionDB
	dialect migrator.Dialect
	ctx     context.Context // TODO: remove
	cancel  context.CancelFunc
	tracer  trace.Tracer

	//stream chan *resource.WatchEvent

	sqlDB      db.DB
	sqlDialect sqltemplate.Dialect
}

func (b *backend) Init() error {
	if b.sess != nil {
		return nil
	}

	if b.db == nil {
		return errors.New("missing db")
	}

	err := b.db.Init()
	if err != nil {
		return err
	}

	sqlDB, err := b.db.GetDB()
	if err != nil {
		return err
	}
	b.sqlDB = sqlDB

	driverName := sqlDB.DriverName()
	driverName = strings.TrimSuffix(driverName, "WithHooks")
	switch driverName {
	case db.DriverMySQL:
		b.sqlDialect = sqltemplate.MySQL
	case db.DriverPostgres:
		b.sqlDialect = sqltemplate.PostgreSQL
	case db.DriverSQLite, db.DriverSQLite3:
		b.sqlDialect = sqltemplate.SQLite
	default:
		return fmt.Errorf("no dialect for driver %q", driverName)
	}

	sess, err := b.db.GetSession()
	if err != nil {
		return err
	}

	engine, err := b.db.GetEngine()
	if err != nil {
		return err
	}

	b.sess = sess
	b.dialect = migrator.NewDialect(engine.DriverName())

	// TODO.... set up the broadcaster

	return nil
}

func (b *backend) IsHealthy(ctx context.Context, r *resource.HealthCheckRequest) (*resource.HealthCheckResponse, error) {
	// ctxLogger := s.log.FromContext(log.WithContextualAttributes(ctx, []any{"method", "isHealthy"}))

	if err := b.sqlDB.PingContext(ctx); err != nil {
		return nil, err
	}
	// TODO: check the status of the watcher implementation as well
	return &resource.HealthCheckResponse{Status: resource.HealthCheckResponse_SERVING}, nil
}

func (b *backend) Stop() {
	b.cancel()
}

func (b *backend) WriteEvent(ctx context.Context, event resource.WriteEvent) (int64, error) {
	_, span := b.tracer.Start(ctx, trace_prefix+"WriteEvent")
	defer span.End()
	// TODO: validate key ?
	if err := b.Init(); err != nil {
		return 0, err
	}
	switch event.Type {
	case resource.WatchEvent_ADDED:
		return b.create(ctx, event)
	case resource.WatchEvent_MODIFIED:
		return b.update(ctx, event)
	case resource.WatchEvent_DELETED:
		return b.delete(ctx, event)
	default:

	}
	return 0, fmt.Errorf("unsupported event type")
}

func (b *backend) create(ctx context.Context, event resource.WriteEvent) (int64, error) {
	ctx, span := b.tracer.Start(ctx, trace_prefix+"Create")
	defer span.End()
	var newVersion int64
	guid := uuid.New().String()
	err := b.sqlDB.WithTx(ctx, ReadCommitted, func(ctx context.Context, tx db.Tx) error {
		// TODO: Set the Labels

		// 1. Update into entity
		if _, err := exec(ctx, tx, sqlResourceInsert, sqlResourceRequest{
			SQLTemplate: sqltemplate.New(b.sqlDialect),
			WriteEvent:  event,
			GUID:        guid,
		}); err != nil {
			return fmt.Errorf("insert into resource: %w", err)
		}

		// 2. Insert into resource history
		if _, err := exec(ctx, tx, sqlResourceHistoryInsert, sqlResourceRequest{
			SQLTemplate: sqltemplate.New(b.sqlDialect),
			WriteEvent:  event,
			GUID:        guid,
		}); err != nil {
			return fmt.Errorf("insert into resource history: %w", err)
		}

		// // 3. Rebuild the whole folder tree structure if we're creating a folder
		// TODO: We need a better way to do this that does not require a custom table
		// if newEntity.Group == folder.GROUP && newEntity.Resource == folder.RESOURCE {
		// 	if err = s.updateFolderTree(ctx, tx, key.Namespace); err != nil {
		// 		return fmt.Errorf("rebuild folder tree structure: %w", err)
		// 	}
		// }

		// 4. Atomically increpement resource version for this kind
		rv, err := resourceVersionAtomicInc(ctx, tx, b.sqlDialect, event.Key)
		if err != nil {
			return err
		}
		newVersion = rv

		// 5. Update the RV in both resource and resource_history
		rvReq := sqlResourceUpdateRVRequest{
			SQLTemplate:     sqltemplate.New(b.sqlDialect),
			GUID:            guid,
			ResourceVersion: newVersion,
		}

		if _, err = exec(ctx, tx, sqlResourceHistoryUpdateRV, rvReq); err != nil {
			return fmt.Errorf("update history rv: %w", err)
		}
		if _, err = exec(ctx, tx, sqlResourceUpdateRV, rvReq); err != nil {
			return fmt.Errorf("update resource rv: %w", err)
		}
		return nil
	})

	return newVersion, err
}

func (b *backend) update(ctx context.Context, event resource.WriteEvent) (int64, error) {
	ctx, span := b.tracer.Start(ctx, trace_prefix+"Update")
	defer span.End()
	var newVersion int64
	guid := uuid.New().String()
	err := b.sqlDB.WithTx(ctx, ReadCommitted, func(ctx context.Context, tx db.Tx) error {
		// TODO: Set the Labels

		// 1. Update into resource
		res, err := exec(ctx, tx, sqlResourceUpdate, sqlResourceRequest{
			SQLTemplate: sqltemplate.New(b.sqlDialect),
			WriteEvent:  event,
			GUID:        guid,
		})
		if err != nil {
			return fmt.Errorf("update into resource: %w", err)
		}

		count, err := res.RowsAffected()
		if err != nil {
			return fmt.Errorf("update into resource: %w", err)
		}
		if count == 0 {
			return fmt.Errorf("no rows affected")
		}

		// 2. Insert into resource history
		if _, err := exec(ctx, tx, sqlResourceHistoryInsert, sqlResourceRequest{
			SQLTemplate: sqltemplate.New(b.sqlDialect),
			WriteEvent:  event,
			GUID:        guid,
		}); err != nil {
			return fmt.Errorf("insert into resource history: %w", err)
		}

		// // 3. Rebuild the whole folder tree structure if we're creating a folder
		// TODO: We need a better way to do this that does not require a custom table
		// if newEntity.Group == folder.GROUP && newEntity.Resource == folder.RESOURCE {
		// 	if err = s.updateFolderTree(ctx, tx, key.Namespace); err != nil {
		// 		return fmt.Errorf("rebuild folder tree structure: %w", err)
		// 	}
		// }

		// 4. Atomically increpement resource version for this kind
		rv, err := resourceVersionAtomicInc(ctx, tx, b.sqlDialect, event.Key)
		if err != nil {
			return err
		}
		newVersion = rv
		rvReq := sqlResourceUpdateRVRequest{
			SQLTemplate:     sqltemplate.New(b.sqlDialect),
			GUID:            guid,
			ResourceVersion: newVersion,
		}

		// 5. Update the RV in both resource and resource_history
		if _, err = exec(ctx, tx, sqlResourceHistoryUpdateRV, rvReq); err != nil {
			return fmt.Errorf("update history rv: %w", err)
		}
		if _, err = exec(ctx, tx, sqlResourceUpdateRV, rvReq); err != nil {
			return fmt.Errorf("update resource rv: %w", err)
		}

		return nil
	})

	return newVersion, err
}

func (b *backend) delete(ctx context.Context, event resource.WriteEvent) (int64, error) {
	ctx, span := b.tracer.Start(ctx, trace_prefix+"Delete")
	defer span.End()
	var newVersion int64
	guid := uuid.New().String()

	err := b.sqlDB.WithTx(ctx, ReadCommitted, func(ctx context.Context, tx db.Tx) error {
		// TODO: Set the Labels

		// 1. delete from resource
		res, err := exec(ctx, tx, sqlResourceDelete, sqlResourceRequest{
			SQLTemplate: sqltemplate.New(b.sqlDialect),
			WriteEvent:  event,
			GUID:        guid,
		})
		if err != nil {
			return fmt.Errorf("delete resource: %w", err)
		}
		count, err := res.RowsAffected()
		if err != nil {
			return fmt.Errorf("update into resource: %w", err)
		}
		if count == 0 {
			return fmt.Errorf("no rows affected")
		}

		// 2. Add  event to resource history
		if _, err := exec(ctx, tx, sqlResourceHistoryInsert, sqlResourceRequest{
			SQLTemplate: sqltemplate.New(b.sqlDialect),
			WriteEvent:  event,
			GUID:        guid,
		}); err != nil {
			return fmt.Errorf("insert into resource history: %w", err)
		}

		// // 3. Rebuild the whole folder tree structure if we're creating a folder
		// TODO: We need a better way to do this that does not require a custom table
		// if newEntity.Group == folder.GROUP && newEntity.Resource == folder.RESOURCE {
		// 	if err = s.updateFolderTree(ctx, tx, key.Namespace); err != nil {
		// 		return fmt.Errorf("rebuild folder tree structure: %w", err)
		// 	}
		// }

		// 4. Atomically increpement resource version for this kind
		newVersion, err = resourceVersionAtomicInc(ctx, tx, b.sqlDialect, event.Key)
		if err != nil {
			return err
		}

		// 5. Update the RV in resource_history
		if _, err = exec(ctx, tx, sqlResourceHistoryUpdateRV, sqlResourceUpdateRVRequest{
			SQLTemplate:     sqltemplate.New(b.sqlDialect),
			GUID:            guid,
			ResourceVersion: newVersion,
		}); err != nil {
			return fmt.Errorf("update history rv: %w", err)
		}
		return nil
	})

	return newVersion, err
}

func (b *backend) Read(ctx context.Context, req *resource.ReadRequest) (*resource.ReadResponse, error) {
	_, span := b.tracer.Start(ctx, trace_prefix+".Read")
	defer span.End()

	// TODO: validate key ?
	if err := b.Init(); err != nil {
		return nil, err
	}

	readReq := sqlResourceReadRequest{
		SQLTemplate:     sqltemplate.New(b.sqlDialect),
		Request:         req,
		readResponseSet: new(readResponseSet),
	}

	sr := sqlResourceRead
	if req.ResourceVersion > 0 {
		// read a specific version
		sr = sqlResourceHistoryRead
	}

	res, err := queryRow(ctx, b.sqlDB, sr, readReq)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, resource.ErrNotFound
	} else if err != nil {
		return nil, fmt.Errorf("get resource version: %w", err)
	}

	return &res.ReadResponse, nil
}

func (b *backend) PrepareList(ctx context.Context, req *resource.ListRequest) (*resource.ListResponse, error) {
	_, span := b.tracer.Start(ctx, "storage_server.List")
	defer span.End()

	fmt.Printf("TODO, LIST: %+v", req.Options.Key)

	return nil, ErrNotImplementedYet
}

func (b *backend) WatchWriteEvents(ctx context.Context) (<-chan *resource.WrittenEvent, error) {
	stream := make(chan *resource.WrittenEvent)
	go b.poller(ctx, stream)
	return stream, nil
}

func (b *backend) poller(ctx context.Context, stream chan<- *resource.WrittenEvent) {
	var err error

	// FIXME: we need a way to state startup of server from a (Group, Resource)
	// standpoint, and consider that new (Group, Resource) may be added to
	// `kind_version`, so we should probably also poll for changes in there
	since := int64(0)

	interval := 100 * time.Millisecond // TODO make this configurable

	t := time.NewTicker(interval)
	defer close(stream)
	defer t.Stop()

	for {
		select {
		case <-b.ctx.Done():
			return
		case <-t.C:
			since, err = b.poll(ctx, since, stream)
			if err != nil {
				b.log.Error("watch error", "err", err)
			}
			t.Reset(interval)
		}
	}
}

func (b *backend) poll(ctx context.Context, since int64, stream chan<- *resource.WrittenEvent) (int64, error) {
	ctx, span := b.tracer.Start(ctx, trace_prefix+"poll")
	defer span.End()

	pollReq := sqlResourceHistoryPollRequest{
		SQLTemplate:          sqltemplate.New(b.sqlDialect),
		SinceResourceVersion: since,
		historyPollResponse:  new(historyPollResponse),
	}
	query, err := sqltemplate.Execute(sqlResourceHistoryPoll, pollReq)
	if err != nil {
		return 0, fmt.Errorf("execute SQL template to poll for resource history: %w", err)
	}

	rows, err := b.sqlDB.QueryContext(ctx, query, pollReq.GetArgs()...)
	if err != nil {
		return 0, fmt.Errorf("poll for resource history: %w", err)
	}
	next := since
	for i := 1; rows.Next(); i++ {
		// check if the context is done
		if ctx.Err() != nil {
			return 0, ctx.Err()
		}
		if err := rows.Scan(pollReq.GetScanDest()...); err != nil {
			return 0, fmt.Errorf("scan row #%d polling for resource history: %w", i, err)
		}
		resp := *pollReq.historyPollResponse
		next = resp.ResourceVersion

		stream <- &resource.WrittenEvent{
			WriteEvent: resource.WriteEvent{
				Value: resp.Value,
				Key: &resource.ResourceKey{
					Namespace: resp.Key.Namespace,
					Group:     resp.Key.Group,
					Resource:  resp.Key.Resource,
					Name:      resp.Key.Name,
				},
				Type: resource.WatchEvent_Type(resp.Action),
			},
			ResourceVersion: resp.ResourceVersion,
			// Timestamp:  , // TODO: add timestamp
		}
	}
	return next, nil
}

// resourceVersionAtomicInc atomically increases the version of a kind within a
// transaction.
func resourceVersionAtomicInc(ctx context.Context, x db.ContextExecer, d sqltemplate.Dialect, key *resource.ResourceKey) (newVersion int64, err error) {

	// 1. Increment the resource version
	req := sqlResourceVersionRequest{
		SQLTemplate:     sqltemplate.New(d),
		Key:             key,
		resourceVersion: new(resourceVersion),
	}
	res, err := exec(ctx, x, sqlResourceVersionInc, req)
	if err != nil {
		return 0, fmt.Errorf("increase resource version: %w", err)
	}
	// if there wasn't a row associated with the given resource, we create one with
	// version 1
	count, err := res.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("increase resource version: %w", err)
	}
	if count == 0 {
		// NOTE: there is a marginal chance that we race with another writer
		// trying to create the same row. This is only possible when onboarding
		// a new (Group, Resource) to the cell, which should be very unlikely,
		// and the workaround is simply retrying. The alternative would be to
		// use INSERT ... ON CONFLICT DO UPDATE ..., but that creates a
		// requirement for support in Dialect only for this marginal case, and
		// we would rather keep Dialect as small as possible. Another
		// alternative is to simply check if the INSERT returns a DUPLICATE KEY
		// error and then retry the original SELECT, but that also adds some
		// complexity to the code. That would be preferrable to changing
		// Dialect, though. The current alternative, just retrying, seems to be
		// enough for now.
		if _, err = exec(ctx, x, sqlResourceVersionInsert, req); err != nil {
			return 0, fmt.Errorf("insert into resource_version: %w", err)
		}

		return 1, nil
	}

	// 2. Get the new version
	if _, err = queryRow(ctx, x, sqlResourceVersionGet, req); err != nil {
		return 0, fmt.Errorf("get resource version: %w", err)
	}

	return req.ResourceVersion, nil
}

// exec uses `req` as input for a non-data returning query generated with
// `tmpl`, and executed in `x`.
func exec(ctx context.Context, x db.ContextExecer, tmpl *template.Template, req sqltemplate.SQLTemplateIface) (sql.Result, error) {
	if err := req.Validate(); err != nil {
		return nil, fmt.Errorf("exec: invalid request for template %q: %w",
			tmpl.Name(), err)
	}

	rawQuery, err := sqltemplate.Execute(tmpl, req)
	if err != nil {
		return nil, fmt.Errorf("execute template: %w", err)
	}
	query := sqltemplate.FormatSQL(rawQuery)

	res, err := x.ExecContext(ctx, query, req.GetArgs()...)
	if err != nil {
		return nil, SQLError{
			Err:          err,
			CallType:     "Exec",
			TemplateName: tmpl.Name(),
			arguments:    req.GetArgs(),
			Query:        query,
			RawQuery:     rawQuery,
		}
	}

	return res, nil
}

// queryRow uses `req` as input and output for a single-row returning query
// generated with `tmpl`, and executed in `x`.
func queryRow[T any](ctx context.Context, x db.ContextExecer, tmpl *template.Template, req sqltemplate.WithResults[T]) (T, error) {
	var zero T

	if err := req.Validate(); err != nil {
		return zero, fmt.Errorf("query: invalid request for template %q: %w",
			tmpl.Name(), err)
	}

	rawQuery, err := sqltemplate.Execute(tmpl, req)
	if err != nil {
		return zero, fmt.Errorf("execute template: %w", err)
	}
	query := sqltemplate.FormatSQL(rawQuery)

	row := x.QueryRowContext(ctx, query, req.GetArgs()...)
	if err := row.Err(); err != nil {
		return zero, SQLError{
			Err:          err,
			CallType:     "QueryRow",
			TemplateName: tmpl.Name(),
			arguments:    req.GetArgs(),
			ScanDest:     req.GetScanDest(),
			Query:        query,
			RawQuery:     rawQuery,
		}
	}

	return scanRow(row, req)
}

type scanner interface {
	Scan(dest ...any) error
}

// scanRow is used on *sql.Row and *sql.Rows, and is factored out here not to
// improving code reuse, but rather for ease of testing.
func scanRow[T any](sc scanner, req sqltemplate.WithResults[T]) (zero T, err error) {
	if err = sc.Scan(req.GetScanDest()...); err != nil {
		return zero, fmt.Errorf("row scan: %w", err)
	}

	res, err := req.Results()
	if err != nil {
		return zero, fmt.Errorf("row results: %w", err)
	}

	return res, nil
}
