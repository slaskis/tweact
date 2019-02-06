package demoserver

import (
	"context"

	"github.com/twitchtv/twirp"

	"github.com/slaskis/tweact/pkg/demo"
)

func (s *DemoServer) Echo(ctx context.Context, in *demo.EchoRequest) (*demo.EchoResponse, error) {
	if in.Message == "" {
		return nil, twirp.InvalidArgumentError("message", "is empty")
	}

	return &demo.EchoResponse{
		Message: in.Message + " from the server",
	}, nil
}
