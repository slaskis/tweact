import React from "react";
import "isomorphic-fetch";

import { TwirpContext } from "../lib/twirp";
import { TwirpJSONClient as TwirpClient } from "../lib/twirp.json";

const withTwirp = (
  Component: React.ComponentClass | React.SFC,
  prefix = "http://localhost:4000/twirp/"
) =>
  class extends React.Component {
    twirp = {
      client: new TwirpClient(prefix)
    };

    render() {
      // skip ssr completely for now
      if (typeof window == "undefined") {
        return null;
      }
      return (
        <TwirpContext.Provider value={this.twirp}>
          <Component {...this.props} />
        </TwirpContext.Provider>
      );
    }
  };

export default withTwirp;
