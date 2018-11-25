// generated by protoc-gen-tweact. DO NOT EDIT.
// source: todos/v1/service.proto

interface TwirpClient<Req, Res> {
  request(method: string, variables: Partial<Req>, options: any): Promise<Res>;
}

export interface Todo {
  id?: string;
  title?: string;
  state?: TodoState;
}
export interface TodoResponse {
  todo?: Todo;
}
export interface ListTodoResponse {
  todos?: Todo[];
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
export enum TodoState {
  UNKNOWN = 0,
  ARCHIVED = 1,
  ACTIVE = 2,
}

export const CreateTodo = (r: CreateTodoRequest, t: TwirpClient<CreateTodoRequest, TodoResponse>) => t.request("todos.v1.TodoService/CreateTodo", r, {});
export const RemoveTodo = (r: RemoveTodoRequest, t: TwirpClient<RemoveTodoRequest, TodoResponse>) => t.request("todos.v1.TodoService/RemoveTodo", r, {});
export const GetTodo = (r: GetTodoRequest, t: TwirpClient<GetTodoRequest, TodoResponse>) => t.request("todos.v1.TodoService/GetTodo", r, {});
export const ListTodos = (r: ListTodosRequest, t: TwirpClient<ListTodosRequest, ListTodoResponse>) => t.request("todos.v1.TodoService/ListTodos", r, {});