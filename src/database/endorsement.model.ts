import {
  Connection,
  Date,
  Document,
  Model,
  Schema,
  SchemaTypes,
} from 'mongoose';
import { User } from './user.model';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';
import { nanoid } from 'nanoid';
import { Sale } from './sale.model';

interface Endorsement extends Document<any> {
  readonly amount: number;
  readonly code: string;
  readonly description: string;

  readonly followUpDate: Date;
  readonly followUpPerson: Partial<User>;
  
  readonly policy: Partial<Sale>;
  readonly status: string; //Available values: src/shared/const/catalog/endorsement-status.ts 
  readonly type: string; //Available values: src/shared/const/catalog/endorsement-type.ts
  
  readonly createdBy?: Partial<User>;
  readonly updatedBy?: Partial<User>;

  readonly items?: any[];

  //Only-insurance properties
  readonly fees: number;
  readonly permits: number; 
  readonly premium: number; 
  readonly profits: number; 
}

type SaleModel = Model<Sale>;

const SaleSchema = new Schema<any>(
  {
    amount: { type: SchemaTypes.Number, default: 0, required: false },
    code: {type: SchemaTypes.String,default: () => nanoid(6),required: false,},
    description: { type: SchemaTypes.String },
    followupDate: { type: SchemaTypes.Date },
    followUpPerson: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
    policy: { type: SchemaTypes.ObjectId, ref: 'Sale', required: true },
    status: { type: SchemaTypes.String },
    type: { type: SchemaTypes.String },
    items: [{ type: SchemaTypes.Map, required: false }],

    createdBy: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
    updatedBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },

    fees: { type: SchemaTypes.Number, default: 0, required: false },
    permits: { type: SchemaTypes.Number, default: 0, required: false },
    premium: { type: SchemaTypes.Number, default: 0, required: false },
    profits: { type: SchemaTypes.Number, default: 0, required: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

SaleSchema.plugin(mongoSoftDelete);

const saleModelFn: (conn: Connection) => SaleModel = (conn: Connection) =>
  conn.model<Sale, SaleModel>('Sale', SaleSchema, 'sales');

export { Sale, SaleSchema, SaleModel, saleModelFn };
