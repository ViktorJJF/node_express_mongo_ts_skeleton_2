import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { addHours } from 'date-fns';
import User from '../models/Users';
import UserAccess from '../models/UserAccess';
import ForgotPassword from '../models/ForgotPassword';
import * as utils from '../helpers/utils';
import * as auth from '../helpers/auth';
import { buildErrObject } from '../helpers/utils';

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
  user.blockExpires = addHours(new Date(), HOURS_TO_BLOCK);
  await user.save();
  throw buildErrObject(409, 'BLOCKED_USER');
};

export const saveLoginAttemptsToDB = async (user: any) => {
  await user.save();
};

const blockIsExpired = (user: any) =>
  user.loginAttempts > LOGIN_ATTEMPTS && user.blockExpires <= new Date();

export const checkLoginAttemptsAndBlockExpires = async (user: any) => {
  if (blockIsExpired(user)) {
    user.loginAttempts = 0;
    await user.save();
  }
};

export const userIsBlocked = (user: any) => {
  if (user.blockExpires > new Date()) {
    throw buildErrObject(409, 'BLOCKED_USER');
  }
};

export const findUser = async (email: string) => {
  const item = await User.findOne(
    { email },
    'password loginAttempts blockExpires name email role verified verification',
  );
  if (!item) {
    throw buildErrObject(404, 'La cuenta no existe');
  }
  return item;
};

export const findUserById = async (userId: string) => {
  const item = await User.findById(userId);
  if (!item) {
    throw buildErrObject(404, 'La cuenta no existe');
  }
  return item;
};

export const passwordsDoNotMatch = async (user: any) => {
  user.loginAttempts += 1;
  await saveLoginAttemptsToDB(user);
  if (user.loginAttempts <= LOGIN_ATTEMPTS) {
    throw buildErrObject(409, 'La contraseña es incorrecta');
  } else {
    await blockUser(user);
  }
};

export const registerUser = async (body: any) => {
  body.verification = uuidv4();
  const user = new User(body);
  return await user.save();
};

export const verificationExists = async (id: string) => {
  const user = await User.findOne({
    verification: id,
    verified: false,
  });
  if (!user) {
    throw buildErrObject(404, 'NOT_FOUND_OR_ALREADY_VERIFIED');
  }
  return user;
};

export const verifyUser = async (user: any) => {
  user.verified = true;
  const item = await user.save();
  return {
    email: item.email,
    verified: item.verified,
  };
};

export const markResetPasswordAsUsed = async (req: any, forgot: any) => {
  forgot.used = true;
  forgot.ipChanged = utils.getIP(req);
  forgot.browserChanged = utils.getBrowserInfo(req);
  forgot.countryChanged = utils.getCountry(req);
  const item = await forgot.save();
  if (!item) {
    throw buildErrObject(404, 'NOT_FOUND');
  }
  return utils.buildSuccObject('PASSWORD_CHANGED');
};

export const updatePassword = async (password: string, user: any) => {
  user.password = password;
  const item = await user.save();
  if (!item) {
    throw buildErrObject(404, 'NOT_FOUND');
  }
  return item;
};

export const findUserToResetPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw buildErrObject(404, 'NOT_FOUND');
  }
  return user;
};

export const findForgotPassword = async (id: string) => {
  const item = await ForgotPassword.findOne({
    verification: id,
    used: false,
  });
  if (!item) {
    throw buildErrObject(404, 'NOT_FOUND_OR_ALREADY_USED');
  }
  return item;
};

export const saveForgotPassword = async (req: any) => {
  const forgot = new ForgotPassword({
    email: req.body.email,
    verification: uuidv4(),
    ipRequest: utils.getIP(req),
    browserRequest: utils.getBrowserInfo(req),
    countryRequest: utils.getCountry(req),
  });
  return await forgot.save();
};

export const forgotPasswordResponse = (item: any) => {
  return {
    msg: 'PASSWORD_RESET_EMAIL_SENT',
    verification:
      process.env.NODE_ENV !== 'production' ? item.verification : undefined,
  };
};

export const checkPermissions = async (data: any, next: any) => {
  const result = await User.findById(data.id);
  if (!result) {
    throw buildErrObject(404, 'NOT_FOUND');
  }
  if (data.roles.indexOf(result.role) > -1) {
    return next();
  }
  throw buildErrObject(401, 'UNAUTHORIZED');
};

export const saveUserAccessAndReturnToken = async (req: any, user: any) => {
  const userAccess = new UserAccess({
    email: user.email,
    ip: utils.getIP(req),
    browser: utils.getBrowserInfo(req),
    country: utils.getCountry(req),
  });
  await userAccess.save();
  const userInfo = setUserInfo(user);
  return {
    token: generateToken(user._id),
    user: userInfo,
  };
};

export const setUserInfo = (req: any) => {
  let user: any = {
    _id: req._id,
    name: req.name,
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
    token: generateToken(item._id),
    user: userInfo,
  };
};
