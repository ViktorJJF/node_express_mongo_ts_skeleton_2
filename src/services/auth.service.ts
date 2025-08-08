import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { addHours } from 'date-fns';
import * as utils from '../helpers/utils';
import * as auth from '../helpers/auth';
import { buildErrObject } from '../helpers/utils';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';

const HOURS_TO_BLOCK = 2;
const LOGIN_ATTEMPTS = 5;

/**
 * Generates a token
 * @param {Object} user - user object
 */
export const generateToken = (user: string): string => {
  const expiration =
    Math.floor(Date.now() / 1000) +
    60 * parseInt(process.env.JWT_EXPIRATION_IN_MINUTES || '60');
  return auth.encrypt(
    jwt.sign(
      {
        data: {
          _id: user,
        },
        exp: expiration,
      },
      process.env.JWT_SECRET || 'default-secret-key',
    ),
  );
};

export const blockUser = async (user: any) => {
  await prisma.user.update({
    where: { id: user.id || user._id },
    data: { blockExpires: addHours(new Date(), HOURS_TO_BLOCK) },
  });
  throw buildErrObject(409, 'BLOCKED_USER');
};

export const saveLoginAttemptsToDB = async (user: any) => {
  await prisma.user.update({
    where: { id: user.id || user._id },
    data: { loginAttempts: user.loginAttempts, blockExpires: user.blockExpires },
  });
};

const blockIsExpired = (user: any) =>
  user.loginAttempts > LOGIN_ATTEMPTS && new Date(user.blockExpires) <= new Date();

export const checkLoginAttemptsAndBlockExpires = async (user: any) => {
  if (blockIsExpired(user)) {
    await prisma.user.update({
      where: { id: user.id || user._id },
      data: { loginAttempts: 0 },
    });
    user.loginAttempts = 0;
  }
};

export const userIsBlocked = (user: any) => {
  if (new Date(user.blockExpires) > new Date()) {
    throw buildErrObject(409, 'BLOCKED_USER');
  }
};

export const findUser = async (email: string) => {
  const item = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      password: true,
      role: true,
      verified: true,
      verification: true,
      loginAttempts: true,
      blockExpires: true,
    },
  });
  if (!item) {
    throw buildErrObject(404, 'La cuenta no existe');
  }
  return item as any;
};

export const findUserById = async (userId: string) => {
  const item = await prisma.user.findUnique({ where: { id: userId } });
  if (!item) {
    throw buildErrObject(404, 'La cuenta no existe');
  }
  return item as any;
};

export const passwordsDoNotMatch = async (user: any) => {
  const newAttempts = (user.loginAttempts || 0) + 1;
  user.loginAttempts = newAttempts;
  await saveLoginAttemptsToDB(user);
  if (newAttempts <= LOGIN_ATTEMPTS) {
    throw buildErrObject(409, 'La contraseña es incorrecta');
  } else {
    await blockUser(user);
  }
};

export const registerUser = async (body: any) => {
  body.verification = uuidv4();
  const SALT_FACTOR = 5;
  const hashed = await bcrypt.hash(body.password, await bcrypt.genSalt(SALT_FACTOR));
  const user = await prisma.user.create({
    data: {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      password: hashed,
      role: body.role,
      verification: body.verification,
      verified: false,
      phone: body.phone,
      city: body.city,
      country: body.country,
      urlTwitter: body.urlTwitter,
      urlGitHub: body.urlGitHub,
    },
  });
  return user as any;
};

export const verificationExists = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: { verification: id, verified: false },
  });
  if (!user) {
    throw buildErrObject(404, 'NOT_FOUND_OR_ALREADY_VERIFIED');
  }
  return user as any;
};

export const verifyUser = async (user: any) => {
  const item = await prisma.user.update({
    where: { id: user.id || user._id },
    data: { verified: true },
  });
  return { email: item.email, verified: item.verified } as any;
};

export const markResetPasswordAsUsed = async (req: any, forgot: any) => {
  const item = await prisma.forgotPassword.update({
    where: { id: forgot.id },
    data: {
      used: true,
      ipChanged: utils.getIP(req),
      browserChanged: utils.getBrowserInfo(req),
      countryChanged: utils.getCountry(req),
    },
  });
  if (!item) {
    throw buildErrObject(404, 'NOT_FOUND');
  }
  return utils.buildSuccObject('PASSWORD_CHANGED');
};

export const updatePassword = async (password: string, user: any) => {
  const SALT_FACTOR = 5;
  const hashed = await bcrypt.hash(password, await bcrypt.genSalt(SALT_FACTOR));
  const item = await prisma.user.update({
    where: { id: user.id || user._id },
    data: { password: hashed },
  });
  if (!item) {
    throw buildErrObject(404, 'NOT_FOUND');
  }
  return item as any;
};

export const findUserToResetPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw buildErrObject(404, 'NOT_FOUND');
  }
  return user as any;
};

export const findForgotPassword = async (id: string) => {
  const item = await prisma.forgotPassword.findFirst({
    where: { verification: id, used: false },
  });
  if (!item) {
    throw buildErrObject(404, 'NOT_FOUND_OR_ALREADY_USED');
  }
  return item as any;
};

export const saveForgotPassword = async (req: any) => {
  const forgot = await prisma.forgotPassword.create({
    data: {
      email: req.body.email,
      verification: uuidv4(),
      ipRequest: utils.getIP(req),
      browserRequest: utils.getBrowserInfo(req),
      countryRequest: utils.getCountry(req),
    },
  });
  return forgot as any;
};

export const forgotPasswordResponse = (item: any) => {
  return {
    msg: 'PASSWORD_RESET_EMAIL_SENT',
    verification:
      process.env.NODE_ENV !== 'production' ? item.verification : undefined,
  };
};

export const checkPermissions = async (data: any, next: any) => {
  const result = await prisma.user.findUnique({ where: { id: data.id } });
  if (!result) {
    throw buildErrObject(404, 'NOT_FOUND');
  }
  if (data.roles.indexOf(result.role) > -1) {
    return next();
  }
  throw buildErrObject(401, 'UNAUTHORIZED');
};

export const saveUserAccessAndReturnToken = async (req: any, user: any) => {
  await prisma.userAccess.create({
    data: {
      email: user.email,
      ip: utils.getIP(req),
      browser: utils.getBrowserInfo(req),
      country: utils.getCountry(req),
    },
  });
  const userInfo = setUserInfo(user);
  return {
    token: generateToken(user.id || user._id),
    user: userInfo,
  } as any;
};

export const setUserInfo = (req: any) => {
  let user: any = {
    _id: req._id || req.id,
    name: req.name || `${req.first_name || ''} ${req.last_name || ''}`.trim(),
    email: req.email,
    role: req.role,
    verified: req.verified,
  };
  if (process.env.NODE_ENV !== 'production') {
    user = {
      ...user,
      verification: req.verification,
    };
  }
  return user;
};

export const returnRegisterToken = (item: any, userInfo: any) => {
  if (process.env.NODE_ENV !== 'production') {
    userInfo.verification = item.verification;
  }
  return {
    token: generateToken(item.id || item._id),
    user: userInfo,
  } as any;
};
