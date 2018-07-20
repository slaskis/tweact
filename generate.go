//go:generate retool do protoc -I pkg:rpc:vendor --lint_out=pkg --go_out=pkg --twirp_out=pkg --tweact_out=web/rpc rpc/todos/v1/service.proto

package main
