import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { User } from './user.model';

interface Customer extends Document<any> {
  readonly name: string;
  readonly company: string;
  readonly address: string;
  readonly city: string;
  readonly state: string;
  readonly country: string;
  readonly zip: string;
  readonly email: string;
  readonly phone: string;
  readonly fax: string;
  readonly dot: string;
  readonly createdBy?: Partial<User>;
  readonly updatedBy?: Partial<User>;
}

type CustomerModel = Model<Customer>;

const CustomerSchema = new Schema<any>(
  {
    name: SchemaTypes.String,
    company: SchemaTypes.String,
    address: SchemaTypes.String,
    city: SchemaTypes.String,
    state: SchemaTypes.String,
    country: SchemaTypes.String,
    zip: SchemaTypes.String,
    email: SchemaTypes.String,
    phone: SchemaTypes.String,
    fax: SchemaTypes.String,
    dot: SchemaTypes.String,

    createdBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
    updatedBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
  },
  { timestamps: true },
);

const customerModelFn: (conn: Connection) => CustomerModel = (
  conn: Connection,
) =>
  conn.model<Customer, CustomerModel>('Customer', CustomerSchema, 'customers');

export { Customer, CustomerSchema, customerModelFn };
