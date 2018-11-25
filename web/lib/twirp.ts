import { createContext, useCallback, useContext, useState } from "react";

export interface TwirpClient<Req, Res> {
  request(method: string, variables: Partial<Req>, options: any): Promise<Res>;
}

interface TwirpClientContext<Req, Res> {
  client?: TwirpClient<Req, Res>;
}

export const TwirpContext = createContext<TwirpClientContext<any, any>>({});

type TwirpMethod<Req, Res> = (r: Req, t: TwirpClient<Req, Res>) => Promise<Res>;
type Request<Req, Res> = (r: Req) => Promise<Res>;

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
  const [res, setRes] = useState<Res | undefined>(undefined);

  if (typeof client == "undefined") {
    throw new Error(
      "twirp client missing. did you forget the <TwirpContext.Provider>?"
    );
  }

  const request = useCallback(
    (req: Req) => {
      return method(req, client).then((res: Res) => {
        setRes(res);
        return res;
      });
    },
    [method, client, req]
  );

  if (typeof req == "undefined") {
    return request;
  }

  if (typeof res == "undefined") {
    throw request(req);
  }

  return res;
}
