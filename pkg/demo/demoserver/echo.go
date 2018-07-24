package demoserver

import (
	"context"

	"github.com/slaskis/tweact/pkg/demo"
)

func (s *DemoServer) Echo(ctx context.Context, in *demo.EchoRequest) (*demo.EchoResponse, error) {
	return &demo.EchoResponse{
		Message: in.Message,
	}, nil
}
