import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { User } from './user.model';

interface Customer extends Document<any> {
  readonly isCompany: boolean,
  readonly name: string,
  readonly email: string,
  readonly phone: string
  readonly createdBy?: Partial<User>;
  readonly updatedBy?: Partial<User>;
}

type CustomerModel = Model<Customer>;

const CustomerSchema = new Schema<any>(
  {

    isCompany: SchemaTypes.Boolean,
    name: SchemaTypes.String,
    email: SchemaTypes.String,
    phone: SchemaTypes.String,

    createdBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
    updatedBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
  },
  { timestamps: true },
);

const customerModelFn: (conn: Connection) => CustomerModel = (conn: Connection) =>
  conn.model<Customer, CustomerModel>('Customer', CustomerSchema, 'customers');

export { Customer, CustomerSchema, customerModelFn }
