import React, { Placeholder } from "react";
import Head from "../components/Head";
import Nav from "../components/Nav";
import withTwirp from "../components/withTwirp";
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
    <Placeholder delayMs={1000} fallback={<span>Loading...</span>}>
      <ListTodos>
        {({ data: { todos } }) =>
          todos && todos.length ? (
            <ul>{todos.map(t => <TodoRow key={t.id} {...t} />)}</ul>
          ) : (
            <span>No todos available</span>
          )
        }
      </ListTodos>

      <CreateTodo wait>
        {({ data: { todo }, update }) => (
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
            <button>Create</button>
            {todo ? "Created a todo with id " + todo.id : null}
          </form>
        )}
      </CreateTodo>
    </Placeholder>
  </div>
);

const TodoRow = ({ id, title }: Todo) => (
  <RemoveTodo wait>
    {({ update }) => (
      <li key={id}>
        <span>{title}</span>
        <button onClick={() => update({ id })}>Remove</button>
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
