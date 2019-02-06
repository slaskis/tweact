.SUFFIXES:

SOURCE_GO := $(shell find api -name '*.go')
SOURCE_PROTO := $(shell find rpc -name '*.proto')

build: bin/api
	@: # shhh
.PHONY: build

dev:
	@CompileDaemon \
		-exclude-dir web \
		-exclude-dir doc \
		-exclude-dir rpc \
		-build make \
		-command bin/api
.PHONY: dev

doc: doc/index.html
	@: # shhh
.PHONY: doc

test:
	@go test ./...
.PHONY: test

generate: doc vendor
	retool do protoc -I api:rpc:api/vendor --lint_out=. --go_out=api --twirp_out=api --gotemplate_out=all=true:web/rpc/. rpc/todos/v1/*.proto
	retool do protoc -I api:rpc:api/vendor --lint_out=. --go_out=api --twirp_out=api --gotemplate_out=all=true:web/rpc/. rpc/demo/*.proto
.PHONY: generate

vendor:
	cd api && dep ensure
.PHONY: vendor

bin/api: $(SOURCE_GO)
	go build -o $@ api/cmd/api/api.go

doc/index.html: $(SOURCE_PROTO)
	retool do protoc -I api:rpc:api/vendor --doc_out=./doc --doc_opt=markdown,index.md $^
