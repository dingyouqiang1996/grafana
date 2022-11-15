package notifier

import (
	"errors"
	"fmt"
	"time"

	v2 "github.com/prometheus/alertmanager/api/v2"
	"github.com/prometheus/alertmanager/silence"

	apimodels "github.com/grafana/grafana/pkg/services/ngalert/api/tooling/definitions"
)

var (
	ErrGetSilencesInternal     = fmt.Errorf("unable to retrieve silence(s) due to an internal error")
	ErrDeleteSilenceInternal   = fmt.Errorf("unable to delete silence due to an internal error")
	ErrCreateSilenceBadPayload = fmt.Errorf("unable to create silence")
	ErrListSilencesBadPayload  = fmt.Errorf("unable to list silences")
	ErrSilenceNotFound         = silence.ErrNotFound
)

// ListSilences retrieves a list of stored silences. It supports a set of labels as filters.
func (am *Alertmanager) ListSilences(filter []string) (apimodels.GettableSilences, error) {
	matchers, err := parseFilter(filter)
	if err != nil {
		am.logger.Error("Failed to parse silence filter matchers", "error", err)
		return nil, fmt.Errorf("%s: %w", ErrListSilencesBadPayload.Error(), err)
	}

	psils, _, err := am.silences.Query()
	if err != nil {
		am.logger.Error("Failed to retrieve silences", "error", err)
		return nil, fmt.Errorf("%s: %w", ErrGetSilencesInternal.Error(), err)
	}

	sils := apimodels.GettableSilences{}
	for _, ps := range psils {
		if !v2.CheckSilenceMatchesFilterLabels(ps, matchers) {
			continue
		}
		silence, err := v2.GettableSilenceFromProto(ps)
		if err != nil {
			am.logger.Error("Failed to unmarshal a silence from protobuf", "error", err)
			return apimodels.GettableSilences{}, fmt.Errorf("%s: failed to convert internal silence to API silence: %w",
				ErrGetSilencesInternal.Error(), err)
		}
		sils = append(sils, &silence)
	}

	v2.SortSilences(sils)

	return sils, nil
}

// GetSilence retrieves a silence by the provided silenceID. It returns ErrSilenceNotFound if the silence is not present.
func (am *Alertmanager) GetSilence(silenceID string) (apimodels.GettableSilence, error) {
	sils, _, err := am.silences.Query(silence.QIDs(silenceID))
	if err != nil {
		return apimodels.GettableSilence{}, fmt.Errorf("%s: %w", ErrGetSilencesInternal.Error(), err)
	}

	if len(sils) == 0 {
		am.logger.Error("Failed to find silence", "error", err, "id", sils)
		return apimodels.GettableSilence{}, ErrSilenceNotFound
	}

	sil, err := v2.GettableSilenceFromProto(sils[0])
	if err != nil {
		am.logger.Error("Failed to unmarshal a silence from protobuf", "error", err)
		return apimodels.GettableSilence{}, fmt.Errorf("%s: failed to convert internal silence to API silence: %w",
			ErrGetSilencesInternal.Error(), err)
	}

	return sil, nil
}

// CreateSilence persists the provided silence and returns the silence ID if successful.
func (am *Alertmanager) CreateSilence(ps *apimodels.PostableSilence) (string, error) {
	sil, err := v2.PostableSilenceToProto(ps)
	if err != nil {
		am.logger.Error("Failed to marshal a silence to protobuf", "error", err)
		return "", fmt.Errorf("%s: failed to convert API silence to internal silence: %w",
			ErrCreateSilenceBadPayload.Error(), err)
	}

	if sil.StartsAt.After(sil.EndsAt) || sil.StartsAt.Equal(sil.EndsAt) {
		am.logger.Error("Failed to create a silence because of invalid interval", "starts_at", sil.StartsAt, "ends_at", sil.EndsAt)
		return "", fmt.Errorf("start time must be before end time: %w", ErrCreateSilenceBadPayload)
	}

	if sil.EndsAt.Before(time.Now()) {
		am.logger.Error("Failed to create a silence because it is already expired", "ends_at", sil.EndsAt)
		return "", fmt.Errorf("end time can't be in the past: %w", ErrCreateSilenceBadPayload)
	}

	silenceID, err := am.silences.Set(sil)
	if err != nil {
		am.logger.Error("Failed to save silence", "error", err)
		if errors.Is(err, silence.ErrNotFound) {
			return "", ErrSilenceNotFound
		}
		return "", fmt.Errorf("unable to save silence: %s: %w", err.Error(), ErrCreateSilenceBadPayload)
	}

	return silenceID, nil
}

// DeleteSilence looks for and expires the silence by the provided silenceID. It returns ErrSilenceNotFound if the silence is not present.
func (am *Alertmanager) DeleteSilence(silenceID string) error {
	if err := am.silences.Expire(silenceID); err != nil {
		if errors.Is(err, silence.ErrNotFound) {
			return ErrSilenceNotFound
		}
		return fmt.Errorf("%s: %w", err.Error(), ErrDeleteSilenceInternal)
	}

	return nil
}
