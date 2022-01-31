package store_test

import (
	"testing"

	"github.com/grafana/grafana/pkg/services/ngalert/models"
	"github.com/grafana/grafana/pkg/services/ngalert/tests"
	"github.com/stretchr/testify/require"
)

const testAlertingIntervalSeconds = 10

func TestProvisioningStore(t *testing.T) {
	_, dbstore := tests.SetupTestEnv(t, testAlertingIntervalSeconds)

	t.Run("Default provenance of a known type is None", func(t *testing.T) {
		rule := models.AlertRule{
			UID: "asdf",
		}

		provenance, err := dbstore.GetProvenance(&rule)

		require.NoError(t, err)
		require.Equal(t, models.ProvenanceNone, provenance)
	})

	t.Run("Store returns saved provenance type", func(t *testing.T) {
		rule := models.AlertRule{
			UID: "123",
		}
		err := dbstore.SetProvenance(&rule, models.ProvenanceFile)
		require.NoError(t, err)

		p, err := dbstore.GetProvenance(&rule)

		require.NoError(t, err)
		require.Equal(t, models.ProvenanceFile, p)
	})
}

type randomStruct struct{}
