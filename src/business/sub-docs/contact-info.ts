import {
  IsEmail,
IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Address } from 'shared/sub-documents/address';
import { Communication } from 'shared/sub-documents/communication';

export class ContactInfo extends Map<any, any> {
  @IsOptional()
  @IsNotEmpty()
  readonly address: Address;

  @IsOptional()
  @IsNotEmpty()
  readonly dob: string;

  @IsOptional()
  @IsNotEmpty()
  readonly driverLicense: string;

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
  readonly ssn: string;

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
  driverLicense: '',
  email: '',
  firstName: '',
  language: '',
  lastName: '',
  mobilePhone: '',
  phone: '',
  ssn: '',
  timezone: '',
  website: '',
};
