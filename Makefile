.SUFFIXES:

SOURCE := $(shell find pkg cmd -name '*.go')

build: bin/api
	@: # shhh
.PHONY: build

dev:
	@CompileDaemon \
		-exclude-dir web \
		-build make \
		-command bin/api
.PHONY: dev

test:
	@go test ./...
.PHONY: test

generate: vendor _tools/bin/protoc-gen-tweact
	go generate .
.PHONY: generate

vendor:
	dep ensure
.PHONY: vendor

_tools/bin/%: $(SOURCE)
	go build -o $@ $*/main.go

bin/%: $(SOURCE)
	go build -o $@ cmd/$*/$*.go
