package main

import (
	"log"
	"net/http"

	"github.com/rs/cors"
	"github.com/slaskis/tweact/api/demo"
	"github.com/slaskis/tweact/api/demo/demoserver"
	"github.com/slaskis/tweact/api/todos/v1"
	"github.com/slaskis/tweact/api/todos/v1/todoserver"
)

func main() {
	mux := http.ServeMux{}
	log.Printf("listening on port 4000, available services:")

	{
		log.Printf("  - %s", todos.TodoServicePathPrefix)
		svc := todoserver.TodoServer{}
		srv := todos.NewTodoServiceServer(&svc, nil)
		mux.Handle(todos.TodoServicePathPrefix, srv)
	}

	{
		log.Printf("  - %s", demo.DemoServicePathPrefix)
		svc := demoserver.DemoServer{}
		srv := demo.NewDemoServiceServer(&svc, nil)
		mux.Handle(demo.DemoServicePathPrefix, srv)
	}

	http.ListenAndServe(":4000", cors.Default().Handler(&mux))
}
