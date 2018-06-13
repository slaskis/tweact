//go:generate protoc -I pkg:rpc:vendor --lint_out=pkg --gogofast_out=pkg --twirp_out=pkg rpc/todos/v1/service.proto

package main
