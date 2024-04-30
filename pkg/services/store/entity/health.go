package entity

import (
	"context"
	"time"

	grpcAuth "github.com/grpc-ecosystem/go-grpc-middleware/auth"
	"google.golang.org/grpc/health/grpc_health_v1"
)

// Compile-time assertion
var _ HealthService = &healthServer{}

type HealthService interface {
	grpc_health_v1.HealthServer
	grpcAuth.ServiceAuthFuncOverride
}

func ProvideHealthService(server EntityStoreServer) (grpc_health_v1.HealthServer, error) {
	h := &healthServer{entityServer: server}
	return h, nil
}

type healthServer struct {
	entityServer EntityStoreServer
}

// AuthFuncOverride for no auth for health service.
func (s *healthServer) AuthFuncOverride(ctx context.Context, _ string) (context.Context, error) {
	return ctx, nil
}

func (s *healthServer) Check(ctx context.Context, req *grpc_health_v1.HealthCheckRequest) (*grpc_health_v1.HealthCheckResponse, error) {
	r, err := s.entityServer.IsHealthy(ctx, &HealthCheckRequest{})
	if err != nil {
		return nil, err
	}

	return &grpc_health_v1.HealthCheckResponse{
		Status: grpc_health_v1.HealthCheckResponse_ServingStatus(r.Status.Number()),
	}, nil
}

func (s *healthServer) Watch(req *grpc_health_v1.HealthCheckRequest, stream grpc_health_v1.Health_WatchServer) error {
	h, err := s.entityServer.IsHealthy(stream.Context(), &HealthCheckRequest{})
	if err != nil {
		return err
	}

	currHealth := h.Status.Number()
	for {
		time.Sleep(5 * time.Second)

		// get current health status
		h, err := s.entityServer.IsHealthy(stream.Context(), &HealthCheckRequest{})
		if err != nil {
			return err
		}

		// if health status has not changed, continue
		if h.Status.Number() == currHealth {
			continue
		}

		// send the new health status
		err = stream.Send(&grpc_health_v1.HealthCheckResponse{
			Status: grpc_health_v1.HealthCheckResponse_ServingStatus(h.Status.Number()),
		})
		if err != nil {
			return err
		}
	}
}
