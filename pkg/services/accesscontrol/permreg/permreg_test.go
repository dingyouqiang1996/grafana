package permreg

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func Test_permissionRegistry_RegisterPluginScope(t *testing.T) {
	tests := []struct {
		scope     string
		wantKind  string
		wantScope string
	}{
		{
			scope:     "folders:uid:AABBCC",
			wantKind:  "folders",
			wantScope: "folders:uid:",
		},
		{
			scope:     "plugins:id:test-app",
			wantKind:  "plugins",
			wantScope: "plugins:id:",
		},
		{
			scope:     "resource:uid:res",
			wantKind:  "resource",
			wantScope: "resource:uid:",
		},
		{
			scope:     "resource:*",
			wantKind:  "resource",
			wantScope: "resource:",
		},
	}
	for _, tt := range tests {
		t.Run(tt.scope, func(t *testing.T) {
			pr := newPermissionRegistry()
			pr.RegisterPluginScope(tt.scope)
			got, ok := pr.kindScopePrefix[tt.wantKind]
			require.True(t, ok)
			require.Equal(t, tt.wantScope, got)
		})
	}
}

func Test_permissionRegistry_RegisterPermission(t *testing.T) {
	tests := []struct {
		name          string
		action        string
		scope         string
		wantKind      string
		wantPrefixSet PrefixSet
		wantSkip      bool
	}{
		{
			name:          "register folders read",
			action:        "folders:read",
			scope:         "folders:*",
			wantKind:      "folders",
			wantPrefixSet: PrefixSet{"folders:uid:": true},
		},
		{
			name:          "register app plugin settings read",
			action:        "test-app.settings:read",
			wantKind:      "settings",
			wantPrefixSet: PrefixSet{},
		},
		{
			name:          "register an action on an unknown kind",
			action:        "unknown:action",
			scope:         "unknown:uid:*",
			wantPrefixSet: PrefixSet{},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			pr := newPermissionRegistry()
			pr.RegisterPermission(tt.action, tt.scope)
			got, ok := pr.actionScopePrefixes[tt.action]
			require.True(t, ok)
			for k, v := range got {
				require.Equal(t, v, tt.wantPrefixSet[k])
			}
		})
	}
}

func Test_permissionRegistry_IsPermissionValid(t *testing.T) {
	pr := newPermissionRegistry()
	pr.RegisterPermission("folders:read", "folders:uid:")
	pr.RegisterPermission("test-app.settings:read", "")

	tests := []struct {
		name    string
		action  string
		scope   string
		wantErr bool
	}{
		{
			name:    "valid folders read",
			action:  "folders:read",
			scope:   "folders:uid:AABBCC",
			wantErr: false,
		},
		{
			name:    "valid folders read with wildcard",
			action:  "folders:read",
			scope:   "folders:uid:*",
			wantErr: false,
		},
		{
			name:    "valid folders read with kind level wildcard",
			action:  "folders:read",
			scope:   "folders:*",
			wantErr: false,
		},
		{
			name:    "valid folders read with super wildcard",
			action:  "folders:read",
			scope:   "*",
			wantErr: false,
		},
		{
			name:    "invalid folders read with wrong kind",
			action:  "folders:read",
			scope:   "unknown:uid:AABBCC",
			wantErr: true,
		},
		{
			name:    "valid app plugin settings read",
			action:  "test-app.settings:read",
			scope:   "",
			wantErr: false,
		},
		{
			name:    "app plugin settings read with a scope",
			action:  "test-app.settings:read",
			scope:   "folders:uid:*",
			wantErr: true,
		},
		{
			name:    "unknown action",
			action:  "unknown:write",
			scope:   "",
			wantErr: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := pr.IsPermissionValid(tt.action, tt.scope)
			if tt.wantErr {
				require.Error(t, err)
				return
			}
			require.NoError(t, err)
		})
	}
}

func Test_permissionRegistry_GetScopePrefixes(t *testing.T) {
	pr := newPermissionRegistry()
	pr.RegisterPermission("folders:read", "folders:uid:")
	pr.RegisterPermission("test-app.settings:read", "")

	tests := []struct {
		name   string
		action string
		want   PrefixSet
		shouldExist  bool
	}{
		{
			name:   "get folders read scope prefixes",
			action: "folders:read",
			want:   PrefixSet{"folders:uid:": true},
			want1:  true,
		},
		{
			name:   "get app plugin settings read scope prefixes",
			action: "test-app.settings:read",
			want:   PrefixSet{},
			want1:  true,
		},
		{
			name:   "get unknown action scope prefixes",
			action: "unknown:write",
			want:   PrefixSet{},
			want1:  false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, got1 := pr.GetScopePrefixes(tt.action)
			if !tt.want1 {
				require.False(t, got1)
				return
			}
			require.True(t, got1)
			require.Len(t, tt.want, len(got))
			for k, v := range got {
				require.Equal(t, v, tt.want[k])
			}
		})
	}
}

func Test_generateValidScopeFormats(t *testing.T) {
	tests := []struct {
		name      string
		prefixSet PrefixSet
		want      []string
	}{
		{
			name:      "empty prefix set",
			prefixSet: PrefixSet{},
			want:      []string{},
		},
		{
			name:      "short prefix",
			prefixSet: PrefixSet{"folders:": true},
			want:      []string{"*", "folders:*"},
		},
		{
			name:      "single prefix",
			prefixSet: PrefixSet{"folders:uid:": true},
			want:      []string{"*", "folders:*", "folders:uid:*"},
		},
		{
			name:      "multiple prefixes",
			prefixSet: PrefixSet{"folders:uid:": true, "dashboards:uid:": true},
			want:      []string{"*", "folders:*", "folders:uid:*", "dashboards:*", "dashboards:uid:*"},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := generateValidScopeFormats(tt.prefixSet)
			require.ElementsMatch(t, tt.want, got)
		})
	}
}
