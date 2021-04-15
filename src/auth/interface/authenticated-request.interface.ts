import { User } from 'database/user.model';
import { Request } from 'express';
import { AuthenticatedUser } from './authenticated-user.interface';

export interface AuthenticatedRequest extends Request {
  readonly user: Partial<User>;
}
