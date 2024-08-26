package team

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"k8s.io/apimachinery/pkg/apis/meta/internalversion"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apiserver/pkg/registry/rest"

	"github.com/grafana/authlib/claims"
	identityv0 "github.com/grafana/grafana/pkg/apis/identity/v0alpha1"
	"github.com/grafana/grafana/pkg/registry/apis/identity/common"
	"github.com/grafana/grafana/pkg/registry/apis/identity/legacy"
	"github.com/grafana/grafana/pkg/services/apiserver/endpoints/request"
)

var memberResource = identityv0.TeamMemberResourceInfo

var (
	_ rest.Storage              = (*LegacyMemberStore)(nil)
	_ rest.Scoper               = (*LegacyMemberStore)(nil)
	_ rest.SingularNameProvider = (*LegacyMemberStore)(nil)
	_ rest.Getter               = (*LegacyMemberStore)(nil)
	_ rest.Lister               = (*LegacyMemberStore)(nil)
)

func NewLegacyMemberStore(store legacy.LegacyIdentityStore) *LegacyMemberStore {
	return &LegacyMemberStore{store}
}

type LegacyMemberStore struct {
	store legacy.LegacyIdentityStore
}

// Destroy implements rest.Storage.
func (l *LegacyMemberStore) Destroy() {}

// New implements rest.Storage.
func (l *LegacyMemberStore) New() runtime.Object {
	return memberResource.NewFunc()
}

// NewList implements rest.Lister.
func (l *LegacyMemberStore) NewList() runtime.Object {
	return memberResource.NewListFunc()
}

// NamespaceScoped implements rest.Scoper.
func (l *LegacyMemberStore) NamespaceScoped() bool {
	return true
}

// GetSingularName implements rest.SingularNameProvider.
func (l *LegacyMemberStore) GetSingularName() string {
	return memberResource.GetSingularName()
}

// ConvertToTable implements rest.Lister.
func (l *LegacyMemberStore) ConvertToTable(ctx context.Context, object runtime.Object, tableOptions runtime.Object) (*metav1.Table, error) {
	return memberResource.TableConverter().ConvertToTable(ctx, object, tableOptions)
}

// Get implements rest.Getter.
func (l *LegacyMemberStore) Get(ctx context.Context, name string, options *metav1.GetOptions) (runtime.Object, error) {
	ns, err := request.NamespaceInfoFrom(ctx, true)
	if err != nil {
		return nil, err
	}

	teamUID, userUID, err := parseMemberName(name)
	if err != nil {
		return nil, err
	}

	res, err := l.store.ListTeamMembers(ctx, ns, legacy.ListTeamMembersQuery{
		TeamUID: teamUID,
		UserUID: userUID,
		Limit:   1,
	})
	if err != nil {
		return nil, err
	}

	if len(res.Members) != 1 {
		return nil, resource.NewNotFound(name)
	}

	obj := mapToMemberObject(ns, res.Members[0])
	return &obj, nil
}

// List implements rest.Lister.
func (l *LegacyMemberStore) List(ctx context.Context, options *internalversion.ListOptions) (runtime.Object, error) {
	ns, err := request.NamespaceInfoFrom(ctx, true)
	if err != nil {
		return nil, err
	}

	continueID, err := common.GetContinueID(options)
	if err != nil {
		return nil, err
	}

	res, err := l.store.ListTeamMembers(ctx, ns, legacy.ListTeamMembersQuery{
		ContinueID: continueID,
		Limit:      options.Limit,
	})
	if err != nil {
		return nil, err
	}

	list := identityv0.TeamMemberList{
		Items: make([]identityv0.TeamMember, 0, len(res.Members)),
	}

	for _, b := range res.Members {
		list.Items = append(list.Items, mapToMemberObject(ns, b))
	}

	list.ListMeta.Continue = common.OptionalFormatInt(res.ContinueID)
	list.ListMeta.ResourceVersion = common.OptionalFormatInt(res.RV)

	return &list, nil
}

func mapToMemberObject(ns claims.NamespaceInfo, m legacy.TeamMember) identityv0.TeamMember {
	var permission identityv0.TeamPermission
	if m.Permission == 0 {
		permission = identityv0.TeamPermissionMember
	} else {
		permission = identityv0.TeamPermissionAdmin
	}

	return identityv0.TeamMember{
		ObjectMeta: metav1.ObjectMeta{
			Name:              formatMemberName(m),
			Namespace:         ns.Value,
			CreationTimestamp: metav1.NewTime(m.Created),
			ResourceVersion:   strconv.FormatInt(m.Updated.UnixMilli(), 10),
		},

		Spec: identityv0.TeamMemberSpec{
			TeamRef: identityv0.TeamRef{Name: m.TeamUID},
			Subject: identityv0.TeamSubject{
				Name:       m.MemberID(),
				Permission: permission,
			},
		},
	}
}

// For some reason team memberships are using dashboardaccess.PermissionType internally.
// But that enum only have View, Edit and Admin. So admin is 4 and then members are set to 0.
func mapPermisson(p int64) identityv0.TeamPermission {
	if p == 0 {
		return identityv0.TeamPermissionMember
	} else {
		return identityv0.TeamPermissionAdmin
	}
}

func formatMemberName(m legacy.TeamMember) string {
	return fmt.Sprintf("%s-%s", m.TeamUID, m.MemberID())
}

func parseMemberName(name string) (string, string, error) {
	parts := strings.Split(name, "-")
	if len(parts) != 2 {
		return "", "", errors.New("invalid team member name")
	}
	return parts[0], strings.TrimPrefix(parts[1], "user:"), nil
}
