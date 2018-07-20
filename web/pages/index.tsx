import React from "react";
import Head from "../components/head";
import Nav from "../components/nav";
import withTwirp from "../components/withTwirp";
import { ListTodos, CreateTodo, RemoveTodo, Todo } from "../rpc/TodoService";

const App = () => (
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
          <ul>{todos.map(t => <TodoRow key={t.id} {...t} />)}</ul>
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
