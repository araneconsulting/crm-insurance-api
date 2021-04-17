import {
  IsAlphanumeric,
  IsArray,
  IsEmail,
IsNotEmpty,
IsNotEmptyObject,
  IsOptional,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Company } from 'database/company.model';
import { User } from 'database/user.model';
import { AddressDto } from 'shared/dto/address.dto';
import { CommunicationDto } from 'shared/dto/communication.dto';
import { EmployeeInfoDto } from 'shared/dto/employee-info.dto';
import { RoleType } from 'shared/enum/role-type.enum';
import { EmailSettingsDto } from './email-settings.dto';

export class CreateUserDto {
  @IsOptional()
  readonly address: AddressDto;

  @IsOptional()
  readonly dob: string;

  @IsOptional()
  @IsNotEmpty()
  readonly communication: CommunicationDto;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsNotEmpty()
  readonly emailSettings: EmailSettingsDto;

  @IsNotEmpty()
  readonly firstName: string;

  @IsOptional()
  readonly gender: string;

  @IsOptional()
  readonly language: string;

  @IsOptional()
  @IsNotEmpty()
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
  @IsNotEmptyObject()
  readonly employeeInfo: EmployeeInfoDto;

  @IsOptional()
  @IsNotEmpty()
  readonly location: Partial<Location>;

  @IsOptional()
  @IsNotEmpty()
  readonly supervisor: Partial<User>;
}
