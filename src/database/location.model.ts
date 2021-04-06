import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
interface Location extends Document<any> {
  readonly address_1: string;
  readonly address_2: string;
  readonly city: string;
  readonly code: string;
  readonly fax: string;
  readonly managerName: string;
  readonly name: string;
  readonly otherPhones: string[];
  readonly payFrequency: string; //can be: hourly (H), daily (D), monthly (M), Bi-weekly (B), Yearly (Y)  
  readonly primaryPhone: string;
  readonly primaryPhoneExtension: string;
  readonly secondaryPhone: string;
  readonly secondaryPhoneExtension: string;
  readonly startedAt: string;
  readonly state: string;
  readonly type: string; // headquarter (H), point of sale (P), office (O)
  readonly website: string;
  readonly zip: string;
}

type LocationModel = Model<Location>;

const LocationSchema = new Schema<any>(
  {
    address_1: { type: SchemaTypes.String },
    address_2: { type: SchemaTypes.String },
    city: { type: SchemaTypes.String },
    code: {
      type: SchemaTypes.String,
      unique: true,
      required: true,
      dropDups: true,
    },
    email: { type: SchemaTypes.String },
    fax: { type: SchemaTypes.String },
    managerName: { type: SchemaTypes.String },
    name: { type: SchemaTypes.String },
    otherPhones: [{ type: SchemaTypes.String, required: false }],
    payFrequency: { type: SchemaTypes.String },
    primaryPhone: { type: SchemaTypes.String },
    primaryPhoneExtension: { type: SchemaTypes.String },
    secondaryPhone: { type: SchemaTypes.String },
    secondaryPhoneExtension: { type: SchemaTypes.String },
    startedAt: { type: SchemaTypes.Date },
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

const locationModelFn: (conn: Connection) => LocationModel = (
  conn: Connection,
) =>
  conn.model<Location, LocationModel>('Location', LocationSchema, 'locations');

export { Location, LocationModel, LocationSchema, locationModelFn };
