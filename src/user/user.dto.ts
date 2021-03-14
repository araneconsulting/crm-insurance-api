import { LocationType } from 'shared/enum/location-type.enum';
import { RoleType } from '../shared/enum/role-type.enum';

export class UserDto {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly roles?: RoleType[];
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  //Employee fields (this will be moved to a child class later)
  readonly location?: string;
  readonly position?: string;
  readonly baseSalary?: number;
}
