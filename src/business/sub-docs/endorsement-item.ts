import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';
import { nanoid } from 'nanoid';
import { Endorsement } from 'database/endorsement.model';
import { Company } from 'database/company.model';
import { User } from 'database/user.model';
import { Sale } from 'database/sale.model';

export interface EndorsementItem {
  amount: number;
  code: string;
  commissionUnit: string;
  company: Partial<Company>;
  description: string;

  endorsedAt: Date;

  followUpDate: Date;
  followUpPerson: Partial<User>;

  policy: Partial<Sale>;
  endorsement: Partial<Endorsement>;
  status: string; //Available values: src/shared/const/catalog/endorsement-status.ts
  type: string; //Available values: src/shared/const/catalog/endorsement-type.ts

  createdBy?: Partial<User>;
  updatedBy?: Partial<User>;

  accountingClass: string; //Self created from: [CHECKSUM_SANITY, PREMIUM, TAXES_AND_FEES, AGENCY_COMMISSION, RECEIVABLES, PAYABLES, FINANCED_AMOUNT]
}

export const EndorsementItemSchema = new Schema<any>(
  {
    amount: { type: SchemaTypes.Number, default: 0, required: false },
    code: {
      type: SchemaTypes.String,
      default: () => nanoid(6),
      required: false,
    },
    commissionUnit: { type: SchemaTypes.String, default:"$" },
    company: { type: SchemaTypes.ObjectId, ref: 'Company', required: true },
    description: { type: SchemaTypes.String },
    endorsedAt: { type: SchemaTypes.Date },
    followUpDate: { type: SchemaTypes.Date },
    followUpPerson: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
    policy: { type: SchemaTypes.ObjectId, ref: 'Sale', required: true },
    endorsement: { type: SchemaTypes.ObjectId, ref: 'Endorsement', required: true },
    status: { type: SchemaTypes.String },
    type: { type: SchemaTypes.String },
    accountingClass: { type: SchemaTypes.String },
    createdBy: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
    updatedBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

