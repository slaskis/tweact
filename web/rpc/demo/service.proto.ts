// generated by protoc-gen-tweact. DO NOT EDIT.
// source: demo/service.proto 


/** 
 * TestEnum has a comment
 */
export enum Test {
  
  UNKNOWN = 0, 
  
/** 
 * So does this value
 */
  HELLO = 1, 
  
  THERE = 2, // and trailing
}


/** 
 * EchoRequest only passes a message
 */
export interface EchoRequest {
  
  message: string; // message to echo
}

/** 
 * EchoResponse only contains a message
 */
export interface EchoResponse {
  
/** 
 * message that was in the request
 */
  message: string; 
}

/** 
 * DemoService shows a very simple service with only
 *  an Echo method.
 */

interface TwirpOptions {
  headers?: object
  fetcher?: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

interface TwirpService {
    request<Req,Res>(method: string, variables: Req, options?: TwirpOptions): Promise<Res>;
}

export class DemoService implements TwirpService {
  prefix: string;
  fetcher: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  options: TwirpOptions;
  constructor(prefix: string, options: TwirpOptions = {}) {
      this.prefix = prefix;
      this.options = options;

      if (typeof options.fetcher == "function") {
        this.fetcher = options.fetcher
      } else if (typeof window != "undefined" && typeof window.fetch == "function") {
        this.fetcher = window.fetch
      } else if (typeof fetch == "function") {
        this.fetcher = fetch
      } else {
        throw new Error("missing fetcher")
      }

      if (!prefix.trim()) {
        throw new Error("missing prefix")
      }
  }
  
/** 
 * Echo responds with the message passed into the
 *  request. Useful for testing and
 * as a minimal
 *  example.
 */
  Echo = (req: EchoRequest) => this.request<EchoRequest, EchoResponse>("demo.DemoService/Echo", req)

  request<Req,Res>(method: string, variables: Req, options: TwirpOptions = {}): Promise<Res> {
    return this.fetcher(this.prefix + method, {
        method: "POST",
        headers: {
            ...this.options.headers,
            ...options.headers,
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(variables)
    })
        .then(res => res.json().then(body => ({ res, body })))
        .then(({ res, body }) => {
            if (!res.ok) {
                const err = new Error(body.msg) as TwirpError;
                err.status = res.status;
                err.code = body.code;
                err.meta = body.meta;
                throw err;
            }
            return body as Res;
        });
  }
}

interface TwirpError extends Error {
  status: number
  code: string
  meta: object
}
