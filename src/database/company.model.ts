import { IsPhoneNumber } from 'class-validator';
import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';

interface Company extends Document<any> {
  readonly address1: string;
  readonly address2: string;
  readonly city: string;
  readonly code: string;
  readonly country: string;
  readonly email: string;
  readonly fax: string;
  readonly industry: string; //can be: Auto Parts, Entertainment, Chemical, Engineering, etc
  readonly logo: string;
  readonly name: string;
  readonly otherPhones: string[]; // delimited by-comma string
  readonly primaryPhone: string;
  readonly primaryPhoneExtension: string;
  readonly secondaryPhone: string;
  readonly secondaryPhoneExtension: string;
  readonly sector: string; // can be: Financial, Technology, Healthcare, etc
  readonly startedAt: string;
  readonly state: string;
  readonly type: string; 
  readonly website: string;
  readonly zip: string;
}

type CompanyModel = Model<Company>;

const CompanySchema = new Schema<any>(
  {
    address1: { type: SchemaTypes.String },
    address2: { type: SchemaTypes.String },
    city: { type: SchemaTypes.String },
    code: {
      type: SchemaTypes.String,
      unique: true,
      required: true,
      dropDups: true,
    },
    country: { type: SchemaTypes.String },
    email: { type: SchemaTypes.String },
    fax: { type: SchemaTypes.String },
    industry: { type: SchemaTypes.String },
    logo: { type: SchemaTypes.String },
    name: { type: SchemaTypes.String },
    otherPhones: [{ type: SchemaTypes.String, required: false }],
    primaryPhone: { type: SchemaTypes.String },
    primaryPhoneExtension: { type: SchemaTypes.String },
    secondaryPhone: { type: SchemaTypes.String },
    secondaryPhoneExtension: { type: SchemaTypes.String },
    sector: { type: SchemaTypes.String },
    startedAt: SchemaTypes.Date,
    state: { type: SchemaTypes.String },
    type: { type: SchemaTypes.String }, // headquarter (H), point of sale (P), office (O)
    website: { type: SchemaTypes.String },
    zip: { type: SchemaTypes.String },
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
