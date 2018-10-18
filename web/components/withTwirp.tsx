import React from "react";
import { createCache } from "react-cache";
import "isomorphic-fetch";

import {
  TwirpJSONClient as TwirpClient,
  TwirpProvider
} from "@department/twirp-component";

const prefix = "http://localhost:4000/twirp/";

const withTwirp = (Component: React.ComponentClass | React.SFC) =>
  class extends React.Component {
    newCache = () => {
      console.log("invalidating cache");
      const cache = createCache(this.newCache);
      if (this.twirp) {
        this.twirp.cache = cache;
      }
      return cache;
    };

    twirp = {
      client: new TwirpClient(prefix),
      cache: this.newCache()
    };

    render() {
      // skip ssr completely for now
      if (typeof window == "undefined") {
        return null;
      }
      return (
        <TwirpProvider value={this.twirp}>
          <Component {...this.props} />
        </TwirpProvider>
      );
    }
  };

export default withTwirp;
