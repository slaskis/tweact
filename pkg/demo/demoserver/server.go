package demoserver

import "github.com/slaskis/tweact/pkg/demo"

var _ demo.DemoService = &DemoServer{}

type DemoServer struct {
}
