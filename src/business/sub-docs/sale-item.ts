import { IsNotEmpty, IsNumber, IsObject, IsOptional } from 'class-validator';
import { Schema, SchemaTypes } from 'mongoose';
import { nanoid } from 'nanoid';

export class SaleItem {

  code?: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsObject()
  details: any;

  @IsNotEmpty()
  product: string;
  //can be: TRUCKING_LIABILITY, TRUCKING_WCGLUMB, TRUCKING_CARGO, TRUCKING_PHYSICAL_DAMAGE, TRUCKING_PERMIT,  AUTO_LIABILITY_FULL, AUTO_LIABILITY_GENERAL...

  @IsNumber()
  profits: number; //Auto calculated (commission % of amount)

  @IsNotEmpty()
  provider: string; //Provider (Insurer) ID

  @IsOptional()
  subprovider: string; //Broker subprovider name (ej: Progressive)

  @IsNotEmpty()
  type: string; //can be:
}

export const SaleItemSchema = new Schema<any>({
  code: { type: SchemaTypes.String, default: () => nanoid(6), required: false },
  amount: { type: SchemaTypes.Number },
  details: { type: SchemaTypes.Map },
  product: { type: SchemaTypes.String },
  profits: { type: SchemaTypes.Number },
  provider: { type: SchemaTypes.ObjectId, ref: 'Insurer' },
  subprovider: { type: SchemaTypes.String },
  type: { type: SchemaTypes.String },
});

export const DEFAULT_SALE_ITEM = {
  amount: 0,
  details: '',
  product: '',
  profits: 0,
  provider: '',
  subprovider: '',
  type: '',
};

export const DEFAULT_SALE_ITEM_TRUCKING = {
  product: '',
  type: '',
  amount: 0,
  provider: '',
  subprovider: '',
  profits: 0,
  details: {
    dotNumber: '',
    drivers: [],
    premium: 0,
    vehicles: [],
    vinNumbers: [],
  },
};
