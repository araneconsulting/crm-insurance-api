import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Company } from 'database/company.model';
import { User } from 'database/user.model';
import { Address } from 'shared/sub-documents/address';
import { Communication } from 'shared/sub-documents/communication';
import { RoleType } from 'shared/enum/role-type.enum';
import { EmailSettings } from './email-settings';
import { EmployeeInfo } from 'business/sub-docs/employee-info';
import { Location } from 'database/location.model';

export class UpdateUserDto {
  @IsOptional()
  @IsObject()
  readonly address: Address;

  @IsOptional()
  @IsDateString()
  readonly dob: string;

  @IsOptional()
  @IsObject()
  readonly communication: Communication;

  @IsOptional()
  @IsObject()
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
  @IsNotEmpty()
  @MinLength(8, { message: ' The min length of password is 8 ' })
  @MaxLength(20, {
    message: " The password can't accept more than 20 characters ",
  })
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,20}$/, {
    message:
      ' A password at least contains one numeric digit, one supercase char and one lowercase char',
  })
  readonly password: string;

  @IsOptional()
  @IsNotEmpty()
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
