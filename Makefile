.SUFFIXES:

SOURCE := $(shell find pkg cmd protoc-gen-tweact -name '*.go')
RPC := $(shell find rpc -name '*.proto')

build: bin/api
	@: # shhh
.PHONY: build

dev:
	@CompileDaemon \
		-exclude-dir web \
		-exclude-dir twirp-component \
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

generate: doc vendor _tools/bin/protoc-gen-tweact
	retool do protoc -I pkg:rpc:vendor --lint_out=. --go_out=pkg --twirp_out=pkg --tweact_out=web/rpc rpc/todos/v1/service.proto
	retool do protoc -I pkg:rpc:vendor --lint_out=. --go_out=pkg --twirp_out=pkg --tweact_out=web/rpc rpc/demo/service.proto
.PHONY: generate

vendor:
	dep ensure
.PHONY: vendor

_tools/bin/%: $(SOURCE)
	go build -o $@ $*/main.go

bin/api: $(SOURCE)
	go build -o $@ cmd/api/api.go

bin/web:
	cd web && yarn build && yarn pkg

doc/index.html: $(RPC)
	retool do protoc -I pkg:rpc:vendor --doc_out=./doc --doc_opt=markdown,index.md $^
