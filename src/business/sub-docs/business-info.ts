import { IsArray, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { Schema, SchemaTypes } from 'mongoose';
import { Address, AddressSchema } from 'shared/sub-documents/address';

export class BusinessInfo {
  @IsOptional()
  readonly address: Address;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsOptional()
  @IsNotEmpty()
  readonly fax: string;

  @IsOptional()
  @IsNotEmpty()
  readonly industry: string; //can be: Auto Parts, Entertainment, Chemical, Engineering, etc

  @IsOptional()
  @IsNotEmpty()
  readonly logo: string;

  @IsNotEmpty()
  readonly name: string;

  @IsOptional()
  @IsArray()
  readonly otherPhones: string[]; // delimited by-comma string

  @IsOptional()
  @IsNotEmpty()
  readonly primaryPhone: string;

  @IsOptional()
  @IsNotEmpty()
  readonly primaryPhoneExtension: string;

  @IsOptional()
  @IsNotEmpty()
  readonly secondaryPhone: string;

  @IsOptional()
  @IsNotEmpty()
  readonly secondaryPhoneExtension: string;

  @IsOptional()
  @IsNotEmpty()
  readonly sector: string; // can be: Financial, Technology, Healthcare, etc

  @IsOptional()
  @IsNotEmpty()
  readonly website: string;
}

export const BusinessInfoSchema = new Schema<any>({
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
