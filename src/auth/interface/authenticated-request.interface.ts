import { Request } from 'express';
import { AuthenticatedUser } from './authenticated-user.interface';

export interface AuthenticatedRequest extends Request {
  readonly user: AuthenticatedUser;
}
