import React from "react";
import Head from "../components/Head";
import Nav from "../components/Nav";
import withTwirp from "../components/withTwirp";
import { Echo } from "../rpc/demo/DemoService";

const Demo = () => (
  <div>
    <Head title="Home" />
    <Nav />
    <Echo wait>
      {({ data: { message }, error, loading, update }) => (
        <form
          onSubmit={evt => {
            evt.preventDefault();
            const message = evt.currentTarget.elements[0] as HTMLInputElement;
            if (message) {
              update({
                message: message.value
              });
            }
          }}
        >
          {loading ? (
            "Loading..."
          ) : error ? (
            <span>Error: {error.message}</span>
          ) : message ? (
            <h1>{message}</h1>
          ) : null}
          <input name="message" placeholder="Echo message" defaultValue="" />
          <button disabled={loading}>Send</button>
        </form>
      )}
    </Echo>
  </div>
);

export default withTwirp(Demo);
