import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { Schema, SchemaTypes } from 'mongoose';

export class Commission {
  @IsString()
  @IsNotEmpty()
  productType: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  percent: number;
}

export const CommissionSchema = new Schema<any>({
  productType: { type: SchemaTypes.String },
  percent: { type: SchemaTypes.Number },
});

export const DEFAULT_BUSINESS_INFO = {
  commissions: [
    { productType: 'TRUCKING', percent: 0 },
    { productType: 'AUTO', percent: 0 },
    { productType: 'HOME', percent: 0 },
    { productType: 'RENTAL', percent: 0 },
    { productType: 'COMMERCIAL', percent: 0 },
    { productType: 'LIFE', percent: 0 },
    { productType: 'HEALTH', percent: 0 },
    { productType: 'PERMIT', percent: 0 },
  ],
};
