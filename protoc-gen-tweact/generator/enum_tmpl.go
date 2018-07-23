package generator

import "text/template"

var enumTemplate = template.Must(template.New("enum").Parse(`
export enum {{.Name}} {
  {{- range .Value}}
  {{.Name}} = {{.Number}},
  {{- end}}
}`))
