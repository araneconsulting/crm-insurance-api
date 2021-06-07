import { EmployeeInfo } from 'business/sub-docs/employee-info';
import { IsArray, IsDateString, IsEmail, IsNotEmpty, IsNotEmptyObject, IsObject, IsOptional } from 'class-validator';
import { Company } from 'database/company.model';
import { Location } from 'database/location.model';
import { User } from 'database/user.model';
import { Address } from 'shared/sub-documents/address';
import { Communication } from 'shared/sub-documents/communication';
import { RoleType } from '../../shared/enum/role-type.enum';
import { EmailSettings } from './email-settings';

export class UserDto {
  @IsOptional()
  @IsObject()
  readonly address: Address;

  @IsOptional()
  @IsDateString()
  readonly dob: string;

  @IsOptional()
  @IsNotEmptyObject()
  readonly communication: Communication;

  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsNotEmptyObject()
  readonly emailSettings: EmailSettings;

  @IsOptional()
  @IsNotEmpty()
  readonly firstName: string;

  @IsOptional()
  readonly gender: string;

  @IsOptional()
  readonly language: string;

  @IsOptional()
  readonly lastName: string;

  @IsOptional()
  readonly mobilePhone: string;

  @IsOptional()
  readonly phone: string;

  @IsOptional()
  @IsArray()
  readonly roles: RoleType[];

  @IsOptional()
  @IsDateString()
  readonly startedAt: string;

  @IsOptional()
  readonly timezone: string;

  @IsOptional()
  @IsNotEmpty()
  readonly username: string;

  @IsOptional()
  readonly website: string;

  //EMPLOYEE DATA (DEPENDS ON BUSINESS MODEL)

  @IsOptional()
  @IsNotEmpty()
  readonly company: Partial<Company>;

  @IsOptional()
  @IsNotEmpty()
  readonly employeeInfo: EmployeeInfo;

  @IsOptional()
  @IsNotEmpty()
  readonly location: Partial<Location>;

  @IsOptional()
  @IsNotEmpty()
  readonly supervisor: Partial<User>;
}
