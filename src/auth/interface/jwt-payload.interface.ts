import { RoleType } from "../../shared/enum/role-type.enum";

export interface JwtPayload {
    readonly upn: string;
    readonly sub: string;
    readonly username: string;
    readonly roles: RoleType[];
    readonly firstName: string,
    readonly lastName: string,
    readonly position: string;
    readonly location: Partial<Location>;
    readonly phone: string;
  }
