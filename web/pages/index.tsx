import React, { Suspense } from "react";
import { Head } from "../components/Head";
import { Nav } from "../components/Nav";
import withTwirp from "../components/withTwirp";
import { useTwirp, invalidate } from "../lib/twirp";
import { ListTodos, CreateTodo, RemoveTodo } from "../rpc/todos/v1/TodoService";

function App() {
  return (
    <div>
      <Head title="Home" />
      <Nav />
      <Suspense fallback={<span>Loading...</span>}>
        <Todos />
      </Suspense>
    </div>
  );
}

function TodoItem({ todo, onRemove }: { todo: any; onRemove: Function }) {
  return (
    <li>
      {todo.title}
      <button type="button" onClick={() => onRemove()}>
        &times;
      </button>
      <style jsx>{`
        button {
          appearance: none;
          border: 0;
          cursor: pointer;
          color: red;
        }
        button:hover {
          color: darkred;
        }
      `}</style>
    </li>
  );
}

function Todos({}) {
  let { todos = [] } = useTwirp(ListTodos, {}); // immediate request
  let createTodo = useTwirp(CreateTodo); // curried request
  let removeTodo = useTwirp(RemoveTodo);

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const el = ev.currentTarget.elements.namedItem("name");
    if (el instanceof HTMLInputElement) {
      await createTodo({ title: el.value });
      invalidate(ListTodos, {});
      el.focus();
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <ul>
        {todos.map(t => (
          <TodoItem
            key={t.id}
            todo={t}
            onRemove={async () => {
              await removeTodo({ id: t.id });
              invalidate(ListTodos, {});
            }}
          />
        ))}
      </ul>
      <input name="name" autoFocus />
      <button>Create</button>
    </form>
  );
}

export default withTwirp(App);
