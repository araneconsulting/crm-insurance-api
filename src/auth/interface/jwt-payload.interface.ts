import { RoleType } from "../../shared/enum/role-type.enum";

export interface JwtPayload {
    readonly upn: string;
    readonly sub: string;
    readonly email: string;
    readonly roles: RoleType[];
    readonly firstName: string,
    readonly lastName: string,
    readonly position: string;
    readonly phone: string;
  }
