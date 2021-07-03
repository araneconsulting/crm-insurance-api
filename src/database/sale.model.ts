import {
  Connection,
  Date,
  Document,
  Model,
  ObjectId,
  Schema,
  SchemaTypes,
} from 'mongoose';
import { Customer } from './customer.model';
import { User } from './user.model';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';
import { Company } from './company.model';
import { SaleItem, SaleItemSchema } from 'business/sub-docs/sale-item';
import { nanoid } from 'nanoid';
import { Location } from './location.model';

interface Sale extends Document<any> {
  readonly chargesPaid: number;
  readonly code: string;
  readonly company: Partial<Company>;
  readonly customer: Partial<Customer>;
  readonly endorsementReference: Partial<Sale>;
  readonly financerCompany: string;
  readonly location: Partial<Location>;
  readonly items: SaleItem[]; //Contains all info about Sale
  readonly isChargeItemized: boolean;
  readonly isEndorsement: boolean;
  readonly isRenewal: boolean;
  readonly monthlyPayment: number;
  readonly policyEffectiveAt: Date;
  readonly policyExpiresAt: Date;
  readonly policyCancelledAt: Date;
  readonly renewalReference: Partial<Sale>;
  readonly renewed: boolean;
  readonly seller: Partial<User>;
  readonly soldAt: Date;
  readonly status: string; //can be: ACTIVE, INACTIVE, RENEWED, CANCELLED
  readonly type: string;
  readonly amountReceivable: number;
  readonly policyNumber: string;
  readonly createdBy?: Partial<User>;
  readonly updatedBy?: Partial<User>;

  endorsements?: Partial<Sale>[];

  readonly tips: number;
  readonly totalCharge: number; //Sum of all item amount (down payments)
  //Only-insurance properties
  readonly fees: number;
  readonly permits: number; //[auto-calculated] Sum of SaleItem amount where product = Permit
  readonly premium: number; //[auto-calculated] Sum of al SaleItem details[premium];
  readonly profits: number; //[auto-calculated] Sum of al SaleItem profits;
  readonly totalInsurance: number; //[auto-calculated] Sum of al SaleItem premium;

  readonly renewalFrequency: string; //can be: ANNUAL, SEMI-ANNUAL, QUARTERLY, MONTHLY, VARIABLE
  readonly autoRenew: boolean;
}

type SaleModel = Model<Sale>;

const SaleSchema = new Schema<any>(
  {
    amountReceivable: { type: SchemaTypes.Number, default: 0, required: false },
    autoRenew: { type: SchemaTypes.Boolean, default: false },
    chargesPaid: { type: SchemaTypes.Number, default: 0, required: false },
    code: {
      type: SchemaTypes.String,
      default: () => nanoid(6),
      required: false,
    },
    company: { type: SchemaTypes.ObjectId, ref: 'Company', required: true },
    customer: { type: SchemaTypes.ObjectId, ref: 'Customer', required: true },
    endorsementReference: { type: SchemaTypes.ObjectId, ref: 'Sale' },
    financerCompany: { type: SchemaTypes.ObjectId, ref: 'Insurer', nullable:true },
    isEndorsement: { type: SchemaTypes.Boolean, default: false },
    isRenewal: { type: SchemaTypes.Boolean, default: false },
    isChargeItemized: { type: SchemaTypes.Boolean, default: true },
    items: [{ type: SaleItemSchema, required: true }],
    location: { type: SchemaTypes.ObjectId, ref: 'Location', required: false },
    monthlyPayment: { type: SchemaTypes.Number },
    policyExpiresAt: { type: SchemaTypes.Date },
    policyEffectiveAt: { type: SchemaTypes.Date },
    policyCancelledAt: { type: SchemaTypes.Date },
    policyNumber: { type: SchemaTypes.String },
    renewalFrequency: { type: SchemaTypes.String, default: 'ANNUAL' },
    renewalReference: { type: SchemaTypes.ObjectId, ref: 'Sale' },
    renewed: { type: SchemaTypes.Boolean, default: false },
    seller: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
    soldAt: { type: SchemaTypes.Date, required: false, default: new Date() },
    status: { type: SchemaTypes.String, default: 'ACTIVE' },
    tips: { type: SchemaTypes.Number, default: 0, required: false },
    totalCharge: { type: SchemaTypes.Number, default: 0, required: false },
    type: { type: SchemaTypes.String },

    createdBy: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
    updatedBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },

    fees: { type: SchemaTypes.Number, default: 0, required: false },
    permits: { type: SchemaTypes.Number, default: 0, required: false },
    premium: { type: SchemaTypes.Number, default: 0, required: false },
    profits: { type: SchemaTypes.Number, default: 0, required: false },
    totalInsurance: { type: SchemaTypes.Number, default: 0, required: false },
    endorsements: [{ type: SchemaTypes.Map, required: false }],
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
