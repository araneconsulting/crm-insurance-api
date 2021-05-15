import {
  Connection,
  Document,
  Model,
  Schema,
  SchemaTypes,
} from 'mongoose';
import { Customer } from './customer.model';
import { User } from './user.model';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';
import { Company } from './company.model';
import { SaleItem } from 'business/sub-docs/sale-item';

interface Sale extends Document<any> {
  readonly amountReceivable: number;
  readonly chargesPaid: number;
  readonly company: Partial<Company>;
  readonly customer: Partial<Customer>;
  readonly fees: number;
  readonly location: Location;
  readonly items: SaleItem[]; //Contains all info about Sale
  readonly seller: Partial<User>;
  readonly soldAt: Date;
  readonly tips: number;
  readonly totalCharge: number; //Sum of all sale item amounts
  readonly type: string; //Commercial Truck, Auto, Homeowner, Rental, Commercial, Life, Health, etc

  readonly createdBy?: Partial<User>;
  readonly updatedBy?: Partial<User>;

  //Only-insurance properties
  
  readonly permits: number; //[auto-calculated] Sum of SaleItem amount where product = Permit
  readonly premium: number; //[auto-calculated] Sum of al SaleItem details[premium];
}

type SaleModel = Model<Sale>;

const SaleSchema = new Schema<any>(
  {
    amountReceivable: { type: SchemaTypes.Number, default: 0, required: false },
    chargesPaid: { type: SchemaTypes.Number, default: 0, required: false },
    company: { type: SchemaTypes.ObjectId, ref: 'Company', required: true },
    customer: { type: SchemaTypes.ObjectId, ref: 'Customer', required: true },
    fees: { type: SchemaTypes.Number, default: 0, required: false },
    location: { type: SchemaTypes.ObjectId, ref: 'Location', required: false },
    items: [{ type: SchemaTypes.Map, required: true }],
    seller: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
    soldAt: { type: SchemaTypes.Date, required: true },
    tips: { type: SchemaTypes.Number, default: 0, required: false },
    totalCharge: { type: SchemaTypes.Number, default: 0, required: false },
    type: SchemaTypes.String,

    createdBy: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
    updatedBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },

    permits: { type: SchemaTypes.Number, default: 0, required: false },
    premium: { type: SchemaTypes.Number, default: 0, required: false },
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
