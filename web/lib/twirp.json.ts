import { TwirpClient, TwirpError } from "./twirp";

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
