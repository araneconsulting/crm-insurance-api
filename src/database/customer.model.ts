import { BusinessInfo, BusinessInfoSchema } from 'business/sub-docs/business-info';
import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { Communication, CommunicationSchema } from 'shared/sub-documents/communication';
import { User } from './user.model';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';
import { ContactInfo, ContactInfoSchema } from 'business/sub-docs/contact-info';
import { Company } from './company.model';
interface Customer extends Document<any> {
  readonly business: BusinessInfo;
  readonly contact: ContactInfo;
  readonly communication: Communication;
  readonly createdBy?: Partial<User>;
  readonly type: string; //BUSINESS o INDIVIDUAL
  readonly updatedBy?: Partial<User>;
  readonly company: Partial<Company>;
}

type CustomerModel = Model<Customer>;

const CustomerSchema = new Schema<any>(
  {
    business: {
      type: BusinessInfoSchema,
    },
    contact: {
      type: ContactInfoSchema,
    },
    communication: {
      type: CommunicationSchema,
      default: {
        email: true,
        sms: true,
        phone: false,
      },
    },
    createdBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
    type: { type: SchemaTypes.String, default: 'BUSINESS' },
    updatedBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
    company: { type: SchemaTypes.ObjectId, ref: 'Company' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

CustomerSchema.plugin(mongoSoftDelete);



const customerModelFn: (conn: Connection) => CustomerModel = (
  conn: Connection,
) =>
  conn.model<Customer, CustomerModel>('Customer', CustomerSchema, 'customers');

export { Customer, CustomerSchema, customerModelFn };
