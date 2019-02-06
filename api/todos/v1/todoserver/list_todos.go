package todoserver

import (
	"context"

	todos "github.com/slaskis/tweact/api/todos/v1"
)

func (s *TodoServer) ListTodos(ctx context.Context, in *todos.ListTodosRequest) (*todos.ListTodoResponse, error) {
	// return nil, twirp.InvalidArgumentError("x", "just error")
	return &todos.ListTodoResponse{
		Todos: s.todos,
	}, nil
}
