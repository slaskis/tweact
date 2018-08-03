import React, { Placeholder } from "react";
import { createResource, Cache, createCache } from "simple-cache-provider";
import { TwirpClient, TwirpJSONClient } from "./twirp";

interface TwirpClientContext<Req, Res> {
  client?: TwirpClient<Req, Res>;
  cache?: Cache;
}

const TwirpContext = React.createContext<TwirpClientContext<any, any>>({});

interface TwirpRenderCallback<Req, Res> {
  data: Res | Partial<Res>;
  update: UpdateFunc<Req>;
}

type UpdateFunc<Req> = (variables?: Partial<Req>) => void;

interface TwirpServiceProps<Req, Res> {
  wait?: boolean;
  variables?: Req | Partial<Req>;
  cache?: Cache;
  client?: TwirpClient<Req, Res>;
  children: (r: TwirpRenderCallback<Req, Res>) => React.ReactNode;
}

const toKey = (method: string, req: any) => method + ":" + JSON.stringify(req);

interface TwirpRecord<Req, Res> {
  variables: Req | Partial<Req>;
  client: TwirpClient<Req, Res>;
}

abstract class TwirpService<Req, Res> extends React.Component<
  TwirpServiceProps<Req, Res>
> {
  abstract method: string;
  resource = createResource(
    (rec: TwirpRecord<Req, Res>) =>
      rec.client.request(this.method, rec.variables, {}),
    req => toKey(this.method, req)
  );

  // client: TwirpClient<Req, Res>

  private data(context: TwirpClientContext<Req, Res>) {
    const cache = this.props.cache || context.cache;
    const client = this.props.client || context.client;
    if (!cache) {
      throw new Error("missing cache. forgot a provider?");
    }
    if (!client) {
      throw new Error("missing client. forgot a provider?");
    }
    return this.resource.read(cache, {
      variables: this.props.variables,
      client
    });
  }

  private update(variables?: Partial<Req>) {
    // TODO invalidate cache and render
  }

  render() {
    return (
      <TwirpContext.Consumer>
        {twirp =>
          this.props.children({
            data: this.data(twirp),
            update: this.update
          })
        }
      </TwirpContext.Consumer>
    );
  }
}

/**
 * EchoRequest only passes a message
 */
export interface EchoRequest {
  /**
   * message to echo
   */
  message: string;
}
/**
 * EchoResponse only contains a message
 */
export interface EchoResponse {
  /**
   * message that was in the request
   */
  message: string;
}

export class Echo extends TwirpService<EchoRequest, EchoResponse> {
  method = "demo.DemoService/Echo";
}

let cache: Cache;
const newCache = () => (cache = createCache(newCache));
newCache();

const client: TwirpClient<any, any> = new TwirpJSONClient("");

const renderState = () => (
  <TwirpContext.Provider value={{ client, cache }}>
    <Placeholder delayMs={1000} fallback={<span>Loading...</span>}>
      <Echo client={client} cache={cache}>
        {({ data: { message } }) => message}
      </Echo>
      <Echo variables={{ message: "error" }}>
        {({ data: { message } }) => message}
      </Echo>
      <Echo wait>
        {({ data: { message }, update }) => (
          <form onSubmit={evt => update({ message: evt.currentTarget.value })}>
            <input placeholder="Feed me a message" />
            {message ? "> " + message : null}
          </form>
        )}
      </Echo>
    </Placeholder>
  </TwirpContext.Provider>
);
