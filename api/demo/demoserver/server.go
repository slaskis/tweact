package demoserver

import "github.com/slaskis/tweact/api/demo"

var _ demo.DemoService = &DemoServer{}

type DemoServer struct {
}
