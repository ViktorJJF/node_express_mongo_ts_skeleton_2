import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';
import logger from '../config/logger';

const auth = {
  auth: {
    api_key: process.env.EMAIL_SMTP_API_MAILGUN,
    domain: process.env.EMAIL_SMTP_DOMAIN_MAILGUN,
  },
};

const transporter = nodemailer.createTransport(mg(auth));

const mailOptions = {
  from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<p>This is a test email</p>',
};

transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    logger.error(`Error: ${err}`);
  } else {
    logger.info(`Response: ${info}`);
  }
});
