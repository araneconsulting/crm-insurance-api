import {
  IsAlphanumeric,
  IsArray,
  IsEmail,
IsNotEmpty,
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
import { EmailSettingsDto } from './email-settings.dto';
import { EmployeeInfo } from 'business/sub-docs/employee-info';

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty()
  readonly address: Address;

  @IsOptional()
  @IsNotEmpty()
  readonly dob: string;

  @IsOptional()
  @IsNotEmpty()
  readonly communication: Communication;

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
  @IsNotEmpty()
  readonly startedAt: string;

  @IsOptional()
  @IsNotEmpty()
  readonly timezone: string;

  @IsOptional()
  @IsNotEmpty()
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
