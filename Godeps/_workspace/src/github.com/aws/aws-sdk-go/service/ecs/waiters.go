// THIS FILE IS AUTOMATICALLY GENERATED. DO NOT EDIT.

package ecs

import (
	"github.com/aws/aws-sdk-go/private/waiter"
)

func (c *ECS) WaitUntilServicesInactive(input *DescribeServicesInput) error {
	waiterCfg := waiter.Config{
		Operation:   "DescribeServices",
		Delay:       15,
		MaxAttempts: 40,
		Acceptors: []waiter.WaitAcceptor{
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "failures[].reason",
				Expected: "MISSING",
			},
			{
				State:    "success",
				Matcher:  "pathAny",
				Argument: "services[].status",
				Expected: "INACTIVE",
			},
		},
	}

	w := waiter.Waiter{
		Client: c,
		Input:  input,
		Config: waiterCfg,
	}
	return w.Wait()
}

func (c *ECS) WaitUntilServicesStable(input *DescribeServicesInput) error {
	waiterCfg := waiter.Config{
		Operation:   "DescribeServices",
		Delay:       15,
		MaxAttempts: 40,
		Acceptors: []waiter.WaitAcceptor{
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "failures[].reason",
				Expected: "MISSING",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "services[].status",
				Expected: "DRAINING",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "services[].status",
				Expected: "INACTIVE",
			},
			{
				State:    "success",
				Matcher:  "path",
				Argument: "services | [@[?length(deployments)!=`1`], @[?desiredCount!=runningCount]][] | length(@) == `0`",
				Expected: true,
			},
		},
	}

	w := waiter.Waiter{
		Client: c,
		Input:  input,
		Config: waiterCfg,
	}
	return w.Wait()
}

func (c *ECS) WaitUntilTasksRunning(input *DescribeTasksInput) error {
	waiterCfg := waiter.Config{
		Operation:   "DescribeTasks",
		Delay:       6,
		MaxAttempts: 100,
		Acceptors: []waiter.WaitAcceptor{
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "tasks[].lastStatus",
				Expected: "STOPPED",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "failures[].reason",
				Expected: "MISSING",
			},
			{
				State:    "success",
				Matcher:  "pathAll",
				Argument: "tasks[].lastStatus",
				Expected: "RUNNING",
			},
		},
	}

	w := waiter.Waiter{
		Client: c,
		Input:  input,
		Config: waiterCfg,
	}
	return w.Wait()
}

func (c *ECS) WaitUntilTasksStopped(input *DescribeTasksInput) error {
	waiterCfg := waiter.Config{
		Operation:   "DescribeTasks",
		Delay:       6,
		MaxAttempts: 100,
		Acceptors: []waiter.WaitAcceptor{
			{
				State:    "success",
				Matcher:  "pathAll",
				Argument: "tasks[].lastStatus",
				Expected: "STOPPED",
			},
		},
	}

	w := waiter.Waiter{
		Client: c,
		Input:  input,
		Config: waiterCfg,
	}
	return w.Wait()
}
