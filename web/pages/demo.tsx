import React, { Placeholder } from "react";
import Head from "../components/Head";
import Nav from "../components/Nav";
import withTwirp from "../components/withTwirp";
import { Echo } from "../rpc/demo/DemoService";

const Demo = () => (
  <div>
    <Head title="Home" />
    <Nav />
    <Placeholder delayMs={1000} fallback={<span>Loading...</span>}>
      <Echo wait>
        {({ message }, update) => (
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
            {message ? <h1>{message}</h1> : null}
            <input name="message" placeholder="Echo message" defaultValue="" />
            <button>Send</button>
          </form>
        )}
      </Echo>
    </Placeholder>
  </div>
);

export default withTwirp(Demo);
