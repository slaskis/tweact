import React, { Suspense, useState } from "react";
import { useTwirp } from "../lib/twirp";

import { Head } from "../components/Head";
import { Nav } from "../components/Nav";
import withTwirp from "../components/withTwirp";
import { Echo } from "../rpc/demo/DemoService";

const Demo = () => (
  <div>
    <Head title="Home" />
    <Nav />
    <Suspense fallback={<span>Loading...</span>}>
      <Echoes />
    </Suspense>
  </div>
);

function Echoes() {
  let update = useTwirp(Echo);
  let [message, setMessage] = useState("");

  function onSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const message = evt.currentTarget.elements[0];
    if (message instanceof HTMLInputElement) {
      update({
        message: message.value
      }).then(res => {
        setMessage(res.message);
        message.focus();
      });
    }
  }

  return (
    <form onSubmit={onSubmit}>
      {message ? <h1>{message}</h1> : null}
      <input name="message" placeholder="Echo message" defaultValue="" />
      <button>Send</button>
    </form>
  );
}

export default withTwirp(Demo);
