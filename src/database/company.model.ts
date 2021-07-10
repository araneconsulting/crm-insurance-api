import {
  BusinessInfo,
  BusinessInfoSchema,
} from 'business/sub-docs/business-info';
import { IsPhoneNumber } from 'class-validator';
import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';
import { nanoid } from 'nanoid';
import { Address, AddressSchema } from 'shared/sub-documents/address';

interface Company extends Document<any> {
  readonly code: string;
  readonly address: Address;
  readonly email: string;
  readonly fax: string;
  readonly financerCompanies: BusinessInfo[];
  readonly industry: string; //can be: Auto Parts, Entertainment, Chemical, Engineering, etc
  readonly logo: string;
  readonly name: string;
  readonly otherPhones: string[]; // delimited by-comma string
  readonly primaryPhone: string;
  readonly primaryPhoneExtension: string;
  readonly secondaryPhone: string;
  readonly secondaryPhoneExtension: string;
  readonly sector: string; // can be: Financial, Technology, Healthcare, etc
  readonly startedAt: Date;
  readonly type: string;
  readonly website: string;
}

type CompanyModel = Model<Company>;

const CompanySchema = new Schema<any>(
  {
    code: {
      type: SchemaTypes.String,
      default: () => nanoid(6),
      required: false,
    },
    address: {
      type: AddressSchema,
      default: {
        address2: '',
        address1: '',
        city: '',
        state: '',
        country: 'US',
        zip: '',
      },
    },
    email: {
      type: SchemaTypes.String,
      unique: true,
      required: true,
      dropDups: true,
    },
    fax: { type: SchemaTypes.String },
    financerCompanies: {
      type: [BusinessInfoSchema],
      required: false,
      default: [],
    },
    industry: { type: SchemaTypes.String },
    logo: { type: SchemaTypes.String },
    name: {
      type: SchemaTypes.String,
      unique: true,
      required: true,
      dropDups: true,
    },
    otherPhones: { type: [SchemaTypes.String], required: false },
    primaryPhone: { type: SchemaTypes.String },
    primaryPhoneExtension: { type: SchemaTypes.String },
    secondaryPhone: { type: SchemaTypes.String },
    secondaryPhoneExtension: { type: SchemaTypes.String },
    sector: { type: SchemaTypes.String },
    startedAt: SchemaTypes.Date,
    type: { type: SchemaTypes.String }, // headquarter (H), point of sale (P), office (O)
    website: { type: SchemaTypes.String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

CompanySchema.plugin(mongoSoftDelete);

const companyModelFn: (conn: Connection) => CompanyModel = (conn: Connection) =>
  conn.model<Company, CompanyModel>('Company', CompanySchema, 'companies');

export { Company, CompanyModel, CompanySchema, companyModelFn };
