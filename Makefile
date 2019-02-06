.SUFFIXES:

SOURCE_GO := $(shell find pkg cmd -name '*.go')
SOURCE_PROTO := $(shell find rpc -name '*.proto')

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

generate: doc vendor
	retool do protoc -I pkg:rpc:vendor --lint_out=. --go_out=pkg --twirp_out=pkg --gotemplate_out=all=true,debug=true,template_dir=./templates:web/rpc/. rpc/todos/v1/*.proto
	retool do protoc -I pkg:rpc:vendor --lint_out=. --go_out=pkg --twirp_out=pkg --gotemplate_out=all=true,debug=true,template_dir=./templates:web/rpc/. rpc/demo/*.proto
.PHONY: generate

vendor:
	dep ensure
.PHONY: vendor

_tools/bin/%: $(SOURCE_GO)
	go build -o $@ $*/main.go

bin/api: $(SOURCE_GO)
	go build -o $@ cmd/api/api.go

bin/web:
	cd web && yarn build && yarn pkg

doc/index.html: $(SOURCE_PROTO)
	retool do protoc -I pkg:rpc:vendor --doc_out=./doc --doc_opt=markdown,index.md $^
