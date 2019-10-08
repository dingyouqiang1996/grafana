#!/bin/bash

# shellcheck source=./scripts/helpers/exit-if-fail.sh
source "$(dirname "$0")/helpers/exit-if-fail.sh"

# use vendor folder for packages
export GOFLAGS=-mod=vendor

echo "building backend with install to cache pkgs"
exit_if_fail time go install ./pkg/cmd/grafana-server

echo "running go test on grafana module"
set -e
time for d in $(go list ./pkg/...); do
  exit_if_fail go test -tags=integration -covermode=atomic "$d"
done

echo "running go test on sdk module"
cd pkg/plugins/sdk
time for d in $(go list ./...); do
  exit_if_fail go test -tags=integration -covermode=atomic "$d"
done
