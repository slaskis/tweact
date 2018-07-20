package generator

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"text/template"

	"github.com/golang/protobuf/protoc-gen-go/descriptor"
	plugin "github.com/golang/protobuf/protoc-gen-go/plugin"
)

type field struct {
	Name string
	Type string
}

type message struct {
	Name   string
	Fields []field
}

var messageTemplate = template.Must(template.New("message").Parse(`
export interface {{.Name}} {
  {{- range .Fields}}
  {{.Name}}: {{.Type}};
  {{- end}}
}`))

var enumTemplate = template.Must(template.New("enum").Parse(`
export enum {{.Name}} {
  {{- range .Value}}
  {{.Name}} = {{.Number}},
  {{- end}}
}`))

type method struct {
	Name       string
	InputType  string
	OutputType string
	Package    string
	Service    string
}

var methodTemplate = template.Must(template.New("method").Parse(`
export const {{.Name}} = withTwirp(
  class {{.Name}} extends TwirpService<{{.InputType}}, {{.OutputType}}> {
    constructor(props: any) {
      super("{{.Package}}.{{.Service}}/{{.Name}}", props);
    }
  }
);`))

func CreateClientAPI(d *descriptor.FileDescriptorProto) ([]*plugin.CodeGeneratorResponse_File, error) {
	var files []*plugin.CodeGeneratorResponse_File
	pkg := d.GetPackage()
	dir := packageToPath(pkg)
	err := os.MkdirAll(dir, os.ModePerm)
	if err != nil {
		return nil, err
	}

	// services are separate files and contains methods
	for _, svc := range d.Service {
		buf := bytes.NewBuffer(nil)

		// inject the runtime requirements
		buf.WriteString(`import { withTwirp, TwirpService } from "./twirp";` + "\n")

		// messages can be shared between services
		// (and are also only interfaces)
		// TODO move into shared file?
		for _, msg := range d.MessageType {
			var fields []field
			for _, f := range msg.Field {
				fields = append(fields, field{
					Name: f.GetJsonName(),
					Type: toTSType(f),
				})
			}
			err := messageTemplate.Execute(buf, message{
				Name:   *msg.Name,
				Fields: fields,
			})
			if err != nil {
				return nil, err
			}
		}

		// TODO also enums?
		for _, enum := range d.EnumType {
			err := enumTemplate.Execute(buf, enum)
			if err != nil {
				return nil, err
			}
		}

		buf.WriteString("\n")

		for _, met := range svc.GetMethod() {
			err := methodTemplate.Execute(buf, method{
				Package:    pkg,
				Service:    *svc.Name,
				InputType:  removePkg(*met.InputType),
				OutputType: removePkg(*met.OutputType),
				Name:       *met.Name,
			})
			if err != nil {
				return nil, err
			}
		}
		content := buf.String()
		name := svc.GetName() + ".ts"
		file := plugin.CodeGeneratorResponse_File{
			Name:    &name,
			Content: &content,
		}
		files = append(files, &file)
	}

	return files, nil
}

func toTSType(f *descriptor.FieldDescriptorProto) string {
	tsType := "string"

	switch f.GetType() {
	case descriptor.FieldDescriptorProto_TYPE_DOUBLE,
		descriptor.FieldDescriptorProto_TYPE_FIXED32,
		descriptor.FieldDescriptorProto_TYPE_FIXED64,
		descriptor.FieldDescriptorProto_TYPE_INT32,
		descriptor.FieldDescriptorProto_TYPE_INT64:
		tsType = "number"
	case descriptor.FieldDescriptorProto_TYPE_STRING:
		tsType = "string"
	case descriptor.FieldDescriptorProto_TYPE_BOOL:
		tsType = "boolean"
	case descriptor.FieldDescriptorProto_TYPE_MESSAGE,
		descriptor.FieldDescriptorProto_TYPE_ENUM:
		name := f.GetTypeName()

		// Google WKT Timestamp is a special case here:
		//
		// Currently the value will just be left as jsonpb RFC 3339 string.
		// JSON.stringify already handles serializing Date to its RFC 3339 format.
		//
		if name == ".google.protobuf.Timestamp" {
			tsType = "Date"
		} else {
			tsType = removePkg(name)
		}
	}

	if isRepeated(f) {
		tsType = tsType + "[]"
	}

	return tsType
}

func packageToPath(pkg string) string {
	return filepath.Join(strings.Split(pkg, ".")...)
}

func removePkg(s string) string {
	p := strings.Split(s, ".")
	return p[len(p)-1]
}

func isRepeated(field *descriptor.FieldDescriptorProto) bool {
	return field.Label != nil && *field.Label == descriptor.FieldDescriptorProto_LABEL_REPEATED
}
