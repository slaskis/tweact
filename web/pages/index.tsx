import React, { useState } from "react";
import { Head } from "../components/Head";
import { Nav } from "../components/Nav";
import withTwirp from "../components/withTwirp";
import { useTwirp, invalidate } from "../lib/twirp";
import { ListTodos, CreateTodo, RemoveTodo } from "../rpc/todos/v1/TodoService";
import { Todo } from "rpc/todos/v1/Todo";

function App() {
  return (
    <div>
      <Head title="Home" />
      <Nav />
      <Todos />
    </div>
  );
}

function TodoItem({ todo, onRemove }: { todo: Todo; onRemove: Function }) {
  return (
    <li>
      {todo.title}
      <button type="button" onClick={() => onRemove(todo.id!)}>
        &times;
      </button>
    </li>
  );
}

function Todos() {
  let [{ todos = [] }, error, loading] = useTwirp(ListTodos, {}); // immediate request
  let createTodo = useTwirp(CreateTodo); // curried request
  let removeTodo = useTwirp(RemoveTodo);

  // render any errors caught for create or remove
  let [updateError, setError] = useState<Error | undefined>(undefined);

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const el = ev.currentTarget.elements.namedItem("name");
    if (el instanceof HTMLInputElement) {
      try {
        setError(undefined);
        await createTodo({ title: el.value });
        invalidate(ListTodos, {});
        el.focus();
        el.select();
      } catch (err) {
        setError(err);
      }
    }
  }

  async function onRemove(id: string) {
    try {
      setError(undefined);
      await removeTodo({ id });
      invalidate(ListTodos, {});
    } catch (err) {
      setError(err);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      {error ? (
        <p className="text-red text-xs italic">{error.message}</p>
      ) : loading ? (
        <p>Loading...</p>
      ) : todos.length ? (
        <ul>
          {todos.map(t => (
            <TodoItem key={t.id} todo={t} onRemove={onRemove} />
          ))}
        </ul>
      ) : (
        <p>No todos yet. Create one!</p>
      )}
      <input name="name" autoFocus />
      <button>Create</button>
      {updateError ? (
        <p className="text-red text-xs italic">{updateError.message}</p>
      ) : null}
    </form>
  );
}

export default withTwirp(App);
