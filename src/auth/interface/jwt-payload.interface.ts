import { Company } from "database/company.model";
import { RoleType } from "../../shared/enum/role-type.enum";

export interface JwtPayload {
    readonly upn: string;
    readonly sub: string;
    readonly email: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly phone: string;
    readonly roles: RoleType[];
    readonly username: string;
    readonly company: Partial<Company>;
  }
