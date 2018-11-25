package generator

import "text/template"

type field struct {
	Name    string
	Type    string
	Comment string
}

type message struct {
	Name    string
	Fields  []field
	Comment string
}

var messageTemplate = template.Must(template.New("message").Parse(`
{{- .Comment }}
export interface {{.Name}} {
  {{- range .Fields}}
  {{- .Comment}}
  {{.Name}}?: {{.Type}};
  {{- end}}
}`))
