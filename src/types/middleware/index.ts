import { RequestHandler } from 'express';
import { AuthenticatedRequest } from '../express';

export interface RoleMiddleware {
  (userRole: string): RequestHandler;
}

export interface CheckRoleMiddleware {
  (req: AuthenticatedRequest, res: any, next: any): void;
}

export interface AuthenticatedMiddleware {
  (req: AuthenticatedRequest, res: any, next: any): void;
}
