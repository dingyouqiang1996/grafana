package store

import (
	"context"
	"fmt"

	"github.com/grafana/grafana/pkg/services/ngalert/models"
	"github.com/grafana/grafana/pkg/services/sqlstore"
)

type provenanceRecord struct {
	Id         int `xorm:"pk autoincr 'id'"`
	OrgId      int
	RecordKey  string
	RecordType string
	Provenance models.Provenance
}

func (pr provenanceRecord) TableName() string {
	return "provenance_type"
}

// ProvisioningStore is a store of provisioning data for arbitrary objects.
type ProvisioningStore interface {
	GetProvenance(ctx context.Context, o models.Provisionable) (models.Provenance, error)
	// TODO: API to query all provenances for a specific type?
	SetProvenance(ctx context.Context, o models.Provisionable, p models.Provenance) error
}

// GetProvenance gets the provenance status for a provisionable object.
func (st DBstore) GetProvenance(ctx context.Context, o models.Provisionable) (models.Provenance, error) {
	recordType := o.ResourceTypeID()
	recordKey := o.ResourceID()

	provenance := models.ProvenanceNone
	err := st.SQLStore.WithDbSession(ctx, func(sess *sqlstore.DBSession) error {
		result := make([]*provenanceRecord, 0)
		q := "SELECT * FROM provenance_type WHERE record_key = ? AND record_type = ? ORDER BY id ASC LIMIT 1"
		params := []interface{}{recordKey, recordType}

		if err := sess.SQL(q, params...).Find(&result); err != nil {
			return fmt.Errorf("failed to query for existing provenance status: %w", err)
		}
		if len(result) < 1 {
			return nil
		}

		provenance = result[0].Provenance
		return nil
	})
	if err != nil {
		return models.ProvenanceNone, err
	}
	return provenance, nil
}

// SetProvenance changes the provenance status for a provisionable object.
func (st DBstore) SetProvenance(ctx context.Context, o models.Provisionable, p models.Provenance) error {
	recordType := o.ResourceTypeID()
	recordKey := o.ResourceID()

	return st.SQLStore.WithTransactionalDbSession(ctx, func(sess *sqlstore.DBSession) error {
		// TODO: Add a unit-of-work pattern, so updating objects + provenance will happen consistently with rollbacks across stores.
		// TODO: Need to make sure that writing a record where our concurrency key fails will also fail the whole transaction. That way, this gets rolled back too. can't just check that 0 updates happened inmemory. Check with jp. If not possible, we need our own concurrency key.
		// TODO: Clean up stale provenance records periodically.
		q := "DELETE FROM provenance_type WHERE record_key = ? AND record_type = ?"
		_, err := sess.Exec(q, recordKey, recordType)
		if err != nil {
			return fmt.Errorf("failed to delete pre-existing provisioning status: %w", err)
		}

		record := provenanceRecord{
			RecordKey:  recordKey,
			RecordType: recordType,
			Provenance: p,
		}

		if _, err := sess.Insert(record); err != nil {
			return fmt.Errorf("failed to store provisioning status: %w", err)
		}

		return nil
	})
}
