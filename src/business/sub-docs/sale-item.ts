import { IsNotEmpty, IsNumber, IsObject, IsOptional } from 'class-validator';
import { Insurer } from 'database/insurer.model';
import { Schema, SchemaTypes } from 'mongoose';
import { nanoid } from 'nanoid';

export class SaleItem {
  code?: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsObject()
  details: any;

  @IsNumber()
  premium: number;

  @IsNotEmpty()
  product: string;
  //Available values: see LINES_OF_BUSINESS

  @IsNumber()
  profits: number; //Auto calculated (commission % of amount)

  @IsOptional()
  broker?: Partial<Insurer>; //Broker (Insurer) ID

  @IsOptional()
  carrier?: Partial<Insurer>; //Carrier (Insurer) ID

  @IsNotEmpty()
  type: string; //can be:
}

export const SaleItemSchema = new Schema<any>({
  code: { type: SchemaTypes.String, default: () => nanoid(6), required: false },
  amount: { type: SchemaTypes.Number },
  details: { type: SchemaTypes.Map },
  premium: { type: SchemaTypes.Number },
  product: { type: SchemaTypes.String },
  profits: { type: SchemaTypes.Number },
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
  type: { type: SchemaTypes.String },
});

export const DEFAULT_SALE_ITEM = {
  amount: 0,
  details: '',
  product: '',
  premium: 0,
  profits: 0,
  broker: '',
  carrier: '',
  type: '',
};
