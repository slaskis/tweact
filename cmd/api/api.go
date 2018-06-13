package main

import (
	"log"
	"net/http"

	"github.com/rs/cors"
	"github.com/slaskis/tweact/pkg/todos/v1"
	"github.com/slaskis/tweact/pkg/todos/v1/todoserver"
)

func main() {
	tsvc := todoserver.TodoServer{}
	tsrv := todos.NewTodoServiceServer(tsvc, nil)
	mux := http.ServeMux{}
	mux.Handle("/", tsrv)
	log.Printf("listening on port 4000, available services:")
	log.Printf("  - %s", todos.TodoServicePathPrefix)

	http.ListenAndServe(":4000", cors.Default().Handler(&mux))
}
