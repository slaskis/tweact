import React, { Suspense } from "react";
import Head from "../components/Head";
import Nav from "../components/Nav";
import withTwirp from "../components/withTwirp";
import { useTwirp, invalidate } from "../lib/twirp";
import {
  ListTodos,
  CreateTodo,
  RemoveTodo,
  Todo
} from "../rpc/todos/v1/TodoService";

const App = () => (
  <div>
    <Head title="Home" />
    <Nav />
    <Suspense fallback={<span>Loading...</span>}>
      <Todos />
    </Suspense>
  </div>
);

const TodoItem = ({ todo, onRemove }: { todo: Todo; onRemove: Function }) => (
  <li>
    {todo.title}
    <a href="javascript:void" onClick={() => onRemove()}>
      &times;
    </a>
  </li>
);

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
