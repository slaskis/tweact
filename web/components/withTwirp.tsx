import React from "react";
import { NextContext } from "next";
import "isomorphic-fetch";

import {
  renderState,
  TwirpJSONClient as TwirpClient,
  TwirpProvider,
  InMemoryCache
} from "@department/twirp-component";

const prefix = "http://localhost:4000/twirp/";

type Props = {
  ssrCache?: string;
} & { children?: React.ReactNode };

const withTwirp = (Component: React.ComponentClass | React.SFC) =>
  class extends React.Component<Props> {
    static async getInitialProps({ req }: NextContext) {
      const cache = new InMemoryCache();
      // only render state in ssr. let client side navigation
      // show loading states instead
      if (req) {
        try {
          const client = new TwirpClient(prefix);
          await renderState(client, cache, <Component />);
        } catch (err) {
          console.error("renderState err", err);
        }
      }
      return { ssrCache: await cache.dump() };
    }

    twirp = {
      client: new TwirpClient(prefix),
      cache: new InMemoryCache().load(this.props.ssrCache)
    };

    render() {
      return (
        <TwirpProvider value={this.twirp}>
          <Component {...this.props} />
        </TwirpProvider>
      );
    }
  };

export default withTwirp;
