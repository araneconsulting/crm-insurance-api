import { Document, Schema, SchemaTypes } from 'mongoose';
import { User } from './user.model';

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
  { timestamps: true },
);

export { Insurer, InsurerSchema }
