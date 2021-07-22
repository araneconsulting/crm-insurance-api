import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';
import { nanoid } from 'nanoid';
import { Endorsement } from 'database/endorsement.model';
import { Company } from 'database/company.model';
import { User } from 'database/user.model';
import { Sale } from 'database/sale.model';
import { EndorsementItem } from './endorsement-item';

export interface ItemPayment {
  amount?: number;
  balance?: number;
  code: string;
  company: Partial<Company>;
  date?: Date;
  policy: Partial<Sale>;
  endorsement: Partial<Endorsement>;
  endorsementItem: Partial<EndorsementItem>;
  createdBy?: Partial<User>;
  updatedBy?: Partial<User>;
}

export const ItemPaymentSchema = new Schema<any>(
  {
    amount: { type: SchemaTypes.Number, default: 0, required: false },
    balance: { type: SchemaTypes.Number, default: 0, required: false },
    code: {
      type: SchemaTypes.String,
      default: () => nanoid(6),
      required: false,
    },
    company: { type: SchemaTypes.ObjectId, ref: 'Company', required: true },
    date: { type: SchemaTypes.Date, default: new Date() },
    policy: { type: SchemaTypes.ObjectId, ref: 'Sale', required: true },
    endorsement: {
      type: SchemaTypes.ObjectId,
      ref: 'Endorsement',
      required: true,
    },
    endorsementItem: { type: SchemaTypes.Map, required: true },
    createdBy: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
    updatedBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
