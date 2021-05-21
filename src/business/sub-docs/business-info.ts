import { IsArray, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { Schema, SchemaTypes } from 'mongoose';
import { nanoid } from 'nanoid';
import { Address, AddressSchema } from 'shared/sub-documents/address';

export class BusinessInfo {
  code?: string;

  @IsOptional()
  address: Address;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsNotEmpty()
  fax: string;

  @IsOptional()
  @IsNotEmpty()
  industry: string; //can be: Auto Parts, Entertainment, Chemical, Engineering, etc

  @IsOptional()
  @IsNotEmpty()
  logo: string;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsArray()
  otherPhones: string[]; // delimited by-comma string

  @IsOptional()
  @IsNotEmpty()
  primaryPhone: string;

  @IsOptional()
  @IsNotEmpty()
  primaryPhoneExtension: string;

  @IsOptional()
  @IsNotEmpty()
  secondaryPhone: string;

  @IsOptional()
  @IsNotEmpty()
  secondaryPhoneExtension: string;

  @IsOptional()
  @IsNotEmpty()
  sector: string; // can be: Financial, Technology, Healthcare, etc

  @IsOptional()
  @IsNotEmpty()
  website: string;
}

export const BusinessInfoSchema = new Schema<any>({
  code: { type: SchemaTypes.String, default: () => nanoid(6), required: false },
  address: AddressSchema,
  email: { type: SchemaTypes.String },
  fax: { type: SchemaTypes.String },
  industry: { type: SchemaTypes.String },
  logo: { type: SchemaTypes.String },
  name: { type: SchemaTypes.String },
  otherPhones: [{ type: SchemaTypes.String }],
  primaryPhone: { type: SchemaTypes.String },
  primaryPhoneExtension: { type: SchemaTypes.String },
  secondaryPhone: { type: SchemaTypes.String },
  secondaryPhoneExtension: { type: SchemaTypes.String },
  sector: { type: SchemaTypes.String },
  website: { type: SchemaTypes.String },
});

export const DEFAULT_BUSINESS_INFO = {
  address: {
    address1: '',
    address2: '',
    city: '',
    state: '',
    country: 'US',
    zip: '',
  },
  email: '',
  fax: '',
  industry: '',
  logo: '',
  name: '',
  otherPhones: [],
  primaryPhone: '',
  primaryPhoneExtension: '',
  secondaryPhone: '',
  secondaryPhoneExtension: '',
  sector: '', // can be: Financial, Technology, Healthcare, etc
  startedAt: '',
  type: '',
  website: '',
};
