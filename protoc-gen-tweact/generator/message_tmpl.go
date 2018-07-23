package generator

import "text/template"

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
