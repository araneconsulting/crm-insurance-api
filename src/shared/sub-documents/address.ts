import { IsNotEmpty, IsOptional } from 'class-validator';
import { Schema, SchemaTypes } from 'mongoose';

export class Address {
  @IsOptional()
  readonly address1: string;

  @IsOptional()
  readonly address2: string;

  @IsOptional()
  readonly city: string;

  @IsOptional()
  readonly county: string;

  @IsOptional()
  readonly state: string;

  @IsOptional()
  readonly country: string;

  @IsOptional()
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
