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
type Request<Req, Res> = (r: Req) => Promise<TwirpResponse<Res>>;
type TwirpResponse<Res> = [Res, TwirpError | undefined, boolean];

const listeners = new EventEmitter();

function toKey(method: TwirpMethod<any, any>, req: any) {
  return method.name + "(" + JSON.stringify(req) + ")";
}

export function invalidate<Req, Res>(method: TwirpMethod<Req, Res>, req: Req) {
  const key = toKey(method, req);
  listeners.emit(key);
}

export function useTwirp<Req, Res>(
  method: TwirpMethod<Req, Res>,
  req: Req
): TwirpResponse<Res>;

export function useTwirp<Req, Res>(
  method: TwirpMethod<Req, Res>
): Request<Req, Res>;

export function useTwirp<Req, Res>(
  method: TwirpMethod<Req, Res>,
  req?: Req
): TwirpResponse<Res> | Request<Req, Res> {
  const { client } = useContext(TwirpContext);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(!!req);
  const [response, setResponse] = useState<Res | undefined>(undefined);
  const [error, setError] = useState<TwirpError | undefined>(undefined);

  const key = toKey(method, req);

  if (typeof client == "undefined") {
    throw new Error(
      "twirp client missing. did you forget the <TwirpContext.Provider>?"
    );
  }

  // listen for invalidations and bump internal version
  useEffect(() => {
    const onChange = () => setVersion(v => v + 1);
    listeners.addListener(key, onChange);
    return () => {
      listeners.removeListener(key, onChange);
    };
  }, [version, key]);

  useEffect(() => {
    if (req) {
      request(req)
        .then(([data, error]) => {
          if (error) {
            setError(error);
          } else {
            setResponse(data);
          }
        })
        .catch(e => {
          console.log("use effect error", e);
          setError(e);
        });
    }
  }, [version, key]);

  const request = async (req: Req): Promise<TwirpResponse<Res>> => {
    console.log("twirp request", toKey(method, req));
    try {
      setLoading(true);
      const res = await method(req, client);
      return [res, undefined, false];
    } finally {
      setLoading(false);
    }
  };

  if (typeof req == "undefined") {
    return request;
  }

  return [response || ({} as Res), error, loading];
}

// as defined at https://github.com/twitchtv/twirp/blob/master/errors.go#L140
type TwirpErrorCode =
  | "canceled"
  | "unknown"
  | "invalid_argument"
  | "deadline_exceeded"
  | "not_found"
  | "bad_route"
  | "already_exists"
  | "permission_denied"
  | "unauthenticated"
  | "resource_exhausted"
  | "failed_precondition"
  | "aborted"
  | "out_of_range"
  | "unimplemented"
  | "internal"
  | "unavailable"
  | "data_loss"
  | "";

type TwirpErrorMeta = {
  [k: string]: string;
};
type TwirpErrorObject = {
  msg: string;
  code: TwirpErrorCode;
  meta: TwirpErrorMeta;
};

export class TwirpError extends Error {
  code: TwirpErrorCode;
  meta: TwirpErrorMeta;
  status: number;

  constructor(status: number, error: TwirpErrorObject) {
    super(error.msg);
    this.status = status;
    this.code = error.code;
    this.meta = error.meta;
  }
}
