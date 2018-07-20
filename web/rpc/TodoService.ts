import { withTwirp, TwirpService } from "./twirp";

export interface Todo {
  id: string;
  title: string;
  state: TodoState;
}
export interface TodoResponse {
  todo: Todo;
}
export interface ListTodoResponse {
  todos: Todo[];
}
export interface CreateTodoRequest {
  title: string;
}
export interface RemoveTodoRequest {
  id: string;
}
export interface GetTodoRequest {
  id: string;
}
export interface ListTodosRequest {}
export enum TodoState {
  UNKNOWN = 0,
  ARCHIVED = 1,
  ACTIVE = 2
}

export const CreateTodo = withTwirp(
  class CreateTodo extends TwirpService<CreateTodoRequest, TodoResponse> {
    constructor(props: any) {
      super("todos.v1.TodoService/CreateTodo", props);
    }
  }
);
export const RemoveTodo = withTwirp(
  class RemoveTodo extends TwirpService<RemoveTodoRequest, TodoResponse> {
    constructor(props: any) {
      super("todos.v1.TodoService/RemoveTodo", props);
    }
  }
);
export const GetTodo = withTwirp(
  class GetTodo extends TwirpService<GetTodoRequest, TodoResponse> {
    constructor(props: any) {
      super("todos.v1.TodoService/GetTodo", props);
    }
  }
);
export const ListTodos = withTwirp(
  class ListTodos extends TwirpService<ListTodosRequest, ListTodoResponse> {
    constructor(props: any) {
      super("todos.v1.TodoService/ListTodos", props);
    }
  }
);
