import { Company } from "database/company.model";
import { User } from "database/user.model";
import { AddressDto } from "shared/dto/address.dto";
import { CommunicationDto } from "shared/dto/communication.dto";
import { EmployeeInfoDto } from "shared/dto/employee-info.dto";
import { EmailSettingsDto } from "user/dto/email-settings.dto";
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
  }
