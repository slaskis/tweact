import React from "react";
import renderer from "react-test-renderer";
import {
  TwirpJSONClient,
  renderState,
  TwirpProvider,
  InMemoryCache
} from "./twirp";
import { ListTodos } from "./TodoService";

test("none", async () => {
  const cache = new InMemoryCache();
  const client = new TwirpJSONClient("http://localhost:4000/twirp/", cache);
  const App = () => <div />;
  await renderState(client, <App />);
  expect(cache.store.size).toBe(0);
  expect(renderer.create(<App />).toJSON()).toMatchSnapshot();
});

test.only("client in context", async () => {
  const cache = new InMemoryCache();
  const client = new TwirpJSONClient("http://localhost:4000/twirp/", cache);

  const spy = jest.spyOn(cache, "set");
  const App = () => (
    <ListTodos>{({ loading }) => (loading ? "LOADING" : "OK")}</ListTodos>
  );
  await renderState(client, <App />);
  expect(cache.store.size).toBe(1);
  expect(spy).toHaveBeenCalledTimes(1);
  spy.mockReset();
  await renderState(client, <App />);
  expect(cache.store.size).toBe(1);
  expect(spy).toHaveBeenCalledTimes(0);
  spy.mockReset();
  expect(
    renderer
      .create(
        <TwirpProvider value={{ client }}>
          <App />
        </TwirpProvider>
      )
      .toJSON()
  ).toMatchSnapshot();
  expect(cache.store.size).toBe(1);
  expect(spy).toHaveBeenCalledTimes(0);
});
