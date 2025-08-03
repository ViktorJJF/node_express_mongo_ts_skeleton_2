declare module 'trim-request' {
  import { RequestHandler } from 'express';

  interface TrimRequestOptions {
    body?: boolean;
    query?: boolean;
    params?: boolean;
    headers?: boolean;
  }

  function trimRequest(options?: TrimRequestOptions): RequestHandler;
  const trimRequest: {
    all: RequestHandler;
    body: RequestHandler;
    query: RequestHandler;
    params: RequestHandler;
    headers: RequestHandler;
  };
  export = trimRequest;
}
