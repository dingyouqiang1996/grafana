// THIS FILE IS GENERATED. EDITING IS FUTILE.
//
// Generated by:
//     kinds/gen.go
// Using jennies:
//     CoreKindJenny
//
// Run 'make gen-cue' from repository root to regenerate.

package playlist

import (
	"github.com/grafana/grafana/pkg/kindsys"
	"github.com/grafana/thema"
	"github.com/grafana/thema/vmux"
)

// rootrel is the relative path from the grafana repository root to the
// directory containing the .cue files in which this kind is declared. Necessary
// for runtime errors related to the declaration and/or lineage to provide
// a real path to the correct .cue file.
const rootrel string = "kinds/playlist"

// TODO standard generated docs
type Kind struct {
	lin    thema.ConvergentLineage[*Playlist]
	jcodec vmux.Codec
	valmux vmux.ValueMux[*Playlist]
	decl   kindsys.Decl[kindsys.CoreProperties]
}

// type guard
var _ kindsys.Core = &Kind{}

// TODO standard generated docs
func NewKind(rt *thema.Runtime, opts ...thema.BindOption) (*Kind, error) {
	decl, err := kindsys.LoadCoreKind(rootrel, rt.Context(), nil)
	if err != nil {
		return nil, err
	}
	k := &Kind{
		decl: decl,
	}

	lin, err := decl.Some().BindKindLineage(rt, opts...)
	if err != nil {
		return nil, err
	}

	// Get the thema.Schema that the meta says is in the current version (which
	// codegen ensures is always the latest)
	cursch := thema.SchemaP(lin, k.decl.Properties.CurrentVersion)
	tsch, err := thema.BindType[*Playlist](cursch, &Playlist{})
	if err != nil {
		// Should be unreachable, modulo bugs in the Thema->Go code generator
		return nil, err
	}

	k.jcodec = vmux.NewJSONCodec("playlist.json")
	k.lin = tsch.ConvergentLineage()
	k.valmux = vmux.NewValueMux(k.lin.TypedSchema(), k.jcodec)
	return k, nil
}

// TODO standard generated docs
func (k *Kind) Name() string {
	return "playlist"
}

// TODO standard generated docs
func (k *Kind) MachineName() string {
	return "playlist"
}

// TODO standard generated docs
func (k *Kind) Lineage() thema.Lineage {
	return k.lin
}

// TODO standard generated docs
func (k *Kind) ConvergentLineage() thema.ConvergentLineage[*Playlist] {
	return k.lin
}

// JSONValueMux is a version multiplexer that maps a []byte containing JSON data
// at any schematized dashboard version to an instance of Playlist.
//
// Validation and translation errors emitted from this func will identify the
// input bytes as "dashboard.json".
//
// This is a thin wrapper around Thema's [vmux.ValueMux].
func (k *Kind) JSONValueMux(b []byte) (*Playlist, thema.TranslationLacunas, error) {
	return k.valmux(b)
}

// TODO standard generated docs
func (k *Kind) Maturity() kindsys.Maturity {
	return k.decl.Properties.Maturity
}

// Decl returns the [kindsys.Decl] containing both CUE and Go representations of the
// playlist declaration in .cue files.
func (k *Kind) Decl() kindsys.Decl[kindsys.CoreProperties] {
	return k.decl
}

// Props returns a [kindsys.SomeKindProps], with underlying type [kindsys.CoreProperties],
// representing the static properties declared in the playlist kind.
//
// This method is identical to calling Decl().Props. It is provided to satisfy [kindsys.Interface].
func (k *Kind) Props() kindsys.SomeKindProperties {
	return k.decl.Properties
}
