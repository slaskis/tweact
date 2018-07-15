import React from "react";
import fetch from "isomorphic-fetch";
import { createHash } from "crypto";
import reactTreeWalker from "react-tree-walker";

interface TwirpCache<Key, Res> {
  get(key: Key): Res;
  set(key: Key, res: Res): void;
  delete(key: Key): void;
  purge(): void;
  dump(): Iterable<[Key, Res]>;
  load(it: Iterable<[Key, Res]>): void;
}

let caches = 0;

export class InMemoryCache<Res> implements TwirpCache<string, Res | undefined> {
  store = new Map<string, Res>();

  private id: string;

  constructor() {
    this.id = (caches++).toString();
    console.log("new cache:", this.id);
  }

  get(key: string) {
    console.log("cache(%s) get: %s", this.id, key);
    return this.store.get(key);
  }
  set(key: string, res: Res) {
    console.log("cache(%s) set: %s", this.id, key);
    this.store.set(key, res);
  }
  delete(key: string) {
    console.log("cache(%s) delete: %s", this.id, key);
    this.store.delete(key);
  }
  purge() {
    console.log("cache(%s) purge", this.id);
    this.store.clear();
  }
  dump() {
    const dumped = [...this.store];
    console.log("cache(%s) dump: ", this.id, dumped);
    return dumped as Iterable<any>;
  }
  load(obj: Iterable<any>) {
    console.log("cache(%s) load: ", this.id, obj);
    this.store = new Map(obj);
  }
}

class TwirpRequest<Res> {
  static index = 0;

  index: number;
  key: string;
  cache: TwirpCache<string, Res>;
  loading: boolean = false;
  request: { url: string } & RequestInit;

  constructor(
    cache: TwirpCache<string, Res>,
    request: { url: string } & RequestInit
  ) {
    this.key = createHash("md5")
      .update(JSON.stringify(request))
      .digest("hex")
      .slice(0, 4);
    this.cache = cache;
    this.request = request;
    this.index = ++TwirpRequest.index;
  }

  async send(): Promise<Res> {
    console.log("twirp request send(%s)", this.index);
    const cached = this.cache.get(this.key);
    console.log(
      "twirp request, cached? %s loading? %s index %s",
      !!cached,
      this.loading,
      this.key,
      this.index
    );
    if (cached) {
      return cached;
    }
    try {
      this.loading = true;
      const res = await fetch(this.request.url, this.request);
      const body = await res.json();
      if (!res.ok) {
        throw new TwirpError(res.status, body);
      }
      console.log("twirp request cached! %s", this.key);
      this.cache.set(this.key, body as Res);
      return body as Res;
    } catch (err) {
      console.log("twirp request error", err);
      throw err;
    } finally {
      console.log("twirp request done");
      this.loading = false;
    }
  }
}

export class TwirpJSONClient<Req, Res> implements TwirpClient<Req, Res> {
  prefix: string;
  cache: TwirpCache<string, Res>;
  id?: number;

  constructor(prefix: string, cache: TwirpCache<string, Res>) {
    this.id = Math.random();
    this.prefix = prefix;
    this.cache = cache;
  }

  request(
    method: string,
    variables: Req,
    options: { headers?: object } = {}
  ): TwirpRequest<Res> {
    return new TwirpRequest(this.cache, {
      url: this.prefix + method,
      method: "POST",
      headers: {
        ...options.headers,
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(variables)
    });
  }
}

interface TwirpClient<Req, Res> {
  cache: TwirpCache<string, Res>;
  request(
    method: string,
    variables: Partial<Req>,
    options: any
  ): TwirpRequest<Res>;
}
type TwirpErrorMeta = {
  [k: string]: string;
};
type TwirpErrorObject = {
  code: string;
  msg: string;
  meta: TwirpErrorMeta;
};

class TwirpError extends Error {
  status: Number;
  code: string;
  meta: TwirpErrorMeta;
  message: string;

  constructor(status: Number, error: TwirpErrorObject) {
    super(error.msg);
    this.status = status;
    this.code = error.code;
    this.meta = error.meta;
    this.message = error.msg;
  }
}

interface TwirpServiceState<T> {
  data: T | Partial<T>;
  error?: TwirpError;
  loading: boolean;
  skipped: boolean;
}
interface TwirpServiceMethods<Req, Res> {
  // TODO invalidate?
  update: (variables?: Partial<Req>) => Promise<Res | undefined>;
  client?: TwirpClient<Req, Res>;
}
type SkipFunc<V> = (vars: V) => boolean;

interface TwirpServiceProps<Req, Res> {
  variables?: Partial<Req>;

  // Wait for loading to complete before rendering anything instead of
  // passing loading boolean into the render callback
  wait?: boolean;

  // Lazy load server side
  lazy?: boolean;

  // Control if query should be skipped.
  // Set to `true` and control the query using `refetch()`
  // or to a function which accepts the current variables
  // and returns a boolean controling if a request should
  // be made. Rendering will still happen, with a skipped flag
  skip?: boolean | SkipFunc<Partial<Req>>;

  // Fail by throwing an exception and letting the React error boundary
  // take care of it instead of passing the error into the render callback
  fail?: boolean;

  // Twirp client and (in ssr) request queue
  twirp?: TwirpClientContext<Req, Res>;

  // Render prop
  render?(
    _: TwirpServiceState<Res> & TwirpServiceMethods<Req, Res>
  ): React.ReactNode;
  children?(
    _: TwirpServiceState<Res> & TwirpServiceMethods<Req, Res>
  ): React.ReactNode;
}

export const withTwirp = <Req, Res>(
  Component: React.ComponentClass<TwirpServiceProps<Req, Res>>
) => {
  const WithTwirp: React.StatelessComponent<
    TwirpServiceProps<Req, Res>
  > = props => (
    <TwirpContext.Consumer>
      {twirp => <Component twirp={{ ...twirp, ...props.twirp }} {...props} />}
    </TwirpContext.Consumer>
  );
  WithTwirp.displayName = `withTwirp(${Component.displayName ||
    Component.name ||
    "<unnamed>"})`;
  return WithTwirp;
};

interface TwirpClientContext<Req, Res> {
  client?: TwirpClient<Req, Res>;
  method?: string;
  queue?: TwirpRequest<Res>[];
}

const TwirpContext = React.createContext<TwirpClientContext<any, any>>({});

export const TwirpProvider = ({
  value,
  children
}: {
  value: TwirpClientContext<any, any>;
  children: React.ReactNode;
}) => (
  <TwirpContext.Consumer>
    {(parent = {}) => (
      <TwirpContext.Provider
        value={{
          client: value.client || parent.client,
          queue: parent.queue
        }}
        children={children}
      />
    )}
  </TwirpContext.Consumer>
);

export abstract class TwirpService<Req, Res> extends React.Component<
  TwirpServiceProps<Req, Res>,
  TwirpServiceState<Res>
> {
  state: TwirpServiceState<Res> = {
    data: {},
    error: undefined,
    loading: this.props.lazy != true,
    skipped: false
  };

  private method: string;
  req?: TwirpRequest<Res>;

  constructor(method: string, props: TwirpServiceProps<Req, Res>) {
    super(props);

    this.method = method;

    // queue a request
    const { twirp } = this.props;
    if (!props.lazy && twirp && twirp.client && twirp.queue) {
      // const req = twirp.client.request(method, props.variables || {}, {});
      // twirp.queue.push(req);
      this.req = twirp.client.request(method, props.variables || {}, {});
    }
  }

  componentDidMount() {
    if (!this.props.lazy) {
      this.request(this.props.variables);
    }
  }

  get skipped() {
    if (typeof this.props.skip == "function") {
      return this.props.skip(this.props.variables || {});
    }
    return this.props.skip == true;
  }

  request = async (vars?: Partial<Req>): Promise<Res | undefined> => {
    const { client = null } = this.props.twirp || {};

    if (!client) {
      throw new Error("missing twirp client");
    }

    if (this.skipped) {
      this.setState({
        skipped: true
      });
      return;
    }

    try {
      const variables = Object.assign({}, this.props.variables, vars);
      this.setState({
        loading: true,
        skipped: false
      });
      const req = client.request(this.method, variables, {});
      const data = await req.send();
      this.setState({
        data,
        error: undefined,
        loading: req.loading
      });
      return data;
    } catch (error) {
      this.setState({
        error,
        loading: false
      });
    }
  };

  render() {
    if (this.props.fail && this.state.error) {
      throw this.state.error;
    }
    if (this.props.wait && this.state.loading) {
      return null;
    }
    const render = this.props.render || this.props.children;
    if (!render) {
      return null;
    }
    return render({
      ...this.state,
      update: this.request,
      client: this.props.twirp ? this.props.twirp.client : undefined
    });
  }
}

// renderState will wrap a component with a "special" <Provider /> that
// has a query-queue on its context. This is then used by <Query /> in
// its `componentWillMount()`-lifecycle method for queuing up its
// query as defined by its props.
//
// it will keep re-rendering the tree until we run out of nested queries
// or we reach the assigned maxDepth option
export const renderState = (
  client: TwirpClient<any, any>,
  component: React.ReactNode,
  { maxDepth = 3 } = {}
) => {
  const render = async (depth = 0): Promise<void> => {
    if (depth < maxDepth) {
      console.log(" ==== RENDERING TREE %d ==== ", depth);
      const queue: TwirpRequest<any>[] = [];
      let pending = 0;
      await reactTreeWalker(
        <TwirpContext.Provider value={{ client, queue }}>
          {component}
        </TwirpContext.Provider>,
        async (
          _element: React.ReactElement<any>,
          instance: React.Component & { req?: TwirpRequest<any> },
          _context: React.Context<any>
        ) => {
          if (instance && instance.req) {
            const waiter = instance.req.send();
            if (instance.req.loading) {
              pending++;
              await waiter;
            }
          }
          return true;
        }
      );
      console.log(" ==== DONE RENDERING %d ==== ", depth, pending);
      if (pending) {
        return render(depth + 1);
      }
    } else {
      console.log("renderState reached max depth...");
    }
  };
  return render();
};
