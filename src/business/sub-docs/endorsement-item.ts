import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';
import { nanoid } from 'nanoid';
import { Endorsement } from 'database/endorsement.model';
import { Company } from 'database/company.model';
import { User } from 'database/user.model';
import { Sale } from 'database/sale.model';
import { ItemPayment } from './item-payment';

export interface EndorsementItem {
  accountingClass: string; //Self created from: [CHECKSUM_SANITY, PREMIUM, TAX_AND_FEE, AGENCY_COMMISSION, AGENT_COMMISSION, RECEIVABLE, PAYABLE, FINANCED_AMOUNT]
  amount: number;
  code: string;
  commissionUnit?: string;
  company: Partial<Company>;
  description?: string;
  endorsedAt: Date;
  endorsement: Partial<Endorsement>;
  followUpDate: Date;
  followUpPerson?: Partial<User>;
  otherDetails?: any;
  payments?: ItemPayment[];
  policy: Partial<Sale>;
  status: string; //Available values: src/shared/const/catalog/endorsement-status.ts
  type: string; //Available values: src/shared/const/catalog/endorsement-type.ts
  createdBy?: Partial<User>;
  updatedBy?: Partial<User>;
}

export const EndorsementItemSchema = new Schema<any>(
  {
    accountingClass: { type: SchemaTypes.String },
    amount: { type: SchemaTypes.Number, default: 0, required: false },
    code: {
      type: SchemaTypes.String,
      default: () => nanoid(6),
      required: false,
    },
    commissionUnit: { type: SchemaTypes.String, default: '$' },
    company: { type: SchemaTypes.ObjectId, ref: 'Company', required: true },
    description: { type: SchemaTypes.String, default: '' },
    endorsedAt: { type: SchemaTypes.Date, default: new Date() },
    endorsement: {
      type: SchemaTypes.ObjectId,
      ref: 'Endorsement',
      required: true,
    },
    followUpDate: { type: SchemaTypes.Date },
    followUpPerson: {
      type: SchemaTypes.ObjectId,
      ref: 'User',
      required: false,
    },
    otherDetails: { type: SchemaTypes.Map },
    payments: { type: [SchemaTypes.Map], required: false },
    policy: { type: SchemaTypes.ObjectId, ref: 'Sale', required: true },
    status: { type: SchemaTypes.String },
    type: { type: SchemaTypes.String },
    createdBy: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
    updatedBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
