package generator

import "text/template"

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
