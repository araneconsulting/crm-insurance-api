import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { User } from './user.model';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';
import { Company } from './company.model';

interface Insurer extends Document {
  readonly email: string,
  readonly cargoCommission: number,
  readonly liabilityCommission: number,
  readonly physicalDamageCommission: number,
  readonly wcGlUmbCommission: number,
  readonly name: string,
  readonly phone: string,
  readonly type?: string, 
  readonly createdBy?: Partial<User>;
  readonly updatedBy?: Partial<User>;
  readonly company: Partial<Company>;
}

type InsurerModel = Model<Insurer>;

const InsurerSchema = new Schema<any>(
  {
    cargoCommission: SchemaTypes.Number,
    email: SchemaTypes.String,
    liabilityCommission: SchemaTypes.Number,
    name: SchemaTypes.String,
    phone: SchemaTypes.String,
    physicalDamageCommission: SchemaTypes.Number,
    type: SchemaTypes.String,
    wcGlUmbCommission: SchemaTypes.Number,
    createdBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
    updatedBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
    company: { type: SchemaTypes.ObjectId, ref: 'Company', required: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true
    }
  },
);

InsurerSchema.plugin(mongoSoftDelete);

const insurerModelFn: (conn: Connection) => InsurerModel = (conn: Connection) =>
  conn.model<Insurer, InsurerModel>('Insurer', InsurerSchema, 'insurers');

export { Insurer, InsurerSchema, insurerModelFn}
