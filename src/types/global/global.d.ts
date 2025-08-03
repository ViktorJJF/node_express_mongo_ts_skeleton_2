declare module 'trim-request' {
  import { RequestHandler } from 'express';

  interface TrimRequestOptions {
    body?: boolean;
    query?: boolean;
    params?: boolean;
    headers?: boolean;
  }

  const trimRequest: {
    all: RequestHandler;
    body: RequestHandler;
    query: RequestHandler;
    params: RequestHandler;
    headers: RequestHandler;
  };
  export = trimRequest;
}

declare module 'nodemailer-mailgun-transport' {
  import { TransportOptions } from 'nodemailer';

  interface MailgunTransportOptions {
    auth: {
      api_key: string;
      domain: string;
    };
    host?: string;
    port?: number;
    secure?: boolean;
  }

  const mailgunTransport: (
    options: MailgunTransportOptions,
  ) => TransportOptions;
  export = mailgunTransport;
}
