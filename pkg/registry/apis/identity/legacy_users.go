package identity

import (
	"context"
	"fmt"
	"strconv"

	"github.com/grafana/authlib/claims"
	common "github.com/grafana/grafana/pkg/apimachinery/apis/common/v0alpha1"
	identity "github.com/grafana/grafana/pkg/apimachinery/apis/identity/v0alpha1"
	"github.com/grafana/grafana/pkg/apimachinery/utils"
	"github.com/grafana/grafana/pkg/services/user"
	"k8s.io/apimachinery/pkg/apis/meta/internalversion"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apiserver/pkg/endpoints/request"
	"k8s.io/apiserver/pkg/registry/rest"
)

var (
	_ rest.Scoper               = (*legacyUserStorage)(nil)
	_ rest.SingularNameProvider = (*legacyUserStorage)(nil)
	_ rest.Getter               = (*legacyUserStorage)(nil)
	_ rest.Lister               = (*legacyUserStorage)(nil)
	_ rest.Storage              = (*legacyUserStorage)(nil)
)

type legacyUserStorage struct {
	service        LegacyUserStore
	tableConverter rest.TableConvertor
	resourceInfo   common.ResourceInfo
}

func (s *legacyUserStorage) New() runtime.Object {
	return s.resourceInfo.NewFunc()
}

func (s *legacyUserStorage) Destroy() {}

func (s *legacyUserStorage) NamespaceScoped() bool {
	return true // namespace == org
}

func (s *legacyUserStorage) GetSingularName() string {
	return s.resourceInfo.GetSingularName()
}

func (s *legacyUserStorage) NewList() runtime.Object {
	return s.resourceInfo.NewListFunc()
}

func (s *legacyUserStorage) ConvertToTable(ctx context.Context, object runtime.Object, tableOptions runtime.Object) (*metav1.Table, error) {
	return s.tableConverter.ConvertToTable(ctx, object, tableOptions)
}

func (s *legacyUserStorage) List(ctx context.Context, options *internalversion.ListOptions) (runtime.Object, error) {
	ns := request.NamespaceValue(ctx)
	var startId int64
	var err error
	if options.Continue != "" {
		startId, err = strconv.ParseInt(options.Continue, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("invalid continue token")
		}
	}

	found, err := s.service.ListUsers(ctx, ns, claims.TypeUser, LegacyPaging{
		Start: startId,
		Limit: 100,
	})
	if err != nil {
		return nil, err
	}

	list := &identity.UserList{}
	for _, item := range found.Users {
		list.Items = append(list.Items, *toUserItem(item, ns))
	}
	if found.ContinueID > 0 {
		list.ListMeta.Continue = strconv.FormatInt(found.ContinueID, 10)
	}
	if found.RV > 0 {
		list.ListMeta.ResourceVersion = strconv.FormatInt(found.RV, 10)
	}
	return list, err
}

func toUserItem(u *user.User, ns string) *identity.User {
	item := &identity.User{
		ObjectMeta: metav1.ObjectMeta{
			Name:              u.UID,
			Namespace:         ns,
			ResourceVersion:   fmt.Sprintf("%d", u.Updated.UnixMilli()),
			CreationTimestamp: metav1.NewTime(u.Created),
		},
		Spec: identity.UserSpec{
			Name:          u.Name,
			Login:         u.Login,
			Email:         u.Email,
			EmailVerified: u.EmailVerified,
			Disabled:      u.IsDisabled,
		},
	}
	obj, _ := utils.MetaAccessor(item)
	obj.SetUpdatedTimestamp(&u.Updated)
	obj.SetOriginInfo(&utils.ResourceOriginInfo{
		Name: "SQL",
		Path: strconv.FormatInt(u.ID, 10),
	})
	return item
}

func (s *legacyUserStorage) Get(ctx context.Context, name string, options *metav1.GetOptions) (runtime.Object, error) {
	ns := request.NamespaceValue(ctx)
	found, err := s.service.GetUser(ctx, ns, claims.TypeUser, name)
	if found == nil || err != nil {
		return nil, s.resourceInfo.NewNotFound(name)
	}
	if found == nil || err != nil {
		return nil, s.resourceInfo.NewNotFound(name)
	}
	return toUserItem(found, ns), nil
}
