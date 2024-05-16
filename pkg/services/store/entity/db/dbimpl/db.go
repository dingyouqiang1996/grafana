package dbimpl

import (
	"context"
	"database/sql"
	"fmt"

	iface "github.com/grafana/grafana/pkg/services/store/entity/db"
)

func NewDB(d *sql.DB, driverName string) iface.DB {
	return sqldb{
		DB:         d,
		driverName: driverName,
	}
}

type sqldb struct {
	*sql.DB
	driverName string
}

func (d sqldb) DriverName() string {
	return d.driverName
}

func (d sqldb) BeginTx(ctx context.Context, opts *sql.TxOptions) (iface.Tx, error) {
	t, err := d.DB.BeginTx(ctx, opts)
	if err != nil {
		return nil, err
	}
	return tx{
		Tx: t,
	}, nil
}

func (d sqldb) WithTx(ctx context.Context, opts *sql.TxOptions, f iface.TxFunc) error {
	t, err := d.BeginTx(ctx, opts)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}

	if err := f(ctx, t); err != nil {
		if rollbackErr := t.Rollback(); rollbackErr != nil {
			return fmt.Errorf("tx err: %w; rollback err: %w", err, rollbackErr)
		}
		return fmt.Errorf("tx err: %w", err)
	}

	if err = t.Commit(); err != nil {
		return fmt.Errorf("commit err: %w", err)
	}

	return nil
}

type tx struct {
	*sql.Tx
}
