import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { User } from './user.model';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';

interface Insurer extends Document {
  readonly name: string,
  readonly email: string,
  readonly phone: string
  readonly liabilityCommission: number,
  readonly cargoCommission: number,
  readonly physicalDamageCommission: number,
  readonly wcGlUmbCommission: number,
  readonly createdBy?: Partial<User>;
  readonly updatedBy?: Partial<User>;
}

type InsurerModel = Model<Insurer>;

const InsurerSchema = new Schema<any>(
  {
    name: SchemaTypes.String,
    email: SchemaTypes.String,
    phone: SchemaTypes.String,
    liabilityCommission: SchemaTypes.Number,
    cargoCommission: SchemaTypes.Number,
    physicalDamageCommission: SchemaTypes.Number,
    wcGlUmbCommission: SchemaTypes.Number,
    createdBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
    updatedBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
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
