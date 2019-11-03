// +build tools
package tools

import (
	_ "github.com/ckaznocha/protoc-gen-lint"
	_ "github.com/golang/protobuf/protoc-gen-go"
	_ "github.com/pseudomuto/protoc-gen-doc/cmd/protoc-gen-doc"
	_ "github.com/twitchtv/twirp/protoc-gen-twirp"
	_ "moul.io/protoc-gen-gotemplate"
)
