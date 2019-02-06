//
// GENERATED CODE -- DO NOT EDIT!
//
// source: todos/v1/TodoService.proto
//
import { Todo } from "./Todo"

interface TwirpClient<Req, Res> {
  request(method: string, variables: Partial<Req>, options: any): Promise<Res>;
}
export interface TodoResponse {
  todo?: Todo;
}
export interface ListTodoResponse {
  todos?: Array<Todo>;
}
export interface CreateTodoRequest {
  title?: string;
}
export interface RemoveTodoRequest {
  id?: string;
}
export interface GetTodoRequest {
  id?: string;
}
export interface ListTodosRequest {
}
export const CreateTodo = (r: CreateTodoRequest, t: TwirpClient<CreateTodoRequest, TodoResponse>, o = {}) => t.request("todos.v1.TodoService/CreateTodo", r, o);
export const RemoveTodo = (r: RemoveTodoRequest, t: TwirpClient<RemoveTodoRequest, TodoResponse>, o = {}) => t.request("todos.v1.TodoService/RemoveTodo", r, o);
export const GetTodo = (r: GetTodoRequest, t: TwirpClient<GetTodoRequest, TodoResponse>, o = {}) => t.request("todos.v1.TodoService/GetTodo", r, o);
export const ListTodos = (r: ListTodosRequest, t: TwirpClient<ListTodosRequest, ListTodoResponse>, o = {}) => t.request("todos.v1.TodoService/ListTodos", r, o);