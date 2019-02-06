//
// GENERATED CODE -- DO NOT EDIT!
//
// source: demo/DemoService.proto
//
interface TwirpClient<Req, Res> {
  request(method: string, variables: Partial<Req>, options: any): Promise<Res>;
}
// TestEnum has a comment
export enum Test {
  UNKNOWN = 0,
// So does this value
  HELLO = 1,
// and trailing
  THERE = 2,
}
// EchoRequest only passes a message
export interface EchoRequest {
// message to echo
  message?: string;
}
// EchoResponse only contains a message
export interface EchoResponse {
// message that was in the request
  message?: string;
}
// DemoService shows a very simple service with only  an Echo method.
// Echo responds with the message passed into the  request. Useful for
// testing and as a minimal  example.
export const Echo = (r: EchoRequest, t: TwirpClient<EchoRequest, EchoResponse>, o = {}) => t.request("demo.DemoService/Echo", r, o);