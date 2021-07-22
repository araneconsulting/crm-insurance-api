import {
  BusinessInfo,
  BusinessInfoSchema,
} from 'business/sub-docs/business-info';
import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';
import { nanoid } from 'nanoid';
import { Company } from './company.model';
import { User } from './user.model';

interface Location extends Document<any> {
  readonly code: string;
  readonly alias: string;
  readonly business: BusinessInfo;
  readonly payFrequency: string; //can be: hourly (H), daily (D), monthly (M), Bi-weekly (B), Twice a month (T), Yearly (Y)
  readonly company: Partial<Company>;
  readonly manager: Partial<User>;
}

type LocationModel = Model<Location>;

const LocationSchema = new Schema<any>(
  {
    code: { type: SchemaTypes.String, default: () => nanoid(6), required: false },
    alias: { type: SchemaTypes.String },
    business: {
      type: BusinessInfoSchema,
       default: {
        address: {
          address1: '',
          address2: '',
          city: '',
          state: '',
          country: 'US',
          zip: '',
        },
        email: '',
        fax: '',
        industry: '',
        logo: '',
        name: '',
        otherPhones: [],
        primaryPhone: '',
        primaryPhoneExtension: '',
        secondaryPhone: '',
        secondaryPhoneExtension: '',
        sector: '', // can be: Financial, Technology, Healthcare, etc
        startedAt: '',
        type: '',
        website: '', 
      },
    },
    payFrequency: { type: SchemaTypes.String },
    company: { type: SchemaTypes.ObjectId, ref: 'Company', required: true },
    manager: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

function nameGetHook(): string {
  return `${this.business.name}`;
}

LocationSchema.virtual('name').get(nameGetHook);

LocationSchema.plugin(mongoSoftDelete);

const locationModelFn: (conn: Connection) => LocationModel = (
  conn: Connection,
) =>
  conn.model<Location, LocationModel>('Location', LocationSchema, 'locations');

export { Location, LocationModel, LocationSchema, locationModelFn,  nameGetHook};
