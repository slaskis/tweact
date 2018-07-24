package generator

import (
	"bytes"
	"path/filepath"
	"strings"

	"github.com/golang/protobuf/protoc-gen-go/descriptor"
	plugin "github.com/golang/protobuf/protoc-gen-go/plugin"
)

func CreateClientAPI(d *descriptor.FileDescriptorProto) ([]*plugin.CodeGeneratorResponse_File, error) {
	var files []*plugin.CodeGeneratorResponse_File
	pkg := d.GetPackage()

	// useful for debugging comments...
	// fmt.Fprintf(os.Stderr, "source location comments for %s:\n", d.GetName())
	// for _, loc := range d.SourceCodeInfo.Location {
	// 	var path []string
	// 	for _, p := range loc.GetPath() {
	// 		path = append(path, strconv.Itoa(int(p)))
	// 	}
	// 	fmt.Fprintf(os.Stderr, "- %s: %s\n", path, location(loc))
	// }

	// services are separate files and contains methods
	for _, svc := range d.Service {
		buf := bytes.NewBuffer(nil)

		// inject the header with runtime requirements
		// and file/service comments
		err := headerTemplate.Execute(buf, header{
			Source:  d.GetName(),
			Comment: writeComments(FileComments(d)) + writeComments(ServiceComments(d, svc)),
		})
		if err != nil {
			return nil, err
		}

		// messages can be shared between services
		// (and are also only interfaces)
		// TODO move into shared file?
		for _, msg := range d.MessageType {
			var fields []field
			for _, f := range msg.Field {
				fields = append(fields, field{
					Name:    f.GetJsonName(),
					Type:    toTSType(f),
					Comment: writeComments(FieldComments(d, msg, f)),
				})
			}
			err := messageTemplate.Execute(buf, message{
				Name:    *msg.Name,
				Fields:  fields,
				Comment: writeComments(MessageComments(d, msg)),
			})
			if err != nil {
				return nil, err
			}
		}

		for _, e := range d.EnumType {
			var value []enumValue
			for _, v := range e.Value {
				value = append(value, enumValue{
					Name:    v.GetName(),
					Number:  v.GetNumber(),
					Comment: writeComments(EnumValueComments(d, e, v)),
				})
			}
			err := enumTemplate.Execute(buf, enum{
				Name:    e.GetName(),
				Value:   value,
				Comment: writeComments(EnumComments(d, e)),
			})
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
				Comment:    writeComments(MethodComments(d, svc, met)),
			})
			if err != nil {
				return nil, err
			}
		}
		content := buf.String()

		name := filepath.Join(packageToPath(d.GetPackage()), svc.GetName()) + ".ts"
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

func scrub(str string) string {
	return strings.TrimSpace(strings.Replace(str, "\n ", "\n", -1))
}

func location(loc *descriptor.SourceCodeInfo_Location) string {
	comment := strings.TrimSpace(loc.GetLeadingComments()) + "\n"
	for _, l := range loc.GetLeadingDetachedComments() {
		comment += strings.TrimSpace(l) + "\n"
	}
	comment += strings.TrimSpace(loc.GetTrailingComments()) + "\n"
	return strings.Replace(comment, "\n", "", -1)
}

func writeComments(comments []string) string {
	// TODO filter out empty lines?
	if len(comments) == 0 {
		return ""
	}
	var lines []string
	for _, comment := range comments {
		for _, line := range strings.Split(comment, "\n") {
			if strings.TrimSpace(line) == "" {
				continue
			}
			lines = append(lines, strings.TrimSpace(line))
		}
	}
	str := ""
	if len(lines) > 0 {
		str += "\n/**\n"
		for _, line := range lines {
			str += " * " + strings.TrimSpace(line) + "\n"
		}
		str += " */"
	}
	return str
}
