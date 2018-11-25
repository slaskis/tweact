package generator

import "text/template"

type method struct {
	Name       string
	InputType  string
	OutputType string
	Package    string
	Service    string
	Comment    string
}

var methodTemplate = template.Must(template.New("method").Parse(`
{{- .Comment}}
export const {{.Name}} = (r: {{.InputType}}, t: TwirpClient<{{.InputType}}, {{.OutputType}}>) => t.request("{{.Package}}.{{.Service}}/{{.Name}}", r, {});`))
