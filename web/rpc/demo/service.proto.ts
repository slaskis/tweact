
/**
 * EchoRequest only passes a message
 */
export interface EchoRequest {
/**
 * message to echo
 */
  message?: string;
}
/**
 * EchoResponse only contains a message
 */
export interface EchoResponse {
/**
 * message that was in the request
 */
  message?: string;
}
/**
 * TestEnum has a comment
 */
export enum Test {
  UNKNOWN = 0,
/**
 * So does this value
 */
  HELLO = 1,
/**
 * and trailing
 */
  THERE = 2,
}