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

generate: vendor
	go generate .
.PHONY: generate

vendor:
	dep ensure
.PHONY: vendor

bin/%: $(SOURCE)
	go build -o $@ cmd/$*/$*.go
