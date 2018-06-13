import React from "react";
import Link from "next/link";
import Head from "../components/head";
import Nav from "../components/nav";
import { listenerCount } from "cluster";

interface ServiceMethods {
  "todos.v1.TodoService/ListTodos": ListTodoRequest;
  "todos.v1.TodoService/CreateTodo": object;
}

interface TwirpClient {
  request(
    method: keyof ServiceMethods,
    variables: ServiceMethods[keyof ServiceMethods],
    options: any
  ): Promise<any>;
}

class TwirpJSONClient implements TwirpClient {
  prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  async request(
    method: keyof ServiceMethods,
    variables: ServiceMethods[keyof ServiceMethods],
    options: { headers?: object } = {}
  ) {
    const req = new Request(this.prefix + method, {
      method: "POST",
      headers: new Headers({
        ...options.headers,
        Accept: "application/json",
        "Content-Type": "application/json"
      }),
      body: JSON.stringify(variables)
    });
    return fetch(req).then(res => res.json());
  }
}

interface TwirpError extends Error {}

interface TodoServiceRender<T> {
  data: T;
  error: TwirpError;
  loading: boolean;
}

interface Todo {
  id: string;
  title: string;
}

interface TodoResponse {
  todo: Todo;
}

interface CreateTodoRequest {
  title: string;
}
interface ListTodoRequest {}

interface ListTodoResponse {
  todos: Todo[];
}

interface TwirpServiceProps {
  client?: TwirpClient;
}

interface TodoServiceWriteProps<Res, Req> extends TwirpServiceProps {
  method: keyof ServiceMethods;
  variables?: Partial<Req>;
  render: (
    write: (variables?: Req) => Promise<Res>,
    _: TodoServiceRender<Res>
  ) => React.ReactNode;
}

interface TodoServiceReadProps<Res, Req> extends TwirpServiceProps {
  method: keyof ServiceMethods;
  variables?: Partial<Req>;
  render: (_: TodoServiceRender<Res>) => React.ReactNode;
}

class ReadService<Res, Req> extends React.Component<
  TodoServiceReadProps<Res, Req>
> {
  static contextTypes: {
    client: TwirpClient;
  };

  async componentDidMount() {
    const client = this.props.client || this.context.client;
    const { method, variables = {} } = this.props;
    const response = await client.request(method, variables);
  }

  render() {
    return null;
  }
}

class WriteService<Res, Req> extends React.Component<
  TodoServiceWriteProps<Res, Req>
> {
  static contextTypes: {
    client: TwirpClient;
  };

  async componentDidMount() {
    const client = this.props.client || this.context.client;
    const { method, variables = {} } = this.props;
    const response = await client.request(method, variables);
  }

  render() {
    return null;
  }
}

export default () => (
  <div>
    <Head title="Home" />
    <Nav />

    <ReadService<ListTodoResponse, ListTodoRequest>
      method="todos.v1.TodoService/ListTodos"
      client={new TwirpJSONClient("http://localhost:4000/twirp/")}
      render={({ data: { todos }, error, loading }) =>
        loading ? (
          "Loading..."
        ) : error ? (
          error.message
        ) : (
          <ul>{todos.map(t => <li>{t.title}</li>)}</ul>
        )
      }
    />

    <WriteService<TodoResponse, CreateTodoRequest>
      method="todos.v1.TodoService/CreateTodo"
      client={new TwirpJSONClient("http://localhost:4000/twirp/")}
      render={(save, { error, loading }) => (
        <form onSubmit={e => e.preventDefault() || save()}>
          <input name="title" placeholder="Title of Todo" defaultValue="" />
          <button disabled={error === undefined || loading}>Create</button>
        </form>
      )}
    />

    <div className="hero">
      <h1 className="title">Welcome to Nextz!</h1>
      <p className="description">
        To get started, edit <code>pages/index.js</code> and save to reload.
      </p>

      <div className="row">
        <Link href="https://github.com/zeit/next.js#getting-started">
          <a className="card">
            <h3>Getting Started &rarr;</h3>
            <p>Learn more about Next on Github and in their examples</p>
          </a>
        </Link>
        <Link href="https://open.segment.com/create-next-app">
          <a className="card">
            <h3>Examples &rarr;</h3>
            <p>
              Find other example boilerplates on the{" "}
              <code>create-next-app</code> site
            </p>
          </a>
        </Link>
        <Link href="https://github.com/segmentio/create-next-app">
          <a className="card">
            <h3>Create Next App &rarr;</h3>
            <p>Was this tool helpful? Let us know how we can improve it</p>
          </a>
        </Link>
      </div>
    </div>

    <style jsx>{`
      .hero {
        width: 100%;
        color: #333;
      }
      .title {
        margin: 0;
        width: 100%;
        padding-top: 80px;
        line-height: 1.15;
        font-size: 48px;
      }
      .title,
      .description {
        text-align: center;
      }
      .row {
        max-width: 880px;
        margin: 80px auto 40px;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
      }
      .card {
        padding: 18px 18px 24px;
        width: 220px;
        text-align: left;
        text-decoration: none;
        color: #434343;
        border: 1px solid #9b9b9b;
      }
      .card:hover {
        border-color: #067df7;
      }
      .card h3 {
        margin: 0;
        color: #067df7;
        font-size: 18px;
      }
      .card p {
        margin: 0;
        padding: 12px 0 0;
        font-size: 13px;
        color: #333;
      }
    `}</style>
  </div>
);
