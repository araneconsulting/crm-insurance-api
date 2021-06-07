import {
  IsAlphanumeric,
  IsArray,
  IsEmail,
IsNotEmpty,
IsNotEmptyObject,
IsObject,
  IsOptional,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Company } from 'database/company.model';
import { Location } from 'database/location.model';
import { User } from 'database/user.model';
import { Address } from 'shared/sub-documents/address';
import { Communication } from 'shared/sub-documents/communication';
import { RoleType } from 'shared/enum/role-type.enum';
import { EmailSettings } from './email-settings';
import { EmployeeInfo } from 'business/sub-docs/employee-info';

export class CreateUserDto {
  @IsOptional()
  readonly address: Address;

  @IsOptional()
  readonly dob: string;

  @IsOptional()
  @IsObject()
  readonly communication: Communication;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsObject()
  readonly emailSettings: EmailSettings;

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

  @IsNotEmpty()
  @MinLength(8, { message: ' The min length of password is 8 ' })
  @MaxLength(20, {
    message: " The password can't accept more than 20 characters ",
  })
  /* @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,20}$/, {
    message:
      ' A password at least contains one numeric digit, one supercase char and one lowercase char',
  }) */
  readonly password: string;

  @IsOptional()
  readonly phone: string;

  @IsOptional()
  @IsArray()
  readonly roles: RoleType[];

  @IsOptional()
  readonly startedAt: string;

  @IsOptional()
  readonly timezone: string;

  @IsNotEmpty()
  @IsAlphanumeric()
  readonly username: string;

  @IsOptional()
  readonly website: string;

  //EMPLOYEE DATA (DEPENDS ON BUSINESS MODEL)

  @IsNotEmpty()
  readonly company: Partial<Company>;

  @IsOptional()
  @IsObject()
  readonly employeeInfo: EmployeeInfo;

  @IsOptional()
  @IsNotEmpty()
  readonly location: Partial<Location>;

  @IsOptional()
  @IsNotEmpty()
  readonly supervisor: Partial<User>;
}
