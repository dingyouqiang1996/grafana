package zanzana

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	openfgav1 "github.com/openfga/api/proto/openfga/v1"
	httpmiddleware "github.com/openfga/openfga/pkg/middleware/http"
	"github.com/openfga/openfga/pkg/server"
	serverErrors "github.com/openfga/openfga/pkg/server/errors"
	"github.com/openfga/openfga/pkg/storage"
	"github.com/rs/cors"
	"go.uber.org/zap/zapcore"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	healthv1pb "google.golang.org/grpc/health/grpc_health_v1"
	"google.golang.org/grpc/status"

	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/services/grpcserver"
)

func NewServer(store storage.OpenFGADatastore, logger log.Logger) (*server.Server, error) {
	// FIXME(kalleep): add support for more options, tracing etc
	opts := []server.OpenFGAServiceV1Option{
		server.WithDatastore(store),
		server.WithLogger(newZanzanaLogger(logger)),
	}

	// FIXME(kalleep): Interceptors
	// We probably need to at least need to add store id interceptor also
	// would be nice to inject our own requestid?
	srv, err := server.NewServerWithOpts(opts...)
	if err != nil {
		return nil, err
	}

	return srv, nil
}

// StartOpenFGAHttpSever starts HTTP server which allows to use fga cli.
func StartOpenFGAHttpSever(srv grpcserver.Provider, logger log.Logger) error {
	dialOpts := []grpc.DialOption{
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	}

	addr := srv.GetAddress()
	// Wait until GRPC server is initialized
	ticker := time.Tick(100 * time.Millisecond)
	maxRetries := 100
	retries := 0
	for addr == "" && retries < maxRetries {
		<-ticker
		addr = srv.GetAddress()
		retries++
	}
	if addr == "" {
		return fmt.Errorf("failed to start HTTP server: GRPC server unavailable")
	}

	conn, err := grpc.NewClient(addr, dialOpts...)
	if err != nil {
		return fmt.Errorf("Unable to dial GRPC: %w", err)
	}

	muxOpts := []runtime.ServeMuxOption{
		runtime.WithForwardResponseOption(httpmiddleware.HTTPResponseModifier),
		runtime.WithErrorHandler(func(c context.Context,
			sr *runtime.ServeMux, mm runtime.Marshaler, w http.ResponseWriter, r *http.Request, e error) {
			intCode := serverErrors.ConvertToEncodedErrorCode(status.Convert(e))
			httpmiddleware.CustomHTTPErrorHandler(c, w, r, serverErrors.NewEncodedError(intCode, e.Error()))
		}),
		runtime.WithStreamErrorHandler(func(ctx context.Context, e error) *status.Status {
			intCode := serverErrors.ConvertToEncodedErrorCode(status.Convert(e))
			encodedErr := serverErrors.NewEncodedError(intCode, e.Error())
			return status.Convert(encodedErr)
		}),
		runtime.WithHealthzEndpoint(healthv1pb.NewHealthClient(conn)),
		runtime.WithOutgoingHeaderMatcher(func(s string) (string, bool) { return s, true }),
	}
	mux := runtime.NewServeMux(muxOpts...)
	if err := openfgav1.RegisterOpenFGAServiceHandler(context.TODO(), mux, conn); err != nil {
		return fmt.Errorf("failed to register gateway handler: %w", err)
	}

	httpServer := &http.Server{
		Addr: "127.0.0.1:8080",
		Handler: cors.New(cors.Options{
			AllowedOrigins:   []string{"*"},
			AllowCredentials: true,
			AllowedHeaders:   []string{"*"},
			AllowedMethods: []string{http.MethodGet, http.MethodPost,
				http.MethodHead, http.MethodPatch, http.MethodDelete, http.MethodPut},
		}).Handler(mux),
	}
	go func() {
		err = httpServer.ListenAndServe()
		if err != nil {
			logger.Error("failed to start http server", zapcore.Field{Key: "err", Type: zapcore.ErrorType, Interface: err})
		}
	}()
	logger.Info(fmt.Sprintf("OpenFGA HTTP server listening on '%s'...", httpServer.Addr))
	return nil
}
