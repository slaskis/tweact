import React, { Children } from "react";

export class TwirpJSONClient<Req, Res> implements TwirpClient<Req, Res> {
  prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  async request(
    method: string,
    variables: Req,
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

interface TwirpClient<Req, Res> {
  request(method: string, variables: Partial<Req>, options: any): Promise<Res>;
}

interface TwirpError extends Error {}

interface TwirpServiceRender<T> {
  data: T | Partial<T>;
  error?: TwirpError;
  loading: boolean;

  // TODO refetch, invalidate?
}
type ReadRenderCallback<Res> = (_: TwirpServiceRender<Res>) => JSX.Element;
type WriteRenderCallback<Req, Res> = (
  write: (variables?: Partial<Req>) => Promise<Res | undefined>,
  _: TwirpServiceRender<Res>
) => JSX.Element;

type SkipFunc<V> = (vars: V) => boolean;

interface TwirpServiceProps<Req, Res, Render> {
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
  render?: Render;
  children?: Render;
}

export const withTwirp = (Component: React.ComponentType) => (props: any) => (
  <TwirpContext.Consumer>
    {twirp => <Component twirp={twirp} {...props} />}
  </TwirpContext.Consumer>
);

type TwirpWaiter<Req> = (request: Promise<Req | undefined>) => void;

interface TwirpClientContext<Req, Res> {
  client?: TwirpClient<Req, Res>;
  waitFor?: TwirpWaiter<Res>;
}

export const TwirpContext = React.createContext({});

abstract class TwirpService<Req, Res, Render> extends React.Component<
  TwirpServiceProps<Req, Res, Render>,
  TwirpServiceRender<Res>
> {
  abstract method: string;

  state: TwirpServiceRender<Res> = {
    data: {},
    error: undefined,
    loading: this.props.lazy != true
  };

  async request(vars?: Partial<Req>): Promise<Res | undefined> {
    if (typeof vars == "undefined") {
      vars = this.props.variables;
    }
    const { client = null } = this.props.twirp || {};

    if (!client) {
      throw new Error("missing twirp client");
    }

    try {
      const variables = Object.assign({}, this.props.variables, vars);
      this.setState({
        loading: true
      });
      const data = await client.request(this.method, variables, {});
      this.setState({
        data
      });
      return data;
    } catch (error) {
      this.setState({
        error
      });
    } finally {
      this.setState({
        loading: false
      });
    }
  }
}

export abstract class WriteTwirpService<Req, Res> extends TwirpService<
  Req,
  Res,
  WriteRenderCallback<Req, Res>
> {
  render(): React.ReactNode {
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
    return render(this.request, this.state);
  }
}

export abstract class ReadTwirpService<Req, Res> extends TwirpService<
  Req,
  Res,
  ReadRenderCallback<Res>
> {
  constructor(props: TwirpServiceProps<Req, Res, ReadRenderCallback<Res>>) {
    super(props);

    // queue a request and add to the context
    if (props.twirp && props.twirp.waitFor) {
      const req = this.request(props.variables);
      props.twirp.waitFor(req);
    }
  }

  componentDidMount() {
    this.request(this.props.variables);
  }

  render(): React.ReactNode {
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
    return render(this.state);
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
  { maxDepth = Infinity } = {}
) => {
  const render = (depth = 0): Promise<void> => {
    if (depth < maxDepth) {
      const queue: Array<Promise<void>> = [];
      const waitFor = (req: Promise<void>) => queue.push(req);
      renderElement(
        <TwirpContext.Provider value={{ client, waitFor }}>
          {component}
        </TwirpContext.Provider>
      );
      if (queue.length) {
        return (
          // wait for results then try to go
          // deeper if we succeed
          Promise.all(queue).then(() => render(depth + 1))
        );
      }
    }
    return Promise.resolve();
  };
  return render();
};

// renderElement is a very simple way to render a React element tree
// without any magic. Since we keep track using the context we only
// need the lifecycle method anyway.
function renderElement(element: any, context = {}) {
  if (
    typeof element == "string" ||
    typeof element == "number" ||
    typeof element == "boolean"
  ) {
    // ignore basic elements
  } else if (Array.isArray(element)) {
    // react 16 array of children
    element.forEach(c => c && renderElement(c, context));
  } else if (typeof element.type == "function") {
    // stateless component or class
    let child;
    let childContext = context;
    const Component = element.type;
    const props = Object.assign({}, Component.defaultProps, element.props);

    if (Component.prototype && Component.prototype.isReactComponent) {
      // react class
      const instance = new Component(props, context);
      instance.props = instance.props || props;
      instance.context = instance.context || context;
      instance.state = instance.state || null;
      instance.setState = (newState: object | Function) => {
        if (typeof newState === "function") {
          newState = newState(instance.state, instance.props);
        }
        instance.state = Object.assign({}, instance.state, newState);
      };
      if (instance.componentWillMount) {
        instance.componentWillMount();
      }
      if (instance.getChildContext) {
        childContext = Object.assign({}, context, instance.getChildContext());
      }
      child = instance.render();
    } else {
      // stateless function
      child = Component(props, context);
    }

    Array.of(child).forEach(c => c && renderElement(c, childContext));
  } else if (element.props && element.props.children) {
    // an element with children
    Children.forEach(
      element.props.children,
      c => c && renderElement(c, context)
    );
  }
}
