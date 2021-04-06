package accesscontrol

import (
	"context"

	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/registry"
)

type AccessControl interface {
	// Evaluate evaluates access to the given resource.
	Evaluate(ctx context.Context, user *models.SignedInUser, permission string, scope ...string) (bool, error)

	// GetUserPermissions returns user permissions.
	GetUserPermissions(ctx context.Context, user *models.SignedInUser, roles []string) ([]*Permission, error)

	// Middleware checks if service disabled or not to switch to fallback authorization.
	registry.CanBeDisabled
}
