import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { Schema, SchemaTypes } from 'mongoose';
import { nanoid } from 'nanoid';
import { Address, AddressSchema } from 'shared/sub-documents/address';
import { Communication } from 'shared/sub-documents/communication';

export class ContactInfo {

  code?: string;

  @IsOptional()
  @IsNotEmpty()
  readonly address: Address;

  @IsOptional()
  readonly dob: string;

  @IsOptional()
  readonly driverLicense: string;

  @IsOptional()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsNotEmpty()
  readonly firstName: string;

  @IsOptional()
  readonly language: string;

  @IsOptional()
  @IsNotEmpty()
  readonly lastName: string;

  @IsOptional()
  readonly mobilePhone: string;

  @IsOptional()
  readonly phone: string;

  @IsOptional()
  readonly ssn: string;

  @IsOptional()
  readonly timezone: string;

  @IsOptional()
  readonly website: string;
}

export const ContactInfoSchema = new Schema<any>({
  code: { type: SchemaTypes.String, default: () => nanoid(6), required: false },
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
