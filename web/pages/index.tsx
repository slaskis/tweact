import React from "react";
import { NextContext } from "next";
import Head from "../components/head";
import Nav from "../components/nav";

import {
  renderState,
  TwirpClient,
  TwirpProvider,
  InMemoryCache,
  ListTodos,
  CreateTodo
} from "../rpc/TodoService";

const prefix = "http://localhost:4000/twirp/";

type Props = {
  cache?: Iterable<any>;
};

export default class App extends React.Component<Props> {
  static async getInitialProps({ req }: NextContext) {
    const cache = new InMemoryCache();
    // only render state in ssr. let client side navigation
    // show loading states instead
    if (req) {
      const client = new TwirpClient(prefix, cache);
      try {
        console.log("APP RENDER STATE START");
        await renderState(client, <App />);
        console.log("APP RENDER STATE END");
      } catch (err) {
        console.error("renderState err", err);
      }
    }
    return { cache: await cache.dump() };
  }

  render() {
    const cache = new InMemoryCache();
    if (this.props.cache) {
      cache.load(this.props.cache);
    }
    return (
      <div>
        <Head title="Home" />
        <Nav />
        <TwirpProvider value={{ client: new TwirpClient(prefix, cache) }}>
          <ListTodos
            render={({ data: { todos }, error, loading }) =>
              loading ? (
                "Loading..."
              ) : error ? (
                <span>Error: {error.message}</span>
              ) : todos && todos.length ? (
                <ul>{todos.map(t => <li key={t.id}>{t.title}</li>)}</ul>
              ) : (
                <span>No todos available</span>
              )
            }
          />

          <CreateTodo lazy>
            {({ data: { todo }, error, loading, update }) => (
              <form
                onSubmit={evt => {
                  evt.preventDefault();
                  const title = evt.currentTarget
                    .elements[0] as HTMLInputElement;
                  if (title) {
                    update({
                      title: title.value
                    });
                  }
                }}
              >
                <input
                  name="title"
                  placeholder="Title of Todo"
                  defaultValue=""
                />
                <button disabled={loading}>Create</button>
                {todo ? "Created a todo with id " + todo.id : null}
                {error ? error.message : null}
              </form>
            )}
          </CreateTodo>
        </TwirpProvider>
      </div>
    );
  }
}
