import React from "react";
import { createResource, Cache } from "react-cache";

export { TwirpJSONClient } from "./twirp.json";

export interface TwirpClient<Req, Res> {
  request(method: string, variables: Partial<Req>, options: any): Promise<Res>;
}

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
          cache: value.cache || parent.cache
        }}
        children={children}
      />
    )}
  </TwirpContext.Consumer>
);

interface TwirpClientContext<Req, Res> {
  client?: TwirpClient<Req, Res>;
  cache?: Cache;
}

const TwirpContext = React.createContext<TwirpClientContext<any, any>>({});

type UpdateFunc<Req> = (variables?: Partial<Req>) => void;

interface TwirpServiceProps<Req, Res> {
  wait?: boolean;
  variables?: Req | Partial<Req>;
  cache?: Cache;
  client?: TwirpClient<Req, Res>;
  children: (
    data: Res | Partial<Res>,
    update: UpdateFunc<Req>
  ) => React.ReactNode;
}

const toKey = (method: string, req: any) => method + ":" + JSON.stringify(req);

interface TwirpRecord<Req, Res> {
  variables: Req | Partial<Req>;
  client: TwirpClient<Req, Res>;
}

export abstract class TwirpService<Req, Res> extends React.Component<
  TwirpServiceProps<Req, Res>
> {
  abstract method: string;

  resource = createResource(
    async (rec: TwirpRecord<Req, Res>) => {
      console.log("sending request", this.method, rec.variables);
      const res = await rec.client.request(this.method, rec.variables, {});
      console.log("got response", res);
      return res;
    },
    (req: any) => {
      const key = toKey(this.method, req.variables);
      console.log("hash for request", key);
      return key;
    }
  );

  state = {
    wait: this.props.wait
  };

  private data(context: TwirpClientContext<Req, Res>) {
    const cache = this.props.cache || context.cache;
    const client = this.props.client || context.client;
    if (!cache) {
      throw new Error("missing cache. forgot a provider?");
    }
    if (!client) {
      throw new Error("missing client. forgot a provider?");
    }
    if (this.state.wait) {
      return {};
    }
    return this.resource.read(cache, {
      variables: this.props.variables || {},
      client
    });
  }

  private update(_variables?: Partial<Req>) {
    // TODO invalidate cache and render
    this.setState({
      wait: false
    });
  }

  render() {
    return (
      <TwirpContext.Consumer>
        {twirp => this.props.children(this.data(twirp), this.update)}
      </TwirpContext.Consumer>
    );
  }
}

// /**
//  * EchoRequest only passes a message
//  */
// export interface EchoRequest {
//   /**
//    * message to echo
//    */
//   message: string;
// }
// /**
//  * EchoResponse only contains a message
//  */
// export interface EchoResponse {
//   /**
//    * message that was in the request
//    */
//   message: string;
// }

// export class Echo extends TwirpService<EchoRequest, EchoResponse> {
//   method = "demo.DemoService/Echo";
// }

// let cache: Cache;
// const newCache = () => (cache = createCache(newCache));
// newCache();

// const client: TwirpClient<any, any> = new TwirpJSONClient("");

// const renderState = () => (
//   <TwirpContext.Provider value={{ client, cache }}>
//     <Placeholder delayMs={1000} fallback={<span>Loading...</span>}>
//       <Echo client={client} cache={cache}>
//         {({ data: { message } }) => message}
//       </Echo>
//       <Echo variables={{ message: "error" }}>
//         {({ data: { message } }) => message}
//       </Echo>
//       <Echo wait>
//         {({ data: { message }, update }) => (
//           <form onSubmit={evt => update({ message: evt.currentTarget.value })}>
//             <input placeholder="Feed me a message" />
//             {message ? "> " + message : null}
//           </form>
//         )}
//       </Echo>
//     </Placeholder>
//   </TwirpContext.Provider>
// );
