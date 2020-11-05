package migrator

import (
	"fmt"
	"strings"

	"xorm.io/xorm"
)

type Dialect interface {
	DriverName() string
	Quote(string) string
	AndStr() string
	AutoIncrStr() string
	OrStr() string
	EqStr() string
	ShowCreateNull() bool
	SqlType(col *Column) string
	SupportEngine() bool
	LikeStr() string
	Default(col *Column) string
	BooleanStr(bool) string
	DateTimeFunc(string) string

	CreateIndexSql(tableName string, index *Index) string
	CreateTableSql(table *Table) string
	AddColumnSql(tableName string, col *Column) string
	CopyTableData(sourceTable string, targetTable string, sourceCols []string, targetCols []string) string
	DropTable(tableName string) string
	DropIndexSql(tableName string, index *Index) string

	RenameTable(oldName string, newName string) string
	UpdateTableSql(tableName string, columns []*Column) string

	IndexCheckSql(tableName, indexName string) (string, []interface{})
	ColumnCheckSql(tableName, columnName string) (string, []interface{})

	ColString(*Column) string
	ColStringNoPk(*Column) string

	Limit(limit int64) string
	LimitOffset(limit int64, offset int64) string

	PreInsertId(table string, sess *xorm.Session) error
	PostInsertId(table string, sess *xorm.Session) error

	CleanDB() error
	TruncateDBTables() error
	NoOpSql() string

	IsUniqueConstraintViolation(err error) bool
	ErrorMessage(err error) string
	IsDeadlock(err error) bool
}

type dialectFunc func(*xorm.Engine) Dialect

var supportedDialects = map[string]dialectFunc{
	MYSQL:                  NewMysqlDialect,
	SQLITE:                 NewSqlite3Dialect,
	POSTGRES:               NewPostgresDialect,
	MYSQL + "WithHooks":    NewMysqlDialect,
	SQLITE + "WithHooks":   NewSqlite3Dialect,
	POSTGRES + "WithHooks": NewPostgresDialect,
}

func NewDialect(engine *xorm.Engine) Dialect {
	name := engine.DriverName()
	if fn, exist := supportedDialects[name]; exist {
		return fn(engine)
	}

	panic("Unsupported database type: " + name)
}

type BaseDialect struct {
	dialect    Dialect
	engine     *xorm.Engine
	driverName string
}

func (b *BaseDialect) DriverName() string {
	return b.driverName
}

func (b *BaseDialect) ShowCreateNull() bool {
	return true
}

func (b *BaseDialect) AndStr() string {
	return "AND"
}

func (b *BaseDialect) LikeStr() string {
	return "LIKE"
}

func (b *BaseDialect) OrStr() string {
	return "OR"
}

func (b *BaseDialect) EqStr() string {
	return "="
}

func (b *BaseDialect) Default(col *Column) string {
	return col.Default
}

func (b *BaseDialect) DateTimeFunc(value string) string {
	return value
}

func (b *BaseDialect) CreateTableSql(table *Table) string {
	sql := "CREATE TABLE IF NOT EXISTS "
	sql += b.dialect.Quote(table.Name) + " (\n"

	pkList := table.PrimaryKeys

	for _, col := range table.Columns {
		if col.IsPrimaryKey && len(pkList) == 1 {
			sql += col.String(b.dialect)
		} else {
			sql += col.StringNoPk(b.dialect)
		}
		sql = strings.TrimSpace(sql)
		sql += "\n, "
	}

	if len(pkList) > 1 {
		quotedCols := []string{}
		for _, col := range pkList {
			quotedCols = append(quotedCols, b.dialect.Quote(col))
		}

		sql += "PRIMARY KEY ( " + strings.Join(quotedCols, ",") + " ), "
	}

	sql = sql[:len(sql)-2] + ")"
	if b.dialect.SupportEngine() {
		sql += " ENGINE=InnoDB DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci"
	}

	sql += ";"
	return sql
}

func (b *BaseDialect) AddColumnSql(tableName string, col *Column) string {
	return fmt.Sprintf("alter table %s ADD COLUMN %s", b.dialect.Quote(tableName), col.StringNoPk(b.dialect))
}

func (b *BaseDialect) CreateIndexSql(tableName string, index *Index) string {
	quote := b.dialect.Quote
	var unique string
	if index.Type == UniqueIndex {
		unique = " UNIQUE"
	}

	idxName := index.XName(tableName)

	quotedCols := []string{}
	for _, col := range index.Cols {
		quotedCols = append(quotedCols, b.dialect.Quote(col))
	}

	return fmt.Sprintf("CREATE%s INDEX %v ON %v (%v);", unique, quote(idxName), quote(tableName), strings.Join(quotedCols, ","))
}

func (b *BaseDialect) QuoteColList(cols []string) string {
	var sourceColsSql = ""
	for _, col := range cols {
		sourceColsSql += b.dialect.Quote(col)
		sourceColsSql += "\n, "
	}
	return strings.TrimSuffix(sourceColsSql, "\n, ")
}

func (b *BaseDialect) CopyTableData(sourceTable string, targetTable string, sourceCols []string, targetCols []string) string {
	sourceColsSql := b.QuoteColList(sourceCols)
	targetColsSql := b.QuoteColList(targetCols)

	quote := b.dialect.Quote
	return fmt.Sprintf("INSERT INTO %s (%s) SELECT %s FROM %s", quote(targetTable), targetColsSql, sourceColsSql, quote(sourceTable))
}

func (b *BaseDialect) DropTable(tableName string) string {
	quote := b.dialect.Quote
	return fmt.Sprintf("DROP TABLE IF EXISTS %s", quote(tableName))
}

func (b *BaseDialect) RenameTable(oldName string, newName string) string {
	quote := b.dialect.Quote
	return fmt.Sprintf("ALTER TABLE %s RENAME TO %s", quote(oldName), quote(newName))
}

func (b *BaseDialect) ColumnCheckSql(tableName, columnName string) (string, []interface{}) {
	return "", nil
}

func (b *BaseDialect) DropIndexSql(tableName string, index *Index) string {
	quote := b.dialect.Quote
	name := index.XName(tableName)
	return fmt.Sprintf("DROP INDEX %v ON %s", quote(name), quote(tableName))
}

func (b *BaseDialect) UpdateTableSql(tableName string, columns []*Column) string {
	return "-- NOT REQUIRED"
}

func (b *BaseDialect) ColString(col *Column) string {
	sql := b.dialect.Quote(col.Name) + " "

	sql += b.dialect.SqlType(col) + " "

	if col.IsPrimaryKey {
		sql += "PRIMARY KEY "
		if col.IsAutoIncrement {
			sql += b.dialect.AutoIncrStr() + " "
		}
	}

	if b.dialect.ShowCreateNull() {
		if col.Nullable {
			sql += "NULL "
		} else {
			sql += "NOT NULL "
		}
	}

	if col.Default != "" {
		sql += "DEFAULT " + b.dialect.Default(col) + " "
	}

	return sql
}

func (b *BaseDialect) ColStringNoPk(col *Column) string {
	sql := b.dialect.Quote(col.Name) + " "

	sql += b.dialect.SqlType(col) + " "

	if b.dialect.ShowCreateNull() {
		if col.Nullable {
			sql += "NULL "
		} else {
			sql += "NOT NULL "
		}
	}

	if col.Default != "" {
		sql += "DEFAULT " + b.dialect.Default(col) + " "
	}

	return sql
}

func (b *BaseDialect) Limit(limit int64) string {
	return fmt.Sprintf(" LIMIT %d", limit)
}

func (b *BaseDialect) LimitOffset(limit int64, offset int64) string {
	return fmt.Sprintf(" LIMIT %d OFFSET %d", limit, offset)
}

func (b *BaseDialect) PreInsertId(table string, sess *xorm.Session) error {
	return nil
}

func (b *BaseDialect) PostInsertId(table string, sess *xorm.Session) error {
	return nil
}

func (b *BaseDialect) CleanDB() error {
	return nil
}

func (b *BaseDialect) NoOpSql() string {
	return "SELECT 0;"
}

func (b *BaseDialect) TruncateDBTables() error {
	return nil
}
