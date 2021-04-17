import {
  IsEmail,
IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { AddressDto } from 'shared/dto/address.dto';
import { CommunicationDto } from 'shared/dto/communication.dto';

export class ContactInfoDto extends Map<any, any> {
  @IsOptional()
  @IsNotEmpty()
  readonly address: AddressDto;

  @IsOptional()
  @IsNotEmpty()
  readonly dob: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsNotEmpty()
  readonly firstName: string;

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
  @IsNotEmpty()
  readonly timezone: string;

  @IsOptional()
  @IsNotEmpty()
  readonly website: string;
}

export const DEFAULT_CONTACT_INFO = {
  address: {
    address1: '',
    address2: '',
    city: '',
    state: '',
    country: 'US',
    zip: '',
  },
  dob: '',
  email: '',
  firstName: '',
  language: '',
  lastName: '',
  mobilePhone: '',
  phone: '',
  timezone: '',
  website: '',
};
