package main

import (
	"errors"
	"flag"
	"fmt"
	"net/http"
	_ "net/http/pprof"
	"os"
	"os/signal"
	"runtime"
	"runtime/trace"
	"strconv"
	"syscall"
	"time"

	"github.com/grafana/grafana/pkg/extensions"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/infra/metrics"
	_ "github.com/grafana/grafana/pkg/services/alerting/conditions"
	_ "github.com/grafana/grafana/pkg/services/alerting/notifiers"
	"github.com/grafana/grafana/pkg/setting"
	_ "github.com/grafana/grafana/pkg/tsdb/azuremonitor"
	_ "github.com/grafana/grafana/pkg/tsdb/cloudwatch"
	_ "github.com/grafana/grafana/pkg/tsdb/elasticsearch"
	_ "github.com/grafana/grafana/pkg/tsdb/graphite"
	_ "github.com/grafana/grafana/pkg/tsdb/influxdb"
	_ "github.com/grafana/grafana/pkg/tsdb/mysql"
	_ "github.com/grafana/grafana/pkg/tsdb/opentsdb"
	_ "github.com/grafana/grafana/pkg/tsdb/postgres"
	_ "github.com/grafana/grafana/pkg/tsdb/prometheus"
	_ "github.com/grafana/grafana/pkg/tsdb/stackdriver"
	_ "github.com/grafana/grafana/pkg/tsdb/testdatasource"
)

var version = "5.0.0"
var commit = "NA"
var buildBranch = "master"
var buildstamp string

func getProfilingProps(profileFlag bool, profilePortFlag uint) (bool, uint, error) {
	profileEnabled := profileFlag
	profilePort := profilePortFlag
	profileEnv := os.Getenv("GF_PROCESS_PROFILE")
	if profileEnv != "" {
		enabled, parseErr := strconv.ParseBool(profileEnv)
		if parseErr != nil {
			return false, 0, errors.New("Failed to parse GF_PROCESS_PROFILE environment variable")
		}
		profileEnabled = enabled
		profilePortEnv := os.Getenv("GF_PROCESS_PROFILE_PORT")
		if profilePortEnv != "" {
			port, parseErr := strconv.ParseUint(profilePortEnv, 0, 64)
			if parseErr != nil {
				return false, 0, errors.New("Failed to parse GF_PROCESS_PROFILE_PORT enviroment variable")
			}
			profilePort = uint(port)
		}
	}
	return profileEnabled, profilePort, nil
}

func getTracingProps(tracingFlag bool, tracingFileFlag string) (bool, string, error) {
	tracingEnabled := tracingFlag
	tracingFile := tracingFileFlag
	tracingEnv := os.Getenv("GF_PROCESS_TRACING")
	if tracingEnv != "" {
		enabled, parseErr := strconv.ParseBool(tracingEnv)
		if parseErr != nil {
			return false, "", errors.New("Failed to parse GF_PROCESS_TRACING environment variable")
		}
		tracingEnabled = enabled
		tracingFileEnv := os.Getenv("GF_PROCESS_TRACING_FILE")
		if tracingFileEnv != "" {
			tracingFile = tracingFileEnv
		}
	}
	return tracingEnabled, tracingFile, nil
}

func main() {
	var (
		configFile = flag.String("config", "", "path to config file")
		homePath   = flag.String("homepath", "", "path to grafana install/home path, defaults to working directory")
		pidFile    = flag.String("pidfile", "", "path to pid file")
		packaging  = flag.String("packaging", "unknown", "describes the way Grafana was installed")

		v           = flag.Bool("v", false, "prints current version and exits")
		profile     = flag.Bool("profile", false, "Turn on pprof profiling")
		profilePort = flag.Uint("profile-port", 6060, "Define custom port for profiling")
		tracing     = flag.Bool("tracing", false, "Turn on tracing")
		tracingFile = flag.String("tracing-file", "trace.out", "Define tracing output file")
	)

	flag.Parse()

	if *v {
		fmt.Printf("Version %s (commit: %s, branch: %s)\n", version, commit, buildBranch)
		os.Exit(0)
	}

	finalProfileEnabled, finalProfilePort, err := getProfilingProps(*profile, *profilePort)
	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}

	finalTracingEnabled, finalTracingFile, err := getTracingProps(*tracing, *tracingFile)
	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}

	if finalProfileEnabled {
		runtime.SetBlockProfileRate(1)
		go func() {
			err := http.ListenAndServe(fmt.Sprintf("localhost:%d", finalProfilePort), nil)
			if err != nil {
				panic(err)
			}
		}()
	}

	if finalTracingEnabled {
		f, err := os.Create(finalTracingFile)
		if err != nil {
			panic(err)
		}
		defer f.Close()

		err = trace.Start(f)
		if err != nil {
			panic(err)
		}
		defer trace.Stop()
	}

	buildstampInt64, _ := strconv.ParseInt(buildstamp, 10, 64)
	if buildstampInt64 == 0 {
		buildstampInt64 = time.Now().Unix()
	}

	setting.BuildVersion = version
	setting.BuildCommit = commit
	setting.BuildStamp = buildstampInt64
	setting.BuildBranch = buildBranch
	setting.IsEnterprise = extensions.IsEnterprise
	setting.Packaging = validPackaging(*packaging)

	metrics.SetBuildInformation(version, commit, buildBranch)

	server := NewServer(*configFile, *homePath, *pidFile)

	go listenToSystemSignals(server)

	err = server.Run()

	code := server.ExitCode(err)
	trace.Stop()
	log.Close()

	os.Exit(code)
}

func validPackaging(packaging string) string {
	validTypes := []string{"dev", "deb", "rpm", "docker", "brew", "hosted", "unknown"}
	for _, vt := range validTypes {
		if packaging == vt {
			return packaging
		}
	}
	return "unknown"
}

func listenToSystemSignals(server *Server) {
	signalChan := make(chan os.Signal, 1)
	sighupChan := make(chan os.Signal, 1)

	signal.Notify(sighupChan, syscall.SIGHUP)
	signal.Notify(signalChan, os.Interrupt, syscall.SIGTERM)

	for {
		select {
		case <-sighupChan:
			log.Reload()
		case sig := <-signalChan:
			server.Shutdown(fmt.Sprintf("System signal: %s", sig))
		}
	}
}
