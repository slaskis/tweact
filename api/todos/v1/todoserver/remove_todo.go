package todoserver

import (
	"context"

	"github.com/twitchtv/twirp"

	todos "github.com/slaskis/tweact/api/todos/v1"
)

func (s *TodoServer) RemoveTodo(ctx context.Context, in *todos.RemoveTodoRequest) (*todos.TodoResponse, error) {
	var newTodos []*todos.Todo
	var todo *todos.Todo
	for _, t := range s.todos {
		if t.Id != in.Id {
			newTodos = append(newTodos, t)
		} else {
			todo = t
		}
	}
	if todo == nil {
		return nil, twirp.NotFoundError("todo not found")
	}
	s.todos = newTodos
	return &todos.TodoResponse{
		Todo: todo,
	}, nil
}
