import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { Schema, SchemaTypes } from 'mongoose';
import { Address, AddressSchema } from 'shared/sub-documents/address';
import { Communication } from 'shared/sub-documents/communication';

export class ContactInfo {
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

export const ContactInfoSchema = new Schema<any>({
  address: AddressSchema,
  dob: { type: SchemaTypes.Date },
  driverLicense: { type: SchemaTypes.String },
  email: { type: SchemaTypes.String },
  firstName: { type: SchemaTypes.String },
  language: { type: SchemaTypes.String },
  lastName: { type: SchemaTypes.String },
  mobilePhone: { type: SchemaTypes.String },
  phone: { type: SchemaTypes.String },
  ssn: { type: SchemaTypes.String },
  timezone: { type: SchemaTypes.String },
  website: { type: SchemaTypes.String },
});

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
