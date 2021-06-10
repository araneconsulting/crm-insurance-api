import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { Company } from './company.model';
import { Location } from './location.model';
import { User } from './user.model';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';
import { PayStub, PayStubSchema } from 'business/sub-docs/pay-stub';
import { nanoid } from 'nanoid';

interface Payroll extends Document<any> {
  readonly code: string;
  readonly executedBy: Partial<User>;
  readonly company: Partial<Company>;
  readonly location: Partial<Location>;
  readonly payExecutedAt: string;
  readonly payPeriodEndedAt: string;
  readonly payPeriodStartedAt: string;
  readonly payStubs: PayStub[];
  readonly scope: string; //can be COMPANY (C), LOCATION (L), INDIVIDUAL (I)
  readonly status: string; //can be: IN-PROGRESS, EXECUTED

  readonly totalBonus: number;
  readonly totalDiscount: number;
  readonly totalDownPayment: number;
  readonly totalFees: number;
  readonly totalNetSalary: number;
  readonly totalPermits: number;
  readonly totalReimbursement: number;
  readonly totalSalary: number;
  readonly totalSaleBonus: number;
  readonly totalSales: number;
  readonly totalTips: number;

  
  
}

type PayrollModel = Model<Payroll>;

const PayrollSchema = new Schema<any>(
  {
    code: {
      type: SchemaTypes.String,
      default: () => nanoid(6),
      required: false,
    },
    executedBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
    company: { type: SchemaTypes.ObjectId, ref: 'Company', required: true },
    location: { type: SchemaTypes.ObjectId, ref: 'Location', required: false },
    payExecutedAt: { type: SchemaTypes.Date },
    payPeriodStartedAt: { type: SchemaTypes.Date },
    payPeriodEndedAt: { type: SchemaTypes.Date },
    payStubs: [{ type: PayStubSchema, required: false, default: [] }],
    scope: { type: SchemaTypes.String }, //can be Company (C), Location (L), Individual (I)
    status: { type: SchemaTypes.String, default: 'IN-PROGRESS' },//can be: IN-PROGRESS, EXECUTED

    totalSalary: { type: SchemaTypes.Number },
    totalTips: { type: SchemaTypes.Number },
    totalFees: { type: SchemaTypes.Number },
    totalPermits: { type: SchemaTypes.Number },
    totalSaleBonus: { type: SchemaTypes.Number },
    totalBonus: { type: SchemaTypes.Number },
    totalDiscount: { type: SchemaTypes.Number },
    totalReimbursement: { type: SchemaTypes.Number },
    totalSales: { type: SchemaTypes.Number },
    totalNetSalary: { type: SchemaTypes.Number },
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
