import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { Company } from './company.model';
import { Location } from './location.model';
import { User } from './user.model';
interface Payroll extends Document<any> {
  readonly executed: boolean;
  readonly generatedBy: Partial<User>;
  readonly company: Partial<Company>;
  readonly location: Partial<Location>;
  readonly payPeriodStartedAt: string;
  readonly payPeriodEndedAt: string;
  readonly scope: string; //can be Company (C), Location (L), Individual (I)
}

type PayrollModel = Model<Payroll>;

const PayrollSchema = new Schema<any>(
  {
    executed: { type: SchemaTypes.Boolean },
    generatedBy: [{ type: SchemaTypes.ObjectId, ref: 'User', required: true }],
    company: [{ type: SchemaTypes.ObjectId, ref: 'Company', required: true }],
    location: [{ type: SchemaTypes.ObjectId, ref: 'Location', required: true }],
    payPeriodStartedAt: { type: SchemaTypes.Date },
    payPeriodEndedAt: { type: SchemaTypes.Date },
    scope: { type: SchemaTypes.String }, //can be Company (C), Location (L), Individual (I)
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

const payrollModelFn: (conn: Connection) => PayrollModel = (conn: Connection) =>
  conn.model<Payroll, PayrollModel>('Payroll', PayrollSchema, 'payrolls');
export { Payroll, PayrollModel, PayrollSchema, payrollModelFn };
