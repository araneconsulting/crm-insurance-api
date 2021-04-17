import { Company } from 'database/company.model';
import { User } from 'database/user.model';
import { AddressDto } from 'shared/dto/address.dto';
import { CommunicationDto } from 'shared/dto/communication.dto';
import { EmployeeInfoDto } from 'shared/dto/employee-info.dto';
import { EmailSettingsDto } from 'user/dto/email-settings.dto';
import { RoleType } from '../../shared/enum/role-type.enum';

export interface AuthenticatedUser {
  readonly address: AddressDto;
  readonly dob: string;
  readonly communication: CommunicationDto;
  readonly email: string;
  readonly emailSettings: EmailSettingsDto;
  readonly firstName: string;
  readonly gender: string; //can be: male (M), female (F), transgender (T), other (O)
  readonly language: string;
  readonly lastName: string;
  readonly mobilePhone: string;
  readonly phone: string;
  readonly roles: RoleType[];
  readonly startedAt: string;
  readonly timezone: string;
  readonly username: string;
  readonly website: string;
  
  //EMPLOYEE DATA (DEPENDS ON BUSINESS MODEL)
  readonly company: Partial<Company>;
  readonly employeeInfo: EmployeeInfoDto;
  readonly location: Partial<Location>;
  readonly supervisor: Partial<User>;
}
