import { User } from 'database/user.model';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  readonly user: Partial<User>;
}
