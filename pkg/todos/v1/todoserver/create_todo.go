package todoserver

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"log"

	"github.com/twitchtv/twirp"

	todos "github.com/slaskis/tweact/pkg/todos/v1"
)

func (s *TodoServer) CreateTodo(ctx context.Context, in *todos.CreateTodoRequest) (*todos.TodoResponse, error) {
	log.Println("create todo " + in.Title)
	if in.Title == "" {
		return nil, twirp.InvalidArgumentError("Title", "cannot be empty")
	}
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
