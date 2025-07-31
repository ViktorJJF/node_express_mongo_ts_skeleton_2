import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { ROLES } from './roles';

export const requireAuth = passport.authenticate('jwt', { session: false });

export const role =
  (userRole: string) => (req: Request, res: Response, next: NextFunction) => {
    req.user.role = userRole;
    next();
  };

export const checkRole = (req: Request, res: Response, next: NextFunction) => {
  if (req.user.role === ROLES.Admin) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
};
export { default as trimRequest } from 'trim-request';
