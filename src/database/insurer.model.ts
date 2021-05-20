import { BusinessInfo, BusinessInfoSchema } from 'business/sub-docs/business-info';
import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { User } from './user.model';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';
import { ContactInfo, ContactInfoSchema } from 'business/sub-docs/contact-info';
import { Company } from './company.model';
import { Commission, CommissionSchema } from 'business/sub-docs/commision';
import { SubProvider } from 'insurance/insurer/update-insurer.dto';
interface Insurer extends Document<any> {
  readonly business: BusinessInfo;
  readonly commissions: Commission[];
  readonly company: Partial<Company>;
  readonly contact: ContactInfo;
  readonly createdBy?: Partial<User>;
  readonly subproviders?: SubProvider[];
  readonly type: string; //BROKER or SINGLE
  readonly updatedBy?: Partial<User>;
}

type InsurerModel = Model<Insurer>;

const InsurerSchema = new Schema<any>(
  {
    business: { type: BusinessInfoSchema },
    commissions: [CommissionSchema],
    company: { type: SchemaTypes.ObjectId, ref: 'Company' },
    contact: ContactInfoSchema,
    createdBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
    subproviders: [
      {
        value: SchemaTypes.String,
      },
    ],
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

const insurerModelFn: (conn: Connection) => InsurerModel = (conn: Connection) =>
  conn.model<Insurer, InsurerModel>('Insurer', InsurerSchema, 'insurers');

export { Insurer, InsurerSchema, insurerModelFn };
