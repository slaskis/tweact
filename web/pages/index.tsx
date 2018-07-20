import React from "react";
import { NextContext } from "next";
import Head from "../components/head";
import Nav from "../components/nav";

import {
  renderState,
  TwirpJSONClient as TwirpClient,
  TwirpProvider,
  InMemoryCache
} from "../rpc/twirp";

import { ListTodos, CreateTodo, RemoveTodo, Todo } from "../rpc/TodoService";

const prefix = "http://localhost:4000/twirp/";

type Props = {
  ssrCache?: string;
} & { children?: React.ReactNode };

const withTwirp = (Component: React.ComponentClass | React.SFC) =>
  class extends React.Component<Props> {
    static async getInitialProps({ req }: NextContext) {
      const cache = new InMemoryCache();
      // only render state in ssr. let client side navigation
      // show loading states instead
      if (req) {
        const client = new TwirpClient(prefix);
        try {
          console.log(" -- APP RENDER STATE START");
          await renderState(client, cache, <Component />);
          console.log(" -- APP RENDER STATE END");
        } catch (err) {
          console.error("renderState err", err);
        }
      }
      return { ssrCache: await cache.dump() };
    }

    twirp = {
      client: new TwirpClient(prefix),
      cache: new InMemoryCache().load(this.props.ssrCache)
    };

    render() {
      return (
        <TwirpProvider value={this.twirp}>
          <Component {...this.props} />
        </TwirpProvider>
      );
    }
  };

const App = () => {
  return (
    <div>
      <Head title="Home" />
      <Nav />
      <ListTodos>
        {({ data: { todos }, error, loading }) =>
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
      </ListTodos>

      <ListTodos lazy>
        {({ data: { todos }, error, loading }) =>
          loading ? (
            "Loading..."
          ) : error ? (
            <span>Error: {error.message}</span>
          ) : todos && todos.length ? (
            <ul>{todos.map(t => <TodoRow key={t.id} {...t} />)}</ul>
          ) : (
            <span>No todos available</span>
          )
        }
      </ListTodos>

      <CreateTodo wait>
        {({ data: { todo }, error, loading, update }) => (
          <form
            onSubmit={evt => {
              evt.preventDefault();
              const title = evt.currentTarget.elements[0] as HTMLInputElement;
              if (title) {
                update({
                  title: title.value
                });
              }
            }}
          >
            <input name="title" placeholder="Title of Todo" defaultValue="" />
            <button disabled={loading}>Create</button>
            {todo ? "Created a todo with id " + todo.id : null}
            {error ? error.message : null}
          </form>
        )}
      </CreateTodo>
    </div>
  );
};

const TodoRow = ({ id, title }: Todo) => (
  <RemoveTodo wait>
    {({ update, loading }) => (
      <li key={id}>
        <span>{title}</span>
        <button disabled={loading} onClick={() => update({ id })}>
          {loading ? "Removing..." : "Remove"}
        </button>
        <style jsx>{`
          li {
            display: flex;
          }
        `}</style>
      </li>
    )}
  </RemoveTodo>
);

export default withTwirp(App);
