import { createContext, useContext, useEffect, useState } from "react";
import { EventEmitter } from "events";

export const TwirpContext = createContext<TwirpClientContext<any, any>>({});
export interface TwirpClient<Req, Res> {
  request(method: string, variables: Partial<Req>, options: any): Promise<Res>;
}

interface TwirpClientContext<Req, Res> {
  client?: TwirpClient<Req, Res>;
}

type TwirpMethod<Req, Res> = (r: Req, t: TwirpClient<Req, Res>) => Promise<Res>;
type Request<Req, Res> = (r: Req) => Promise<Res>;

const requests = new Map();
const responses = new Map();
const listeners = new EventEmitter();

export function invalidate<Req, Res>(method: TwirpMethod<Req, Res>, req: Req) {
  const key = method.name + JSON.stringify(req);
  requests.delete(key);
  responses.delete(key);
  listeners.emit(key);
}

export function useTwirp<Req, Res>(
  method: TwirpMethod<Req, Res>,
  req: Req
): Res;
export function useTwirp<Req, Res>(
  method: TwirpMethod<Req, Res>
): Request<Req, Res>;
export function useTwirp<Req, Res>(
  method: TwirpMethod<Req, Res>,
  req?: Req
): Res | Request<Req, Res> {
  const { client } = useContext(TwirpContext);
  const [version, update] = useState(0);

  const key = method.name + JSON.stringify(req);
  const res = responses.get(key);

  useEffect(
    () => {
      const onChange = () => update(version + 1);
      listeners.addListener(key, onChange);
      return () => {
        listeners.removeListener(key, onChange);
      };
    },
    [version, req]
  );

  if (typeof res != "undefined") {
    console.log("res cached", res, key);
    return res;
  }

  if (typeof client == "undefined") {
    throw new Error(
      "twirp client missing. did you forget the <TwirpContext.Provider>?"
    );
  }

  const request = (req: Req) => {
    const key = method.name + JSON.stringify(req);
    const r =
      requests.get(key) ||
      method(req, client).then(res => {
        responses.set(key, res);
        return res;
      });
    requests.set(key, r);
    return r;
  };

  if (typeof req == "undefined") {
    return request;
  }

  throw request(req);
}
