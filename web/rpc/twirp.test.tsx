import React from "react";
import renderer from "react-test-renderer";
import {
  TwirpJSONClient,
  TwirpClient,
  renderState,
  TwirpProvider,
  InMemoryCache
} from "./twirp";
import { ListTodos, ListTodoResponse, ListTodoRequest } from "./TodoService";

test("none", async () => {
  const cache = new InMemoryCache();
  const client = new TwirpJSONClient("http://localhost:4000/twirp/");
  const App = () => <div />;
  await renderState(client, cache, <App />);
  expect(cache.store.size).toBe(0);
  expect(renderer.create(<App />).toJSON()).toMatchSnapshot();
});

test.only("client in context", async () => {
  const cache = new InMemoryCache<ListTodoResponse>();
  const client: TwirpClient<ListTodoRequest, ListTodoResponse | undefined> = {
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
