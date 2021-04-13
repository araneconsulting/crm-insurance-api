import { RoleType } from '../../shared/enum/role-type.enum';

export interface AuthenticatedUser {
  readonly username: string;
  readonly firstName: string,
  readonly lastName: string,
  readonly id: string;
  readonly email: string;
  readonly roles: RoleType[];
  readonly position: string;
  readonly location: Partial<Location>;
  readonly phone: string;
}
