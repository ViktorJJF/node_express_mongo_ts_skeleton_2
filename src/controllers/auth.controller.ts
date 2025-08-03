import { Request, Response, NextFunction } from 'express';
import { matchedData } from 'express-validator';
import * as utils from '../helpers/utils';
import * as auth from '../helpers/auth';
import * as emailer from '../helpers/emailer';
import * as AuthService from '../services/auth.service';

/**
 * Login function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { body } = req;
    const user: any = await AuthService.findUser(body.email);
    AuthService.userIsBlocked(user);
    await AuthService.checkLoginAttemptsAndBlockExpires(user);
    const isPasswordMatch: any = await auth.checkPassword(body.password, user);
    if (!isPasswordMatch) {
      await AuthService.passwordsDoNotMatch(user);
    } else {
      user.loginAttempts = 0;
      await AuthService.saveLoginAttemptsToDB(user);
      res
        .status(200)
        .json(await AuthService.saveUserAccessAndReturnToken(req, user));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Register function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { body } = req;
    const doesEmailExists = await emailer.emailExists(body.email);
    if (!doesEmailExists) {
      const item: any = await AuthService.registerUser(body);
      const userInfo = AuthService.setUserInfo(item);
      const response = AuthService.returnRegisterToken(item, userInfo);
      emailer.sendRegistrationEmailMessage(item);
      res.status(201).json({ ok: true, ...response });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Verify function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
export const verify = async (
  req: any,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = matchedData(req);
    const user = await AuthService.verificationExists(data.id);
    res.status(200).json(await AuthService.verifyUser(user));
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const locale = (req as any).getLocale();
    const data = matchedData(req);
    await AuthService.findUser(data.email);
    const item: any = await AuthService.saveForgotPassword(req);
    emailer.sendResetPasswordEmailMessage(locale, item);
    res.status(200).json(AuthService.forgotPasswordResponse(item));
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = matchedData(req);
    const hasForgotPassword: any = await AuthService.findForgotPassword(
      data.id,
    );
    const user = await AuthService.findUserToResetPassword(
      hasForgotPassword.email,
    );
    await AuthService.updatePassword(data.password, user);
    const result = await AuthService.markResetPasswordAsUsed(
      req,
      hasForgotPassword,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh token function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
export const getRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const tokenEncrypted = (req.headers.authorization || '')
      .replace('Bearer ', '')
      .trim();
    let userId: any = await auth.getUserIdFromToken(tokenEncrypted);
    userId = await utils.isIDGood(userId);
    const user = await AuthService.findUserById(userId);
    const token: any = await AuthService.saveUserAccessAndReturnToken(
      req,
      user,
    );
    delete token.user;
    res.status(200).json(token);
  } catch (error) {
    next(error);
  }
};

/**
 * Roles authorization function called by route
 * @param {Array} roles - roles specified on the route
 */
export const roleAuthorization =
  (roles: string[]) => async (req: any, res: Response, next: NextFunction) => {
    try {
      const data = {
        id: req.user._id,
        roles,
      };
      await AuthService.checkPermissions(data, next);
    } catch (error) {
      next(error);
    }
  };

/**
 * Returns user from session
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
export const me = async (req: any, res: Response, next: NextFunction) => {
  try {
    const tokenEncrypted = (req.headers.authorization || '')
      .replace('Bearer ', '')
      .trim();
    const id = await auth.getUserIdFromToken(tokenEncrypted);
    const user = await AuthService.findUserById(id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
