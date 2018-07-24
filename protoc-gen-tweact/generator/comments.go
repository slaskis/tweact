package generator

import (
	"strconv"
	"strings"

	"github.com/golang/protobuf/protoc-gen-go/descriptor"
)

func FileComments(file *descriptor.FileDescriptorProto) []string {
	var comments []string
	return append(
		comments,
		commentsAtPath([]int32{syntaxCommentPath}, file),
		commentsAtPath([]int32{packageCommentPath}, file),
	)
}

func ServiceComments(file *descriptor.FileDescriptorProto, svc *descriptor.ServiceDescriptorProto) []string {
	var comments []string
	for i, s := range file.Service {
		if s == svc {
			path := []int32{serviceCommentPath, int32(i)}
			comments = append(comments, commentsAtPath(path, file))
		}
	}
	return comments
}

func MethodComments(file *descriptor.FileDescriptorProto, svc *descriptor.ServiceDescriptorProto, method *descriptor.MethodDescriptorProto) []string {
	var comments []string
	for i, s := range file.Service {
		if s == svc {
			path := []int32{serviceCommentPath, int32(i)}
			for j, m := range s.Method {
				if m == method {
					path = append(path, serviceMethodCommentPath, int32(j))
					comments = append(comments, commentsAtPath(path, file))
				}
			}
		}
	}
	return comments
}

func MessageComments(file *descriptor.FileDescriptorProto, msg *descriptor.DescriptorProto) []string {
	var comments []string
	for i, m := range file.MessageType {
		if m == msg {
			path := []int32{messageCommentPath, int32(i)}
			comments = append(comments, commentsAtPath(path, file))
		}
	}
	return comments
}

func FieldComments(file *descriptor.FileDescriptorProto, msg *descriptor.DescriptorProto, field *descriptor.FieldDescriptorProto) []string {
	var comments []string
	for i, m := range file.MessageType {
		if m == msg {
			path := []int32{messageCommentPath, int32(i)}
			for j, f := range m.Field {
				if f == field {
					path = append(path, messageFieldCommentPath, int32(j))
					comments = append(comments, commentsAtPath(path, file))
					break
				}
			}
		}
	}
	return comments
}

func EnumComments(file *descriptor.FileDescriptorProto, enum *descriptor.EnumDescriptorProto) []string {
	var comments []string
	for i, e := range file.EnumType {
		if e == enum {
			path := []int32{enumCommentPath, int32(i)}
			comments = append(comments, commentsAtPath(path, file))
		}
	}
	return comments
}

func EnumValueComments(file *descriptor.FileDescriptorProto, enum *descriptor.EnumDescriptorProto, value *descriptor.EnumValueDescriptorProto) []string {
	var comments []string
	for i, e := range file.EnumType {
		if e == enum {
			path := []int32{enumCommentPath, int32(i)}
			for j, v := range e.Value {
				if v == value {
					path = append(path, enumValueCommentPath, int32(j))
					comments = append(comments, commentsAtPath(path, file))
				}
			}
		}
	}
	return comments
}

func commentsAtPath(path []int32, sourceFile *descriptor.FileDescriptorProto) string {
	if sourceFile.SourceCodeInfo == nil {
		// The compiler didn't provide us with comments.
		return ""
	}

	var spath []string
	for _, p := range path {
		spath = append(spath, strconv.Itoa(int(p)))
	}

	for _, loc := range sourceFile.SourceCodeInfo.Location {
		if pathEqual(path, loc.Path) {
			comment := strings.TrimSpace(loc.GetLeadingComments()) + "\n"
			for _, l := range loc.GetLeadingDetachedComments() {
				comment += strings.TrimSpace(l) + "\n"
			}
			comment += strings.TrimSpace(loc.GetTrailingComments()) + "\n"
			// fmt.Fprintf(os.Stderr, "commentsAtPath(%s): %s\n", spath, comment)
			return comment
		}
	}
	// fmt.Fprintf(os.Stderr, "commentsAtPath(%s) not found\n", spath)
	return ""
}

func pathEqual(path1, path2 []int32) bool {
	if len(path1) != len(path2) {
		return false
	}
	for i, v := range path1 {
		if path2[i] != v {
			return false
		}
	}
	return true
}

const (
	// tag numbers in FileDescriptorProto
	packageCommentPath   = 2
	messageCommentPath   = 4
	enumCommentPath      = 5
	serviceCommentPath   = 6
	extensionCommentPath = 7
	syntaxCommentPath    = 12

	// tag numbers in DescriptorProto
	messageFieldCommentPath     = 2 // field
	messageMessageCommentPath   = 3 // nested_type
	messageEnumCommentPath      = 4 // enum_type
	messageExtensionCommentPath = 6 // extension

	// tag numbers in EnumDescriptorProto
	enumValueCommentPath = 2 // value

	// tag numbers in ServiceDescriptorProto
	serviceMethodCommentPath = 2
)
