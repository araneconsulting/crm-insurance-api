import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { User } from './user.model';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';
import { nanoid } from 'nanoid';
import { Sale } from './sale.model';
import { Company } from './company.model';
import { EndorsementItem } from 'business/sub-docs/endorsement-item';

interface Endorsement extends Document<any> {
  readonly amount?: number;
  readonly code: string;
  readonly company: Partial<Company>;
  readonly description?: string;

  readonly endorsedAt?: Date;

  readonly followUpDate?: Date;
  readonly followUpPerson?: Partial<User>;

  readonly policy: Partial<Sale>;
  readonly status?: string; //Available values: src/shared/const/catalog/endorsement-status.ts
  readonly type?: string; //Available values: src/shared/const/catalog/endorsement-type.ts

  readonly createdBy?: Partial<User>;
  readonly updatedBy?: Partial<User>;

  readonly items?: EndorsementItem[];
  readonly accountingClass: string; //Self created from: [CHECKSUM_SANITY, PREMIUM, TAXES_AND_FEES, AGENCY_COMMISSION, RECEIVABLES, PAYABLES, FINANCED_AMOUNT]
}

type EndorsementModel = Model<Endorsement>;

const EndorsementSchema = new Schema<any>(
  {
    amount: { type: SchemaTypes.Number, default: 0, required: false },
    code: {
      type: SchemaTypes.String,
      default: () => nanoid(6),
      required: false,
    },
    company: { type: SchemaTypes.ObjectId, ref: 'Company', required: true },
    description: { type: SchemaTypes.String },
    endorsedAt: { type: SchemaTypes.Date },
    followUpDate: { type: SchemaTypes.Date },
    followUpPerson: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
    policy: { type: SchemaTypes.ObjectId, ref: 'Sale', required: true },
    status: { type: SchemaTypes.String },
    type: { type: SchemaTypes.String },
    items: { type: [SchemaTypes.Map], required: false },
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

EndorsementSchema.plugin(mongoSoftDelete);

const endorsementModelFn: (conn: Connection) => EndorsementModel = (
  conn: Connection,
) =>
  conn.model<Endorsement, EndorsementModel>(
    'Endorsement',
    EndorsementSchema,
    'endorsements',
  );

export { Endorsement, EndorsementSchema, EndorsementModel, endorsementModelFn };
