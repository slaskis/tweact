import { TwirpService } from "./twirp";

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

export class ListTodos extends TwirpService<
  ListTodoRequest,
  ListTodoResponse
> {}

export class CreateTodo extends TwirpService<CreateTodoRequest, TodoResponse> {}
