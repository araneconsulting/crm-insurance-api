import { BusinessInfo } from 'business/company/dto/company.dto';
import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';

interface Location extends Document<any> {
  readonly alias: string;
  readonly info: BusinessInfo;
  readonly payFrequency: string; //can be: hourly (H), daily (D), monthly (M), Bi-weekly (B), Twice a month (T), Yearly (Y)
}

type LocationModel = Model<Location>;

const LocationSchema = new Schema<any>(
  {
    alias: { type: SchemaTypes.String },
    info: {
      type: SchemaTypes.Map,
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
        owner: {
          name: '',
          dob: '',
          ssn: '',
          driverLicense: '',
        },
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
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

LocationSchema.plugin(mongoSoftDelete);

const locationModelFn: (conn: Connection) => LocationModel = (
  conn: Connection,
) =>
  conn.model<Location, LocationModel>('Location', LocationSchema, 'locations');

export { Location, LocationModel, LocationSchema, locationModelFn };
