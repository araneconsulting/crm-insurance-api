import { IsNotEmpty, IsNumber, IsObject, IsOptional } from 'class-validator';
import { Insurer } from 'database/insurer.model';
import { Schema, SchemaTypes } from 'mongoose';
import { nanoid } from 'nanoid';

export class SaleItem {
  code?: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  broker?: Partial<Insurer>; //Broker (Insurer) ID

  @IsOptional()
  carrier?: Partial<Insurer>; //Carrier (Insurer) ID

  @IsOptional()
  @IsObject()
  details: any;

  @IsOptional()
  description: String;

  @IsNumber()
  premium: number;

  @IsNotEmpty()
  product: string;
  //Available values: see LINES_OF_BUSINESS

  @IsNotEmpty()
  name: string;

  @IsNumber()
  profits: number; //Auto calculated (commission % of amount)

  @IsNotEmpty()
  type: string; //can be:
}

export const SaleItemSchema = new Schema<any>({
  amount: { type: SchemaTypes.Number },
  broker: {
    type: SchemaTypes.ObjectId,
    ref: 'Insurer',
    required: false,
    nullable: true,
  },
  carrier: {
    type: SchemaTypes.ObjectId,
    ref: 'Insurer',
    required: false,
    nullable: true,
  },
  code: { type: SchemaTypes.String, default: () => nanoid(6), required: false },
  description: { type: SchemaTypes.String },
  details: { type: SchemaTypes.Map },
  name: { type: SchemaTypes.String },
  premium: { type: SchemaTypes.Number },
  product: { type: SchemaTypes.String },
  profits: { type: SchemaTypes.Number },
  type: { type: SchemaTypes.String },
});
