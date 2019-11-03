.SUFFIXES:

SOURCE = $(shell find pkg cmd protoc-gen-tweact -name '*.go')
RPC = $(shell find rpc -name '*.proto')
GO_TOOLS = $(shell grep _ tools.go | cut -d\" -f 2)
GO_TOOLS_DIR = _tools/bin/
GO_TOOLS_BIN = $(addprefix $(GO_TOOLS_DIR), $(notdir $(GO_TOOLS)))

export PATH:=${PWD}/${GO_TOOLS_DIR}:${PATH}

build: bin/api
	@: # shhh
.PHONY: build

dev:
	CompileDaemon \
		-exclude-dir web \
		-build make \
		-command bin/api
.PHONY: dev

doc: doc/index.html
	@: # shhh
.PHONY: doc

test:
	@go test ./...
.PHONY: test

generate: doc vendor tools
	protoc -I pkg:rpc:vendor --lint_out=. --go_out=pkg --twirp_out=pkg --tweact_out=web/rpc rpc/todos/v1/service.proto
	protoc -I pkg:rpc:vendor --lint_out=. --go_out=pkg --twirp_out=pkg --tweact_out=web/rpc rpc/demo/service.proto
.PHONY: generate

tools: $(GO_TOOLS_DIR) $(GO_TOOLS_BIN)
	@:
.PHONY: tools

$(GO_TOOLS_DIR):
	@mkdir -p $@

$(GO_TOOLS_BIN):
	GOBIN=${PWD}/${GO_TOOLS_DIR} go install ${GO_TOOLS}

bin/api: $(SOURCE)
	go build -o $@ cmd/api/api.go

bin/web:
	cd web && yarn build && yarn pkg

doc/index.html: $(RPC)
	protoc -I pkg:rpc:vendor --doc_out=./doc --doc_opt=markdown,index.md $^
