package models

import (
	"time"
)

type LoginAttempt struct {
	Id        int64
	Username  string
	IpAddress string
	Created   time.Time
}

// ---------------------
// COMMANDS

type CreateLoginAttemptCommand struct {
	Username  string
	IpAddress string

	Result LoginAttempt
}

