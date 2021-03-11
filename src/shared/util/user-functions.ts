import { User } from 'database/user.model';
import { ADMIN_ROLES, EXECUTIVE_ROLES, SELLER_ROLES } from 'shared/const/project-constants';


export function isAdmin(
  user: Partial<User>
): any {
  return ADMIN_ROLES.includes(user.roles[0]);
}

export function isExecutive(
  user: Partial<User>
): any {
  return EXECUTIVE_ROLES.includes(user.roles[0]);
}

export function isSeller(
  user: Partial<User>
): any {
  return SELLER_ROLES.includes(user.roles[0]);
}

export function getPrimaryRole(user: Partial<User>):string{
  return (user.roles && user.roles.length) && user.roles[0].toUpperCase();
}
