import { ReadTwirpService, WriteTwirpService } from "./twirp";

// TODO don't export these, instead use a separate import (twirp/json)
export { TwirpJSONClient, TwirpContext } from "./twirp";

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

export class ListTodoService extends ReadTwirpService<
  ListTodoRequest,
  ListTodoResponse
> {
  method = "todos.v1.TodoService/ListTodos";
}

export class CreateTodoService extends WriteTwirpService<
  CreateTodoRequest,
  TodoResponse
> {
  method = "todos.v1.TodoService/CreateTodo";
}
