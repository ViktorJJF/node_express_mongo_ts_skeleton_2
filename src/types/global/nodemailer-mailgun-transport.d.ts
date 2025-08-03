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
