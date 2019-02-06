import React from "react";
import "isomorphic-fetch";

import { TwirpContext } from "../lib/twirp";
import { TwirpJSONClient as TwirpClient } from "../lib/twirp.json";

const withTwirp = (
  Component: React.ComponentClass | React.SFC,
  prefix = "http://localhost:4000/twirp/"
) =>
  class WithTwirp extends React.Component {
    static displayName = `WithTwirp(${Component.displayName ||
      Component.name ||
      "<unnamed>"})`;

    twirp = {
      client: new TwirpClient(prefix)
    };

    render() {
      return (
        <TwirpContext.Provider value={this.twirp}>
          <Component {...this.props} />
        </TwirpContext.Provider>
      );
    }
  };

export default withTwirp;
