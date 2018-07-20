import { withTwirp, TwirpService } from "./twirp";

export interface Todo {
  id: string;
  title: string;
}

export interface TodoResponse {
  todo?: Todo;
}

export interface CreateTodoRequest {
  title: string;
}
export interface ListTodoRequest {}

export interface ListTodoResponse {
  todos?: Todo[];
}

export const ListTodos = withTwirp(
  class ListTodos extends TwirpService<ListTodoRequest, ListTodoResponse> {
    constructor(props: any) {
      super("todos.v1.TodoService/ListTodos", props);
    }
  }
);

export const CreateTodo = withTwirp(
  class CreateTodo extends TwirpService<CreateTodoRequest, TodoResponse> {
    constructor(props: any) {
      super("todos.v1.TodoService/CreateTodo", props);
    }
  }
);
