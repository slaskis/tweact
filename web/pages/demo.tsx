import React, { useState } from "react";
import { useTwirp, TwirpError } from "../lib/twirp";

import { Head } from "../components/Head";
import { Nav } from "../components/Nav";
import withTwirp from "../components/withTwirp";
import { Echo } from "../rpc/demo/DemoService";

const Demo = () => (
  <div>
    <Head title="Home" />
    <Nav />
    <Echoes />
  </div>
);

function Echoes() {
  let update = useTwirp(Echo);
  let [message, setMessage] = useState("");
  let [error, setError] = useState<TwirpError | undefined>(undefined);

  async function onSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();

    const message = evt.currentTarget.elements[0];
    if (message instanceof HTMLInputElement) {
      try {
        setError(undefined);
        let [res] = await update({ message: message.value });
        if (res.message) {
          setMessage(res.message);
          message.focus();
          message.select();
        }
      } catch (err) {
        setError(err);
      }
    }
  }

  return (
    <form onSubmit={onSubmit}>
      {message ? <h1>{message}</h1> : null}
      <div>
        <input
          autoFocus
          autoComplete="off"
          name="message"
          placeholder="Echo message"
          defaultValue=""
        />
        {error ? (
          <p className="text-red text-xs italic">{error.message}</p>
        ) : null}
      </div>
      <button>Send</button>
    </form>
  );
}

export default withTwirp(Demo);
