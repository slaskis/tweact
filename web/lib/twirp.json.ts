import { TwirpClient } from "./twirp";

export class TwirpJSONClient<Req, Res> implements TwirpClient<Req, Res> {
  prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  request(
    method: string,
    variables: Req,
    options: { headers?: object } = {}
  ): Promise<Res> {
    console.log("json client request", this.prefix + method, variables);
    return fetch(this.prefix + method, {
      method: "POST",
      headers: {
        ...options.headers,
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(variables)
    })
      .then(res => res.json().then(body => ({ res, body })))
      .then(({ res, body }) => {
        if (!res.ok) {
          throw new TwirpError(res.status, body);
        }
        return body as Res;
      });
  }
}

type TwirpErrorMeta = {
  [k: string]: string;
};
type TwirpErrorObject = {
  msg: string;
  code: string;
  meta: TwirpErrorMeta;
};

class TwirpError extends Error {
  code: string;
  meta: TwirpErrorMeta;
  status: number;
  message: string;

  constructor(status: number, error: TwirpErrorObject) {
    super(error.msg);
    this.status = status;
    this.code = error.code;
    this.meta = error.meta;
    this.message = error.msg;
  }
}
