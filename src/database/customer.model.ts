import {
  BusinessInfo,
  BusinessInfoSchema,
} from 'business/sub-docs/business-info';
import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import {
  Communication,
  CommunicationSchema,
} from 'shared/sub-documents/communication';
import { User } from './user.model';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';
import { ContactInfo, ContactInfoSchema } from 'business/sub-docs/contact-info';
import { Company } from './company.model';
import { nanoid } from 'nanoid';
interface Customer extends Document<any> {
  readonly code: string;
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
    code: {
      type: SchemaTypes.String,
      default: () => nanoid(6),
      required: false,
    },
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

function primaryNameGetHook(): boolean {
  return this.type === 'BUSINESS'
    ? this.business
      ? this.business.name
      : 'N/A'
    : this.contact
    ? `${this.contact.firstName} ${this.contact.lastName}`
    : 'N/A';
}

CustomerSchema.virtual('name').get(primaryNameGetHook);

function primaryEmailGetHook(): boolean {
  return this.type === 'BUSINESS'
    ? this.business
      ? this.business.email
      : 'N/A'
    : this.contact
    ? this.contact.email
    : 'N/A';
}

CustomerSchema.virtual('email').get(primaryEmailGetHook);

function primaryPhoneGetHook(): boolean {
  return this.type === 'BUSINESS'
    ? this.business && this.business.primaryPhone
      ? `${this.business.primaryPhone}` +
        (this.business.primaryPhoneExtension
          ? `ext. ${this.business.primaryPhoneExtension}`
          : '')
      : 'N/A'
    : this.contact && this.contact.phone
    ? this.contact.phone
    : this.contact && this.contact.mobilePhone
    ? this.contact.mobilePhone
    : 'N/A';
}

CustomerSchema.virtual('phone').get(primaryPhoneGetHook);

function primaryStateGetHook(): boolean {
  return this.type === 'BUSINESS'
    ? `${
        this.business && this.business.address
          ? this.business.address.state
          : 'N/A'
      }`
    : this.contact && this.contact.address
    ? this.contact.address.state
    : 'N/A';
}

CustomerSchema.virtual('state').get(primaryStateGetHook);

const customerModelFn: (conn: Connection) => CustomerModel = (
  conn: Connection,
) =>
  conn.model<Customer, CustomerModel>('Customer', CustomerSchema, 'customers');

export {
  Customer,
  CustomerSchema,
  customerModelFn,
  primaryNameGetHook,
  primaryEmailGetHook,
  primaryPhoneGetHook,
  primaryStateGetHook,
};
