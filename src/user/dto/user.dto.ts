import {
  IsArray,
  IsEmail,
IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Company } from 'database/company.model';
import { User } from 'database/user.model';
import { AddressDto } from 'shared/dto/address.dto';
import { CommunicationDto } from 'shared/dto/communication.dto';
import { EmployeeInfoDto } from 'shared/dto/employee-info.dto';
import { RoleType } from '../../shared/enum/role-type.enum';
import { EmailSettingsDto } from './email-settings.dto';

export class UserDto extends Map<any, any> {
  @IsOptional()
  @IsNotEmpty()
  readonly address: AddressDto;

  @IsOptional()
  @IsNotEmpty()
  readonly dob: string;

  @IsOptional()
  @IsNotEmpty()
  readonly communication: CommunicationDto;

  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsNotEmpty()
  readonly emailSettings: EmailSettingsDto;

  @IsOptional()
  @IsNotEmpty()
  readonly firstName: string;

  @IsOptional()
  @IsNotEmpty()
  readonly gender: string;

  @IsOptional()
  @IsNotEmpty()
  readonly language: string;

  @IsOptional()
  @IsNotEmpty()
  readonly lastName: string;

  @IsOptional()
  @IsNotEmpty()
  readonly mobilePhone: string;

  @IsOptional()
  @IsNotEmpty()
  readonly phone: string;

  @IsOptional()
  @IsArray()
  readonly roles: RoleType[];

  @IsOptional()
  @IsNotEmpty()
  readonly startedAt: string;

  @IsOptional()
  @IsNotEmpty()
  readonly timezone: string;

  @IsOptional()
  @IsNotEmpty()
  readonly username: string;

  @IsOptional()
  @IsNotEmpty()
  readonly website: string;

  //EMPLOYEE DATA (DEPENDS ON BUSINESS MODEL)

  @IsOptional()
  @IsNotEmpty()
  readonly company: Partial<Company>;

  @IsOptional()
  @IsNotEmpty()
  readonly employeeInfo: EmployeeInfoDto;

  @IsOptional()
  @IsNotEmpty()
  readonly location: Partial<Location>;

  @IsOptional()
  @IsNotEmpty()
  readonly supervisor: Partial<User>;
}
