import { IsNotEmpty, IsOptional } from 'class-validator';
import { Schema, SchemaTypes } from 'mongoose';

export class Address {
  @IsNotEmpty()
  readonly address1: string;

  @IsOptional()
  @IsNotEmpty()
  readonly address2: string;

  @IsNotEmpty()
  readonly city: string;

  @IsOptional()
  @IsNotEmpty()
  readonly county: string;

  @IsNotEmpty()
  readonly state: string;

  @IsNotEmpty()
  readonly country: string;

  @IsNotEmpty()
  readonly zip: string;
}

export const AddressSchema = new Schema<any>({
  address1: { type: SchemaTypes.String },
  address2: { type: SchemaTypes.String },
  city: { type: SchemaTypes.String },
  county: { type: SchemaTypes.String },
  state: { type: SchemaTypes.String },
  country: { type: SchemaTypes.String },
  zip: { type: SchemaTypes.String },
});
