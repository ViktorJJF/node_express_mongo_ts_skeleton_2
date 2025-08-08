import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { addHours } from 'date-fns';
import { eq } from 'drizzle-orm';
import getDatabase from '../config/database';
import { users, forgotPasswords, userAccess } from '../schemas/database';
import * as db from '../helpers/db';
import * as utils from '../helpers/utils';
import * as auth from '../helpers/auth';
import { buildErrObject } from '../helpers/utils';

const HOURS_TO_BLOCK = 2;
const LOGIN_ATTEMPTS = 5;

/**
 * Generates a token
 * @param {number} userId - user ID
 */
export const generateToken = (userId: number): string => {
  const expiration =
    Math.floor(Date.now() / 1000) +
    60 * parseInt(process.env.JWT_EXPIRATION_IN_MINUTES || '60');
  return auth.encrypt(
    jwt.sign(
      {
        data: {
          _id: userId,
        },
        exp: expiration,
      },
      process.env.JWT_SECRET || 'secret',
    ),
  );
};

export const blockUser = async (user: any) => {
  await db.updateItem(user.id, users, {
    blockExpires: addHours(new Date(), HOURS_TO_BLOCK),
    loginAttempts: user.loginAttempts,
  });
  throw buildErrObject(409, 'BLOCKED_USER');
};

export const saveLoginAttemptsToDB = async (user: any) => {
  await db.updateItem(user.id, users, {
    loginAttempts: user.loginAttempts,
  });
};

const blockIsExpired = (user: any) =>
  user.loginAttempts > LOGIN_ATTEMPTS &&
  user.blockExpires &&
  user.blockExpires <= new Date();

export const checkLoginAttemptsAndBlockExpires = async (user: any) => {
  if (blockIsExpired(user)) {
    await db.updateItem(user.id, users, {
      loginAttempts: 0,
    });
  }
};

export const userIsBlocked = (user: any) => {
  if (user.blockExpires && user.blockExpires > new Date()) {
    throw buildErrObject(409, 'BLOCKED_USER');
  }
};

export const findUser = async (email: string): Promise<any> => {
  const database = getDatabase();
  const result = await database
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (!result || result.length === 0) {
    throw buildErrObject(404, 'La cuenta no existe');
  }

  return result[0];
};

export const findUserById = async (userId: number): Promise<any> => {
  try {
    return await db.getItem(userId, users);
  } catch (error) {
    throw buildErrObject(404, 'La cuenta no existe');
  }
};

export const passwordsDoNotMatch = async (user: any) => {
  const newLoginAttempts = (user.loginAttempts || 0) + 1;
  await db.updateItem(user.id, users, {
    loginAttempts: newLoginAttempts,
  });

  if (newLoginAttempts <= LOGIN_ATTEMPTS) {
    throw buildErrObject(409, 'La contraseña es incorrecta');
  } else {
    const updatedUser = { ...user, loginAttempts: newLoginAttempts };
    await blockUser(updatedUser);
  }
};

export const registerUser = async (body: any): Promise<any> => {
  body.verification = uuidv4();
  // Hash password before creating user
  if (body.password) {
    body.password = await auth.hashPassword(body.password);
  }
  return await db.createItem(body, users);
};

export const verificationExists = async (id: string): Promise<any> => {
  const database = getDatabase();
  const { and } = await import('drizzle-orm');
  const result = await database
    .select()
    .from(users)
    .where(and(eq(users.verification, id), eq(users.verified, false)));

  if (!result || result.length === 0) {
    throw buildErrObject(404, 'NOT_FOUND_OR_ALREADY_VERIFIED');
  }

  return result[0];
};

export const verifyUser = async (user: any) => {
  const item = await db.updateItem(user.id, users, {
    verified: true,
  });
  return {
    email: item.email,
    verified: item.verified,
  };
};

export const markResetPasswordAsUsed = async (req: any, forgot: any) => {
  const item = await db.updateItem(forgot.id, forgotPasswords, {
    used: true,
    ipChanged: utils.getIP(req),
    browserChanged: utils.getBrowserInfo(req),
    countryChanged: utils.getCountry(req),
  });
  if (!item) {
    throw buildErrObject(404, 'NOT_FOUND');
  }
  return utils.buildSuccObject('PASSWORD_CHANGED');
};

export const updatePassword = async (password: string, user: any) => {
  // Hash password before updating
  const hashedPassword = await auth.hashPassword(password);
  const item = await db.updateItem(user.id, users, {
    password: hashedPassword,
  });
  if (!item) {
    throw buildErrObject(404, 'NOT_FOUND');
  }
  return item;
};

export const findUserToResetPassword = async (email: string): Promise<any> => {
  const database = getDatabase();
  const result = await database
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (!result || result.length === 0) {
    throw buildErrObject(404, 'NOT_FOUND');
  }

  return result[0];
};

export const findForgotPassword = async (id: string): Promise<any> => {
  const database = getDatabase();
  const { and } = await import('drizzle-orm');
  const result = await database
    .select()
    .from(forgotPasswords)
    .where(
      and(
        eq(forgotPasswords.verification, id),
        eq(forgotPasswords.used, false),
      ),
    );

  if (!result || result.length === 0) {
    throw buildErrObject(404, 'NOT_FOUND_OR_ALREADY_USED');
  }

  return result[0];
};

export const saveForgotPassword = async (req: any): Promise<any> => {
  const forgotData = {
    email: req.body.email,
    verification: uuidv4(),
    ipRequest: utils.getIP(req),
    browserRequest: utils.getBrowserInfo(req),
    countryRequest: utils.getCountry(req),
    used: false,
  };
  return await db.createItem(forgotData, forgotPasswords);
};

export const forgotPasswordResponse = (item: any) => {
  return {
    msg: 'PASSWORD_RESET_EMAIL_SENT',
    verification:
      process.env.NODE_ENV !== 'production' ? item.verification : undefined,
  };
};

export const checkPermissions = async (data: any, next: any) => {
  try {
    const result = await db.getItem(data.id, users);
    if (data.roles.indexOf(result.role) > -1) {
      return next();
    }
    throw buildErrObject(401, 'UNAUTHORIZED');
  } catch (error) {
    throw buildErrObject(404, 'NOT_FOUND');
  }
};

export const saveUserAccessAndReturnToken = async (req: any, user: any) => {
  const userAccessData = {
    email: user.email,
    ip: utils.getIP(req),
    browser: utils.getBrowserInfo(req),
    country: utils.getCountry(req),
  };
  await db.createItem(userAccessData, userAccess);
  const userInfo = setUserInfo(user);
  return {
    token: generateToken(user.id),
    user: userInfo,
  };
};

export const setUserInfo = (user: any) => {
  let userInfo: any = {
    _id: user.id,
    id: user.id, // Add both for compatibility
    firstName: user.firstName,
    lastName: user.lastName,
    name: `${user.firstName} ${user.lastName || ''}`.trim(),
    email: user.email,
    role: user.role,
    verified: user.verified,
  };
  if (process.env.NODE_ENV !== 'production') {
    userInfo = {
      ...userInfo,
      verification: user.verification,
    };
  }
  return userInfo;
};

export const returnRegisterToken = (item: any, userInfo: any) => {
  if (process.env.NODE_ENV !== 'production') {
    userInfo.verification = item.verification;
  }
  return {
    token: generateToken(item.id),
    user: userInfo,
  };
};
