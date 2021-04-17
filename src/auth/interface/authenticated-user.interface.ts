import { EmployeeInfo } from 'business/sub-docs/employee-info';
import { Company } from 'database/company.model';
import { User } from 'database/user.model';
import { Address } from 'shared/sub-documents/address';
import { Communication } from 'shared/sub-documents/communication';
import { EmailSettingsDto } from 'user/dto/email-settings.dto';
import { RoleType } from '../../shared/enum/role-type.enum';

export interface AuthenticatedUser {
  readonly address: Address;
  readonly dob: string;
  readonly communication: Communication;
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
  readonly employeeInfo: EmployeeInfo;
  readonly location: Partial<Location>;
  readonly supervisor: Partial<User>;
}
