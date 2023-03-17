// Code generated - EDITING IS FUTILE. DO NOT EDIT.
//
// Generated by:
//     kinds/gen.go
// Using jennies:
//     BaseCoreRegistryJenny
//
// Run 'make gen-cue' from repository root to regenerate.

package corekind

import (
	"fmt"

	"github.com/grafana/grafana/pkg/kinds/dashboard"
	"github.com/grafana/grafana/pkg/kinds/librarypanel"
	"github.com/grafana/grafana/pkg/kinds/playlist"
	"github.com/grafana/grafana/pkg/kinds/preferences"
	"github.com/grafana/grafana/pkg/kinds/publicdashboard"
	"github.com/grafana/grafana/pkg/kinds/serviceaccount"
	"github.com/grafana/grafana/pkg/kinds/team"
	"github.com/grafana/kindsys"
	"github.com/grafana/thema"
)

// Base is a registry of all Grafana core kinds. It is designed for use both inside
// of Grafana itself, and for import by external Go programs wanting to work with Grafana's
// kind system.
//
// The registry provides two modes for accessing core kinds:
//   - Per-kind methods, which return the kind-specific type, e.g. Dashboard() returns [dashboard.Dashboard].
//   - All(), which returns a slice of [kindsys.Core].
//
// Prefer the individual named methods for use cases where the particular kind(s) that
// are needed are known to the caller. For example, a dashboard linter can know that it
// specifically wants the dashboard kind.
//
// Prefer All() when performing operations generically across all kinds. For example,
// a generic HTTP middleware for validating request bodies expected to contain some
// kind-schematized type.
type Base struct {
	all             []kindsys.Core
	dashboard       *dashboard.Kind
	librarypanel    *librarypanel.Kind
	playlist        *playlist.Kind
	preferences     *preferences.Kind
	publicdashboard *publicdashboard.Kind
	serviceaccount  *serviceaccount.Kind
	team            *team.Kind
}

// type guards
var (
	_ kindsys.Core = &dashboard.Kind{}
	_ kindsys.Core = &librarypanel.Kind{}
	_ kindsys.Core = &playlist.Kind{}
	_ kindsys.Core = &preferences.Kind{}
	_ kindsys.Core = &publicdashboard.Kind{}
	_ kindsys.Core = &serviceaccount.Kind{}
	_ kindsys.Core = &team.Kind{}
)

// Dashboard returns the [kindsys.Interface] implementation for the dashboard kind.
func (b *Base) Dashboard() *dashboard.Kind {
	return b.dashboard
}

// LibraryPanel returns the [kindsys.Interface] implementation for the librarypanel kind.
func (b *Base) LibraryPanel() *librarypanel.Kind {
	return b.librarypanel
}

// Playlist returns the [kindsys.Interface] implementation for the playlist kind.
func (b *Base) Playlist() *playlist.Kind {
	return b.playlist
}

// Preferences returns the [kindsys.Interface] implementation for the preferences kind.
func (b *Base) Preferences() *preferences.Kind {
	return b.preferences
}

// PublicDashboard returns the [kindsys.Interface] implementation for the publicdashboard kind.
func (b *Base) PublicDashboard() *publicdashboard.Kind {
	return b.publicdashboard
}

// ServiceAccount returns the [kindsys.Interface] implementation for the serviceaccount kind.
func (b *Base) ServiceAccount() *serviceaccount.Kind {
	return b.serviceaccount
}

// Team returns the [kindsys.Interface] implementation for the team kind.
func (b *Base) Team() *team.Kind {
	return b.team
}

func doNewBase(rt *thema.Runtime) *Base {
	var err error
	reg := &Base{}

	reg.dashboard, err = dashboard.NewKind(rt)
	if err != nil {
		panic(fmt.Sprintf("error while initializing the dashboard Kind: %s", err))
	}
	reg.all = append(reg.all, reg.dashboard)

	reg.librarypanel, err = librarypanel.NewKind(rt)
	if err != nil {
		panic(fmt.Sprintf("error while initializing the librarypanel Kind: %s", err))
	}
	reg.all = append(reg.all, reg.librarypanel)

	reg.playlist, err = playlist.NewKind(rt)
	if err != nil {
		panic(fmt.Sprintf("error while initializing the playlist Kind: %s", err))
	}
	reg.all = append(reg.all, reg.playlist)

	reg.preferences, err = preferences.NewKind(rt)
	if err != nil {
		panic(fmt.Sprintf("error while initializing the preferences Kind: %s", err))
	}
	reg.all = append(reg.all, reg.preferences)

	reg.publicdashboard, err = publicdashboard.NewKind(rt)
	if err != nil {
		panic(fmt.Sprintf("error while initializing the publicdashboard Kind: %s", err))
	}
	reg.all = append(reg.all, reg.publicdashboard)

	reg.serviceaccount, err = serviceaccount.NewKind(rt)
	if err != nil {
		panic(fmt.Sprintf("error while initializing the serviceaccount Kind: %s", err))
	}
	reg.all = append(reg.all, reg.serviceaccount)

	reg.team, err = team.NewKind(rt)
	if err != nil {
		panic(fmt.Sprintf("error while initializing the team Kind: %s", err))
	}
	reg.all = append(reg.all, reg.team)

	return reg
}
