import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNotEmptyObject,
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
  @IsNotEmptyObject()
  readonly address: AddressDto;

  @IsOptional()
  @IsNotEmpty()
  readonly birthday: string;

  @IsOptional()
  @IsNotEmptyObject()
  readonly communication: CommunicationDto;

  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsNotEmptyObject()
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
  @IsNotEmptyObject()
  readonly company: Partial<Company>;

  @IsOptional()
  @IsNotEmptyObject()
  readonly employeeInfo: EmployeeInfoDto;

  @IsOptional()
  @IsNotEmptyObject()
  readonly location: Partial<Location>;

  @IsOptional()
  @IsNotEmptyObject()
  readonly supervisor: Partial<User>;
}
