import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { Customer } from './customer.model';
import { User } from './user.model';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';
import { Company } from './company.model';
import { SaleItem, SaleItemSchema } from 'business/sub-docs/sale-item';
import { nanoid } from 'nanoid';
import { Location } from './location.model';
import { Insurer } from './insurer.model';

interface Sale extends Document<any> {
  readonly chargesPaid: number;
  readonly code: string;
  readonly company: Partial<Company>;
  readonly customer: Partial<Customer>;
  readonly financerCompany: Partial<Insurer>;
  readonly items: SaleItem[]; //Contains all info about Sale
  readonly isChargeItemized: boolean;
  readonly isRenewal: boolean;
  readonly lineOfBusiness: string;
  readonly location: Partial<Location>;
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

  readonly tips: number;
  readonly totalCharge: number; //Sum of all item amount (down payments)
  //Only-insurance properties
  readonly fees: number;
  readonly permits: number; //[auto-calculated] Sum of SaleItem amount where product = Permit
  readonly premium: number; //[auto-calculated] Sum of al SaleItem details[premium];
  readonly profits: number; //[auto-calculated] Sum of al SaleItem profits;
  readonly downPayment: number; //[auto-calculated] Sum of al SaleItem amount of coverages (not FEE nor PERMIT)

  readonly renewalFrequency: string; //can be: ANNUAL, SEMI-ANNUAL, QUARTERLY, MONTHLY, VARIABLE
  readonly autoRenew: boolean;

  //Only-insurance properties
  readonly checksumSanity: number;
  readonly taxesAndFees: number;
  readonly totalPayables: number;
  readonly totalPaid: number;
  readonly totalPremium: number;
  readonly totalNonPremium: number;
  readonly totalReceivables: number;
  readonly totalReceived: number;
  readonly financedAmount: number;
  readonly agencyCommission: number;
  readonly agencyCommissionDetails: Map<string, number>;
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
    financerCompany: {
      type: SchemaTypes.ObjectId,
      ref: 'Insurer',
      required: false,
    },
    isRenewal: { type: SchemaTypes.Boolean, default: false },
    isChargeItemized: { type: SchemaTypes.Boolean, default: true },
    items: { type: [SaleItemSchema], required: false, default: [] },
    lineOfBusiness: { type: SchemaTypes.String },
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
    downPayment: { type: SchemaTypes.Number, default: 0, required: false },

    checksumSanity: { type: SchemaTypes.Number, default: 0, required: false },
    taxesAndFees: { type: SchemaTypes.Number, default: 0, required: false },
    totalPayables: { type: SchemaTypes.Number, default: 0, required: false },
    totalPaid: { type: SchemaTypes.Number, default: 0, required: false },
    totalPremium: { type: SchemaTypes.Number, default: 0, required: false },
    totalNonPremium: { type: SchemaTypes.Number, default: 0, required: false },
    totalReceivables: { type: SchemaTypes.Number, default: 0, required: false },
    totalReceived: { type: SchemaTypes.Number, default: 0, required: false },
    financedAmount: { type: SchemaTypes.Number, default: 0, required: false },
    agencyCommission: { type: SchemaTypes.Number, default: 0, required: false },
    agencyCommissionDetails: {
      type: SchemaTypes.Number,
      default: 0,
      required: false,
    },
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
