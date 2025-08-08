import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { ROLES } from './roles';
import { IUser } from '../types/entities/users';
import { AuthenticatedRequest } from '../types/express';

export const requireAuth = passport.authenticate('jwt', { session: false });

export const role =
  (userRole: string) => (req: Request, res: Response, next: NextFunction) => {
    if ((req as AuthenticatedRequest).user) {
      (req as AuthenticatedRequest).user!.role = userRole as any;
    }
    next();
  };

export const checkRole = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  if (authReq.user && authReq.user.role === ROLES.Admin) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
};
// @ts-ignore
export { default as trimRequest } from 'trim-request';
