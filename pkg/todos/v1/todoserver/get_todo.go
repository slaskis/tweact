package todoserver

import (
	"context"

	"github.com/twitchtv/twirp"

	todos "github.com/slaskis/tweact/pkg/todos/v1"
)

func (s *TodoServer) GetTodo(ctx context.Context, in *todos.GetTodoRequest) (*todos.TodoResponse, error) {
	for _, t := range s.todos {
		if t.Id == in.Id {
			return &todos.TodoResponse{
				Todo: t,
			}, nil
		}
	}
	return nil, twirp.NotFoundError("todo not found")
}
