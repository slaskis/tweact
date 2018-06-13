package todoserver

import (
	"github.com/slaskis/tweact/pkg/todos/v1"
)

var _ todos.TodoService = TodoServer{}

type TodoServer struct {
	todos []*todos.Todo
}
