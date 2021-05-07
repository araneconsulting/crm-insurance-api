import { BusinessInfo } from 'business/sub-docs/business-info';
import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { User } from './user.model';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';
import { ContactInfo } from 'business/sub-docs/contact-info';
import { Company } from './company.model';
import { CommissionSheet } from 'business/sub-docs/commision-sheet';
interface Insurer extends Document<any> {
  readonly business: BusinessInfo;
  readonly commissionSheet: CommissionSheet;
  readonly company: Partial<Company>;
  readonly contact: ContactInfo;
  readonly createdBy?: Partial<User>;
  readonly subproviders?: String[];
  readonly type: string; //BROKER or SINGLE
  readonly updatedBy?: Partial<User>;
}

type InsurerModel = Model<Insurer>;

const InsurerSchema = new Schema<any>(
  {
    business: { type: SchemaTypes.Map },
    commissionSheet: { type: SchemaTypes.Map },
    company: { type: SchemaTypes.ObjectId, ref: 'Company' },
    contact: { type: SchemaTypes.Map },
    createdBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
    subproviders: { type: SchemaTypes.Array, required: false },
    type: { type: SchemaTypes.String, default: 'SINGLE' },
    updatedBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

InsurerSchema.plugin(mongoSoftDelete);

const insurerModelFn: (conn: Connection) => InsurerModel = (
  conn: Connection,
) =>
  conn.model<Insurer, InsurerModel>('Insurer', InsurerSchema, 'insurers');

export { Insurer, InsurerSchema, insurerModelFn };
