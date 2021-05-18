import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { Company } from './company.model';
import { Location } from './location.model';
import { User } from './user.model';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';
import { PayStub, PayStubSchema } from './pay-stub.model';
interface Payroll extends Document<any> {
  readonly executedBy: Partial<User>;
  readonly company: Partial<Company>;
  readonly location: Partial<Location>;
  readonly payExecutedAt: string;
  readonly payPeriodEndedAt: string;
  readonly payPeriodStartedAt: string;
  readonly payStubs: PayStub[];
  readonly scope: string; //can be Company (C), Location (L), Individual (I)
}

type PayrollModel = Model<Payroll>;

const PayrollSchema = new Schema<any>(
  {
    executedBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
    company: { type: SchemaTypes.ObjectId, ref: 'Company', required: true },
    location: { type: SchemaTypes.ObjectId, ref: 'Location', required: false },
    payExecutedAt: { type: SchemaTypes.Date },
    payPeriodStartedAt: { type: SchemaTypes.Date },
    payPeriodEndedAt: { type: SchemaTypes.Date },
    payStubs: [{ type: PayStubSchema, required: false, default: [] }],
    scope: { type: SchemaTypes.String }, //can be Company (C), Location (L), Individual (I)
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

PayrollSchema.plugin(mongoSoftDelete);

const payrollModelFn: (conn: Connection) => PayrollModel = (conn: Connection) =>
  conn.model<Payroll, PayrollModel>('Payroll', PayrollSchema, 'payrolls');
export { Payroll, PayrollModel, PayrollSchema, payrollModelFn };
