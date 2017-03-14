package models

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"
)

// Typed errors
var (
	ErrInvalidRoleType     = errors.New("Invalid role type")
	ErrLastOrgAdmin        = errors.New("Cannot remove last organization admin")
	ErrOrgUserNotFound     = errors.New("Cannot find the organization user")
	ErrOrgUserAlreadyAdded = errors.New("User is already added to organization")
)

type RoleType string

const (
	ROLE_VIEWER           RoleType = "Viewer"
	ROLE_EDITOR           RoleType = "Editor"
	ROLE_READ_ONLY_EDITOR RoleType = "Read Only Editor"
	ROLE_ADMIN            RoleType = "Admin"
)

func (r RoleType) IsValid() bool {
	return r == ROLE_VIEWER || r == ROLE_ADMIN || r == ROLE_EDITOR || r == ROLE_READ_ONLY_EDITOR
}

func (r RoleType) Includes(other RoleType) bool {
	if r == ROLE_ADMIN {
		return true
	}
	if r == ROLE_EDITOR || r == ROLE_READ_ONLY_EDITOR {
		return other != ROLE_ADMIN
	}

	return r == other
}

func (r *RoleType) UnmarshalJSON(data []byte) error {
	var str string
	err := json.Unmarshal(data, &str)
	if err != nil {
		return err
	}

	*r = RoleType(str)

	if (*r).IsValid() == false {
		if (*r) != "" {
			return errors.New(fmt.Sprintf("JSON validation error: invalid role value: %s", *r))
		}

		*r = ROLE_VIEWER
	}

	return nil
}

type OrgUser struct {
	Id      int64
	OrgId   int64
	UserId  int64
	Role    RoleType
	Created time.Time
	Updated time.Time
}

// ---------------------
// COMMANDS

type RemoveOrgUserCommand struct {
	UserId int64
	OrgId  int64
}

type AddOrgUserCommand struct {
	LoginOrEmail string   `json:"loginOrEmail" binding:"Required"`
	Role         RoleType `json:"role" binding:"Required"`

	OrgId  int64 `json:"-"`
	UserId int64 `json:"-"`
}

type UpdateOrgUserCommand struct {
	Role RoleType `json:"role" binding:"Required"`

	OrgId  int64 `json:"-"`
	UserId int64 `json:"-"`
}

// ----------------------
// QUERIES

type GetOrgUsersQuery struct {
	OrgId  int64
	Result []*OrgUserDTO
}

// ----------------------
// Projections and DTOs

type OrgUserDTO struct {
	OrgId  int64  `json:"orgId"`
	UserId int64  `json:"userId"`
	Email  string `json:"email"`
	Login  string `json:"login"`
	Role   string `json:"role"`
}
