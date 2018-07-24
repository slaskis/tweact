import React from "react";
import renderer from "react-test-renderer";
import {
  TwirpJSONClient,
  TwirpClient,
  renderState,
  TwirpProvider,
  InMemoryCache
} from "./twirp";

import {
  ListTodos,
  ListTodoResponse,
  ListTodosRequest,
  CreateTodoRequest,
  TodoResponse,
  CreateTodo,
  TodoState
} from "./TodoService";

test("none", async () => {
  const cache = new InMemoryCache();
  const client = new TwirpJSONClient("http://localhost:4000/twirp/");
  const App = () => <div />;
  await renderState(client, cache, <App />);
  expect(cache.store.size).toBe(0);
  expect(renderer.create(<App />).toJSON()).toMatchSnapshot();
});

test("simple ssr", async () => {
  const cache = new InMemoryCache<ListTodoResponse>();
  const client: TwirpClient<ListTodosRequest, ListTodoResponse | undefined> = {
    async request(
      _method: string,
      _variables: Partial<ListTodoResponse>,
      _options: any
    ) {
      console.log("mock client request");
      return { todos: [] };
    }
  };

  const App = () => (
    <ListTodos>
      {({ loading, error }) => (error ? "ERROR" : loading ? "LOADING" : "OK")}
    </ListTodos>
  );
  await renderState(client, cache, <App />);
  expect(cache.store.size).toBe(1);
  expect(
    renderer
      .create(
        <TwirpProvider value={{ client, cache }}>
          <App />
        </TwirpProvider>
      )
      .toJSON()
  ).toMatchSnapshot();
  expect(cache.store.size).toBe(1);
});

test("nested ssr", async () => {
  const cache = new InMemoryCache<ListTodoResponse>();
  const client: TwirpClient<ListTodosRequest, ListTodoResponse | undefined> = {
    async request(
      _method: string,
      _variables: Partial<ListTodoResponse>,
      _options: any
    ) {
      console.log("mock client request");
      return { todos: [] };
    }
  };

  const App = () => (
    <ListTodos>
      {({ loading, error }) =>
        error ? (
          "ERROR"
        ) : loading ? (
          "LOADING"
        ) : (
          <ListTodos>
            {({ loading, error }) =>
              error ? "ERROR" : loading ? "LOADING" : "OK"
            }
          </ListTodos>
        )
      }
    </ListTodos>
  );
  await renderState(client, cache, <App />);
  expect(
    renderer
      .create(
        <TwirpProvider value={{ client, cache }}>
          <App />
        </TwirpProvider>
      )
      .toJSON()
  ).toMatchSnapshot();
});

test("lazy ssr", async () => {
  const cache = new InMemoryCache<ListTodoResponse>();
  const client: TwirpClient<ListTodosRequest, ListTodoResponse | undefined> = {
    async request(
      _method: string,
      _variables: Partial<ListTodoResponse>,
      _options: any
    ) {
      console.log("mock client request");
      return { todos: [] };
    }
  };

  const App = () => (
    <ListTodos lazy>
      {({ loading, error }) => (error ? "ERROR" : loading ? "LOADING" : "OK")}
    </ListTodos>
  );
  await renderState(client, cache, <App />);
  expect(
    renderer
      .create(
        <TwirpProvider value={{ client, cache }}>
          <App />
        </TwirpProvider>
      )
      .toJSON()
  ).toMatchSnapshot();
});

test("fail ssr", async () => {
  const cache = new InMemoryCache<ListTodoResponse>();
  const client: TwirpClient<ListTodosRequest, ListTodoResponse | undefined> = {
    async request(
      _method: string,
      _variables: Partial<ListTodoResponse>,
      _options: any
    ) {
      console.log("mock client exception");
      throw new Error("hello");
    }
  };

  const App = () => (
    <ListTodos>
      {({ loading, error }) => (error ? "ERROR" : loading ? "LOADING" : "OK")}
    </ListTodos>
  );
  expect(renderState(client, cache, <App />)).rejects.toThrow("Error");
  expect(
    renderer
      .create(
        <TwirpProvider value={{ client, cache }}>
          <App />
        </TwirpProvider>
      )
      .toJSON()
  ).toMatchSnapshot();
  // NOTE: that the snapshot is LOADING because if server rendering
  // fails we still try to load it client side. if we waited for the
  // load it should end up as ERROR (how can we test this??)
});

test("wait ssr", async () => {
  const cache = new InMemoryCache<TodoResponse>();
  const client: TwirpClient<CreateTodoRequest, TodoResponse | undefined> = {
    async request(
      _method: string,
      _variables: Partial<CreateTodoRequest>,
      _options: any
    ): Promise<TodoResponse> {
      console.log("mock client request");
      return { todo: { id: "1", title: "Test", state: TodoState.ACTIVE } };
    }
  };

  const App = () => (
    <CreateTodo>
      {({ loading, error }) => (error ? "ERROR" : loading ? "LOADING" : "OK")}
    </CreateTodo>
  );
  await renderState(client, cache, <App />);
  expect(
    renderer
      .create(
        <TwirpProvider value={{ client, cache }}>
          <App />
        </TwirpProvider>
      )
      .toJSON()
  ).toMatchSnapshot();
});

test("in memory cache", () => {
  const c1 = new InMemoryCache();
  c1.set("hello", "there");
  expect(c1.store.size).toEqual(1);
  const d1 = c1.dump();
  expect(d1).toEqual(`[["hello","there"]]`);
  expect(c1.get("hello")).toEqual("there");
  expect(c1.get("hello2")).toBeUndefined();

  const j1 = JSON.stringify(d1);

  const c2 = new InMemoryCache();
  expect(c2.store.size).toEqual(0);
  expect(c2.get("hello")).toBeUndefined();
  c2.load(d1);
  expect(c2.store.size).toEqual(1);
  expect(c2.get("hello")).toEqual("there");
  expect(c2.get("hello2")).toBeUndefined();

  const c3 = new InMemoryCache();
  expect(c3.store.size).toEqual(0);
  expect(c3.get("hello")).toBeUndefined();
  c3.load(JSON.parse(j1));
  expect(c3.store.size).toEqual(1);
  expect(c3.get("hello")).toEqual("there");
  expect(c3.get("hello2")).toBeUndefined();
});
