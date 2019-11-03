import React from "react";
import Head from "../components/Head";
import Nav from "../components/Nav";
import { DemoService } from "../rpc/demo/service.proto";
import { useRequest } from "../hooks/useRequest";

// can be initiated in a context if we want it shared across components
const {Echo} = new DemoService("http://localhost:4000/twirp/")

const Demo = () => {
  const {data: {message}, loading, error, update} = useRequest(Echo, {message: "hello"});
  
  return (
  <div>
    <Head title="Home" />
    <Nav />
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
          ) : (
            <h1>{message}</h1>
          )}
          <input name="message" placeholder="Echo message" defaultValue="" />
          <button disabled={loading}>Send</button>
        </form>
  </div>
)
};

export default Demo;
