package generator

import "text/template"

type enumValue struct {
	Name    string
	Number  int32
	Comment string
}

type enum struct {
	Name    string
	Value   []enumValue
	Comment string
}

var enumTemplate = template.Must(template.New("enum").Parse(`
{{- .Comment}}
export enum {{.Name}} {
  {{- range .Value}}
  {{- .Comment}}
  {{.Name}} = {{.Number}},
  {{- end}}
}`))
