import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';
import User from '../models/Users';
import { buildErrObject } from './utils';
import logger from '../config/logger';

interface UserData {
  name: string;
  email: string;
  verification: string;
}

interface EmailData {
  user: UserData;
  subject: string;
  htmlMessage: string;
}

const sendEmail = async (data: EmailData): Promise<boolean> => {
  const auth = {
    auth: {
      api_key: process.env.EMAIL_SMTP_API_MAILGUN as string,
      domain: process.env.EMAIL_SMTP_DOMAIN_MAILGUN as string,
    },
  };
  const transporter = nodemailer.createTransport(mg(auth));
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: `${data.user.name} <${data.user.email}>`,
    subject: data.subject,
    html: data.htmlMessage,
  };
  if (process.env.EMAIL_SMTP_API_MAILGUN) {
    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch {
      return false;
    }
  }
  return false;
};

export const emailExistsExcludingMyself = async (
  id: string,
  email: string,
): Promise<boolean> => {
  const item = await User.findOne({
    email,
    _id: { $ne: id },
  });
  if (item) {
    throw buildErrObject(422, 'EMAIL_ALREADY_EXISTS');
  }
  return false;
};

export const prepareToSendEmail = async (
  user: UserData,
  subject: string,
  htmlMessage: string,
): Promise<void> => {
  const data: EmailData = {
    user,
    subject,
    htmlMessage,
  };
  if (process.env.NODE_ENV === 'production') {
    const messageSent = await sendEmail(data);
    if (messageSent) {
      logger.info(`Email SENT to: ${user.email}`);
    } else {
      logger.error(`Email FAILED to: ${user.email}`);
    }
  } else if (process.env.NODE_ENV === 'development') {
    logger.debug(data);
  }
};

export const emailExists = async (email: string): Promise<boolean> => {
  const item = await User.findOne({ email });
  if (item) {
    throw buildErrObject(422, 'EMAIL_ALREADY_EXISTS');
  }
  return false;
};

export const sendRegistrationEmailMessage = async (
  user: UserData,
): Promise<void> => {
  const subject = 'Verificar tu Email en el Sistema';
  const htmlMessage = `<p>Hola ${user.name}.</p> <p>¡Bienvenido! Para verificar tu Email, por favor haz click en este enlace:</p> <p>${process.env.FRONTEND_URL}/verify/${user.verification}</p> <p>Gracias.</p>`;
  await prepareToSendEmail(user, subject, htmlMessage);
};

export const sendResetPasswordEmailMessage = async (
  locale: string = 'es',
  user: UserData,
): Promise<void> => {
  logger.debug(`Sending reset password email for locale: ${locale}`);
  const subject = 'Olvidaste tu contraseña...';
  const htmlMessage = 'olvidaste la contraseña';
  await prepareToSendEmail(user, subject, htmlMessage);
};
