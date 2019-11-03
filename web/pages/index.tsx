import React from "react";
import Head from "../components/Head";
import Nav from "../components/Nav";
import { TodoService } from "../rpc/todos/v1/service.proto";
import { Todo } from "../rpc/todos/v1/types.proto";
import { useRequest, invalidate } from "../hooks/useRequest";

// can be initiated in a context if we want it shared across components
const { ListTodos, CreateTodo, RemoveTodo } = new TodoService(
  "http://localhost:4000/twirp/",
  {
    fetcher:
      typeof window != "undefined" ? window.fetch.bind(window) : undefined
  }
);

const App = () => {
  const {
    data: { todos },
    error,
    loading
  } = useRequest(ListTodos, {});
  const {
    data: { todo },
    update: create
  } = useRequest(CreateTodo);

  return (
    <div>
      <Head title="Home" />
      <Nav />
      {loading ? (
        "Loading..."
      ) : error ? (
        <span>Error: {error.message}</span>
      ) : todos && todos.length ? (
        <ul>
          {todos.map(t => (
            <TodoRow key={t.id} {...t} />
          ))}
        </ul>
      ) : (
        <span>No todos available</span>
      )}
      <form
        onSubmit={evt => {
          evt.preventDefault();
          const title = evt.currentTarget.elements[0] as HTMLInputElement;
          if (title) {
            create({ title: title.value });
            invalidate(ListTodos);
          }
        }}
      >
        <input name="title" placeholder="Title of Todo" defaultValue="" />
        <button disabled={loading}>Create</button>
        {todo ? "Created a todo with id " + todo.id : null}
        {error ? error.message : null}
      </form>
    </div>
  );
};

const TodoRow = ({ id, title }: Todo) => {
  const { loading, update: remove } = useRequest(RemoveTodo);

  return (
    <li key={id}>
      <span>{title}</span>
      <button
        disabled={loading}
        onClick={() => {
          remove({ id });
          invalidate(ListTodos);
        }}
      >
        {loading ? "Removing..." : "Remove"}
      </button>
      <style jsx>{`
        li {
          display: flex;
        }
      `}</style>
    </li>
  );
};

export default App;
