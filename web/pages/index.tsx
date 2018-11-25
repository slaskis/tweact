import React, { Suspense } from "react";
import Head from "../components/Head";
import Nav from "../components/Nav";
import withTwirp from "../components/withTwirp";
import { useTwirp } from "../lib/twirp";
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
    <a onClick={() => onRemove()}>&times;</a>
  </li>
);

function Todos({}) {
  let { todos } = useTwirp(ListTodos, {}); // immediate request
  let createTodo = useTwirp(CreateTodo); // curried request
  let removeTodo = useTwirp(RemoveTodo);

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const el = ev.currentTarget.elements.namedItem("name");
    if (el instanceof HTMLInputElement) {
      createTodo({ title: el.value });
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <ul>
        {todos.map(t => (
          <TodoItem
            key={t.id}
            todo={t}
            onRemove={() => removeTodo({ id: t.id })}
          />
        ))}
      </ul>
      <input name="name" />
      <button>Create</button>
    </form>
  );
}

export default withTwirp(App);
