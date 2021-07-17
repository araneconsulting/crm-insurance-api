import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { Schema, SchemaTypes } from 'mongoose';
import { nanoid } from 'nanoid';

export class Commission {
  code?: string;

  @IsString()
  @IsNotEmpty()
  lineOfBusiness: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  percent: number;
}

export const CommissionSchema = new Schema<any>({
  code: { type: SchemaTypes.String, default: () => nanoid(6), required: false },
  lineOfBusiness: { type: SchemaTypes.String },
  percent: { type: SchemaTypes.Number },
});

