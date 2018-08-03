import React from "react";
import reactTreeWalker from "react-tree-walker";

export interface TwirpCache<Res> {
  get(key: string): Res;
  set(key: string, res: Res): void;
  delete(key: string): void;
  purge(): void;
  dump(): string;
  load(it: string): TwirpCache<Res>;
}

export class InMemoryCache<Res> implements TwirpCache<Res | undefined> {
  store = new Map<string, Res>();

  get(key: string) {
    return this.store.get(key);
  }
  set(key: string, res: Res) {
    this.store.set(key, res);
  }
  delete(key: string) {
    this.store.delete(key);
  }
  purge() {
    this.store.clear();
  }
  dump() {
    return JSON.stringify([...this.store]);
  }
  load(obj?: string) {
    if (obj) {
      this.store = new Map(JSON.parse(obj));
    }
    return this;
  }
}

const toKey = (method: string, req: any) => method + ":" + JSON.stringify(req);

export class TwirpJSONClient<Req, Res> implements TwirpClient<Req, Res> {
  prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  request(
    method: string,
    variables: Req,
    options: { headers?: object } = {}
  ): Promise<Res> {
    return fetch(this.prefix + method, {
      method: "POST",
      headers: {
        ...options.headers,
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(variables)
    })
      .then(res => res.json().then(body => ({ res, body })))
      .then(({ res, body }) => {
        if (!res.ok) {
          throw new TwirpError(res.status, body);
        }
        return body as Res;
      });
  }
}

export interface TwirpClient<Req, Res> {
  request(method: string, variables: Partial<Req>, options: any): Promise<Res>;
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
  readonly data: T | Partial<T>;
  readonly error?: TwirpError;
  readonly loading: boolean;
  readonly skipped: boolean;
}
interface TwirpServiceMethods<Req, Res> {
  update: UpdateFunc<Req, Res>;
}
type UpdateFunc<Req, Res> = (
  variables?: Partial<Req>
) => Promise<Res | undefined>;
type SkipFunc<V> = (vars: V) => boolean;
type AsFunc<V> = (vars: V) => string[];

interface TwirpServiceProps<Req, Res> {
  /**
   * Variables to pass into the rpc method
   */
  variables?: Partial<Req>;

  /**
   * Wait to load until `update` has been called.
   *
   * Useful for rpc methods which update data.
   *
   * Will also enable `lazy` if unset.
   */
  wait?: boolean;

  /** Lazy load server side */
  lazy?: boolean;

  /**
   * Control if query should be skipped.
   * Set to `true` and control the query using `refetch()`
   * or to a function which accepts the current variables
   * and returns a boolean controling if a request should
   * be made. Rendering will still happen, with a skipped flag
   */
  skip?: boolean | SkipFunc<Partial<Req>>;

  /**
   * Control if a query should be reloaded on `update`
   */
  as?: string | string[] | AsFunc<Partial<Req>>;

  /**
   * Fail by throwing an exception and letting the React error boundary
   * take care of it instead of passing the error into the render callback
   */
  fail?: boolean;

  /**
   * Twirp context. Set by the TwirpProvider.
   */
  twirp?: TwirpClientContext<Req, Res>;

  // Render prop
  children(
    _: TwirpServiceState<Res> & TwirpServiceMethods<Req, Res>
  ): React.ReactNode;
}

export const withTwirp = <Req, Res>(
  Component:
    | React.ComponentClass<TwirpServiceProps<Req, Res>>
    | React.SFC<TwirpServiceProps<Req, Res>>
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
  cache?: TwirpCache<Res>;
  keys?: Map<string, Set<UpdateFunc<Req, Res>>>;
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
          cache: value.cache || parent.cache,
          keys: parent.keys || new Map()
        }}
        children={children}
      />
    )}
  </TwirpContext.Consumer>
);

class TwirpConnector<Req, Res> {
  data?: Res;
  method: string;
  options: any;

  constructor(method: string) {
    this.method = method;
    this.options = {};
  }

  invalidate(variables: Partial<Req>, cache?: TwirpCache<Res>) {
    const key = toKey(this.method, variables);
    if (cache) {
      cache.delete(key);
    }
  }

  request(
    client: TwirpClient<Req, Res>,
    variables: Partial<Req>,
    cache?: TwirpCache<Res>
  ): Promise<Res> {
    const key = toKey(this.method, variables);
    if (cache) {
      this.data = cache.get(key);
    }
    if (!this.data) {
      return client
        .request(this.method, variables, this.options)
        .then(res => (cache && cache.set(key, res)) || (this.data = res));
    }
    return Promise.resolve(this.data);
  }
}

const EmptyData = Object.freeze({});
const EmptyVars = Object.freeze({});
const EmptyKeys: string[] = [];

export abstract class TwirpService<Req, Res> extends React.Component<
  TwirpServiceProps<Req, Res>,
  TwirpServiceState<Res>
> {
  connector: TwirpConnector<Req, Res>;

  readonly state: TwirpServiceState<Res>;

  constructor(method: string, props: TwirpServiceProps<Req, Res>) {
    super(props);
    this.connector = new TwirpConnector(method);

    // attempt a request from the connector, which if in cache will
    // populate this.connector.data.
    if (
      !this.props.lazy &&
      !this.props.wait &&
      props.twirp &&
      props.twirp.client
    ) {
      this.connector
        .request(
          props.twirp.client,
          this.props.variables || EmptyVars,
          props.twirp.cache
        )
        .catch(error => console.warn("twirp constructor exception:", error));
    }

    // not set as a class property because constructor is
    // called _afterwards_
    this.state = {
      data: this.connector.data || EmptyData,
      error: undefined,
      loading: !this.props.wait && !this.connector.data,
      skipped: this.skipped
    };
  }

  componentDidMount() {
    if (!this.props.wait) {
      if (this.state.data === EmptyData) {
        this.request(this.props.variables);
      }

      // register in the cache `keys` map for invalidation
      // when the same key has been updated in a `wait` component
      this.as.forEach(key => {
        if (this.props.twirp && this.props.twirp.keys && key) {
          const set = this.props.twirp.keys.get(key) || new Set();
          set.add(this.refetch);
          this.props.twirp.keys.set(key, set);
        }
      });
    }
  }

  componentWillUnmount() {
    // unregister from the cache `keys` map
    this.as.forEach(key => {
      if (this.props.twirp && this.props.twirp.keys) {
        const set = this.props.twirp.keys.get(key);
        if (set) {
          set.delete(this.refetch);
          if (set.size == 0) {
            this.props.twirp.keys.delete(key);
          }
        }
      }
    });
  }

  get skipped() {
    if (typeof this.props.skip == "function") {
      return this.props.skip(this.props.variables || EmptyVars);
    }
    return this.props.skip == true;
  }

  get as(): string[] {
    if (typeof this.props.as == "function") {
      return this.props.as(this.props.variables || EmptyVars);
    } else if (Array.isArray(this.props.as)) {
      return this.props.as;
    } else if (this.props.as) {
      return [this.props.as];
    } else {
      return EmptyKeys;
    }
  }

  refetch = async (vars?: Partial<Req>) => {
    // TODO store last used vars and use here?
    const { cache = undefined } = this.props.twirp || {};
    const variables = Object.assign({}, this.props.variables, vars);
    this.connector.invalidate(variables, cache);
    return this.request();
  };

  request = async (vars?: Partial<Req>): Promise<Res | undefined> => {
    const { client = null, cache = undefined, keys = undefined } =
      this.props.twirp || {};

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

      await this.connector.request(client, variables, cache);

      this.setState({
        data: this.connector.data || this.state.data,
        error: undefined,
        loading: false
      });

      // revalidate the registered keys
      if (this.props.wait) {
        this.as.forEach(key => {
          if (keys) {
            const set = keys.get(key);
            if (set) {
              // TODO what about variables?
              set.forEach(u => u());
            }
          }
        });
      }

      return this.connector.data;
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
    return this.props.children({
      ...this.state,
      update: this.request
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
  cache: TwirpCache<any>,
  component: React.ReactNode,
  { maxDepth = 3 } = {}
) => {
  const ctx = { client, cache };
  const render = async (depth = 0): Promise<void> => {
    if (depth < maxDepth) {
      let pending = 0;
      const visitor = async (
        _element: React.ReactElement<any>,
        instance: React.Component<{ variables?: any }> & {
          connector?: TwirpConnector<any, any>;
        },
        _context: React.Context<any>
      ) => {
        if (instance && instance.connector) {
          const waiter = instance.connector.request(
            client,
            instance.props.variables || EmptyVars,
            cache
          );
          if (!instance.connector.data) {
            pending++;
          }
          await waiter;
        }
        return true;
      };
      await reactTreeWalker(
        <TwirpContext.Provider value={ctx}>{component}</TwirpContext.Provider>,
        visitor
      );
      if (pending) {
        return render(depth + 1);
      }
    } else {
      console.warn("renderState reached max depth...");
    }
  };
  return render();
};
