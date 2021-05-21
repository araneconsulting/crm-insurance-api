import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Schema, SchemaTypes } from 'mongoose';
import { nanoid } from 'nanoid';

export class EmployeeInfo {

  code: string;

  @IsOptional()
  @IsDateString()
  readonly endedAt: string;

  @IsOptional()
  @IsNotEmpty()
  readonly position: string; //can be: Sales Agent, IT, Certificates Assistant, etc

  @IsOptional()
  @IsNotEmpty()
  readonly payFrequency: string; //can be: hourly (H), daily (D), weekly (W), monthly (M), Bi-weekly (B), Twice a month (T), Yearly (Y)

  @IsOptional()
  @IsNumber()
  readonly payRate: number;

  @IsOptional()
  @IsBoolean()
  readonly overtimeAuthorized: boolean;

  @IsOptional()
  @IsNumber()
  readonly overtimePayRate: number;

  @IsOptional()
  @IsNotEmpty()
  readonly salaryFormula: string;

  @IsOptional()
  @IsDateString()
  readonly startedAt: string;

  @IsOptional()
  @IsNotEmpty()
  readonly workPrimaryPhone: string;

  @IsOptional()
  @IsNotEmpty()
  readonly workPrimaryPhoneExtension: string;

  @IsOptional()
  @IsNumber()
  readonly hourlyRate: number;
}

export const EmployeeInfoSchema = new Schema<any>({
  code: { type: SchemaTypes.String, default: () => nanoid(6), required: false },
  productType: { type: SchemaTypes.String },
  endedAt: { type: SchemaTypes.String },
  position: { type: SchemaTypes.String },
  payFrequency: { type: SchemaTypes.String },
  payRate: { type: SchemaTypes.Number },
  overtimeAuthorized: { type: SchemaTypes.Boolean },
  overtimePayRate: { type: SchemaTypes.Number },
  salaryFormula: { type: SchemaTypes.String },
  startedAt: { type: SchemaTypes.Date },
  workPrimaryPhone: { type: SchemaTypes.String },
  workPrimaryPhoneExtension: { type: SchemaTypes.String },
  hourlyRate: { type: SchemaTypes.Number },
});
