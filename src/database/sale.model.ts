import {
  Connection,
  Date,
  Document,
  Model,
  Schema,
  SchemaTypes,
} from 'mongoose';
import { Customer } from './customer.model';
import { User } from './user.model';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';
import { Company } from './company.model';
import { SaleItem, SaleItemSchema } from 'business/sub-docs/sale-item';
import { nanoid } from 'nanoid';

interface Sale extends Document<any> {
  readonly code: string;
  readonly amountReceivable: number;
  readonly chargesPaid: number;
  readonly company: Partial<Company>;
  readonly customer: Partial<Customer>;
  readonly fees: number;
  readonly location: Location;
  readonly items: SaleItem[]; //Contains all info about Sale
  readonly seller: Partial<User>;
  readonly soldAt: string;
  readonly tips: number;
  readonly totalCharge: number; //Sum of all sale item amounts
  readonly type: string; 
  readonly isRenewal: boolean; 
  readonly renewalReference: Partial<Sale>; 
  readonly isEndorsement: boolean; 
  readonly endorsementReference: Partial<Sale>; 
  readonly policyEffectiveAt: string;
  readonly nextRenewalAt: string;

  readonly createdBy?: Partial<User>;
  readonly updatedBy?: Partial<User>;

  //Only-insurance properties

  readonly permits: number; //[auto-calculated] Sum of SaleItem amount where product = Permit
  readonly premium: number; //[auto-calculated] Sum of al SaleItem details[premium];
  readonly profits: number; //[auto-calculated] Sum of al SaleItem profits;
}

type SaleModel = Model<Sale>;

const SaleSchema = new Schema<any>(
  {
    code: { type: SchemaTypes.String, default: () => nanoid(6), required: false },
    amountReceivable: { type: SchemaTypes.Number, default: 0, required: false },
    chargesPaid: { type: SchemaTypes.Number, default: 0, required: false },
    company: { type: SchemaTypes.ObjectId, ref: 'Company', required: true },
    customer: { type: SchemaTypes.ObjectId, ref: 'Customer', required: true },
    fees: { type: SchemaTypes.Number, default: 0, required: false },
    location: { type: SchemaTypes.ObjectId, ref: 'Location', required: false },
    items: [{ type: SaleItemSchema, required: true }],
    seller: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
    soldAt: { type: SchemaTypes.Date, required: true },
    tips: { type: SchemaTypes.Number, default: 0, required: false },
    totalCharge: { type: SchemaTypes.Number, default: 0, required: false },
    type:  { type: SchemaTypes.String },
    isRenewal: { type: SchemaTypes.Boolean, default: false },
    renewalReference: { type: SchemaTypes.ObjectId, ref: 'Sale' },
    isEndorsement: { type: SchemaTypes.Boolean, default: false },
    endorsementReference: { type: SchemaTypes.ObjectId, ref: 'Sale' },
    policyEffectiveAt: { type: SchemaTypes.Date },
    nextRenewalAt: { type: SchemaTypes.Date },

    createdBy: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
    updatedBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },

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
