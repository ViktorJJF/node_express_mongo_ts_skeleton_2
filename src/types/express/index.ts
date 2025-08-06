import { Request } from 'express';
import { IUser } from '../entities';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export interface UserRequest extends Request {
  user?: IUser;
}

export type { Request };
