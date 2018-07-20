package main

import (
	"io"
	"io/ioutil"
	"os"

	"github.com/golang/protobuf/proto"
	plugin "github.com/golang/protobuf/protoc-gen-go/plugin"
	"github.com/slaskis/tweact/protoc-gen-tweact/generator"
)

func main() {
	req := read(os.Stdin)
	res := gen(req)
	write(res, os.Stdout)
}

func read(r io.Reader) *plugin.CodeGeneratorRequest {
	data, err := ioutil.ReadAll(r)
	if err != nil {
		panic(err)
	}

	req := new(plugin.CodeGeneratorRequest)
	if err = proto.Unmarshal(data, req); err != nil {
		panic(err)
	}

	if len(req.FileToGenerate) == 0 {
		panic(err)
	}

	return req
}

func gen(req *plugin.CodeGeneratorRequest) *plugin.CodeGeneratorResponse {

	resp := &plugin.CodeGeneratorResponse{}

	for _, f := range req.GetProtoFile() {
		// skip google/protobuf/timestamp, we don't do any special serialization for jsonpb.
		if *f.Name == "google/protobuf/timestamp.proto" {
			continue
		}

		cf, err := generator.CreateClientAPI(f)
		if err != nil {
			resp.Error = proto.String(err.Error())
			return resp
		}

		resp.File = append(resp.File, cf...)
	}

	return resp
}

func write(res *plugin.CodeGeneratorResponse, w io.Writer) {
	data, err := proto.Marshal(res)
	if err != nil {
		panic(err)
	}
	w.Write(data)
}
