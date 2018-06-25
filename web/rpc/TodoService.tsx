import {
  ReadTwirpService,
  WriteTwirpService,
  withTwirp,
  ReadRenderCallback,
  WriteRenderCallback
} from "./twirp";

// TODO don't export these, instead use a separate import (twirp/json, twirp/protobuf)
export { TwirpJSONClient as TwirpClient, TwirpContext } from "./twirp";

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

export const ListTodoService = withTwirp<
  ListTodoRequest,
  ListTodoResponse,
  ReadRenderCallback<ListTodoResponse>
>(
  class ListTodoService extends ReadTwirpService<
    ListTodoRequest,
    ListTodoResponse
  > {
    method = "todos.v1.TodoService/ListTodos";
  }
);

export const CreateTodoService = withTwirp<
  CreateTodoRequest,
  TodoResponse,
  WriteRenderCallback<CreateTodoRequest, TodoResponse>
>(
  class CreateTodoService extends WriteTwirpService<
    CreateTodoRequest,
    TodoResponse
  > {
    method = "todos.v1.TodoService/CreateTodo";
  }
);
