// Code generated - EDITING IS FUTILE. DO NOT EDIT.
//
// Generated by:
//     kinds/gen.go
// Using jennies:
//     GoResourceTypes
//
// Run 'make gen-cue' from repository root to regenerate.

package folder

// Defines values for OperatorStateState.
const (
	OperatorStateStateFailed     OperatorStateState = "failed"
	OperatorStateStateInProgress OperatorStateState = "in_progress"
	OperatorStateStateSuccess    OperatorStateState = "success"
)

// OperatorState defines model for OperatorState.
type OperatorState struct {
	// descriptiveState is an optional more descriptive state field which has no requirements on format
	DescriptiveState *string `json:"descriptiveState,omitempty"`

	// details contains any extra information that is operator-specific
	Details map[string]interface{} `json:"details,omitempty"`

	// lastEvaluation is the ResourceVersion last evaluated
	LastEvaluation string `json:"lastEvaluation"`

	// state describes the state of the lastEvaluation.
	// It is limited to three possible states for machine evaluation.
	State OperatorStateState `json:"state"`
}

// OperatorStateState state describes the state of the lastEvaluation.
// It is limited to three possible states for machine evaluation.
type OperatorStateState string

// Status defines model for Status.
type Status struct {
	// additionalFields is reserved for future use
	AdditionalFields map[string]interface{} `json:"additionalFields"`

	// operatorStates is a map of operator ID to operator state evaluations.
	// Any operator which consumes this kind SHOULD add its state evaluation information to this field.
	OperatorStates map[string]OperatorState `json:"operatorStates,omitempty"`
}
