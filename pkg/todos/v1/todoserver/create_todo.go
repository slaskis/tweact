package todoserver

import (
	"context"
	"crypto/rand"
	"encoding/base64"

	todos "github.com/slaskis/tweact/pkg/todos/v1"
)

func (s TodoServer) CreateTodo(ctx context.Context, in *todos.CreateTodoRequest) (*todos.TodoResponse, error) {
	todo := todos.Todo{
		Id:    makeID(),
		Title: in.Title,
		State: todos.TodoState_ACTIVE,
	}
	s.todos = append(s.todos, &todo)
	return &todos.TodoResponse{Todo: &todo}, nil
}

func makeID() string {
	b := make([]byte, 24)
	rand.Read(b)
	return base64.StdEncoding.EncodeToString(b)
}
