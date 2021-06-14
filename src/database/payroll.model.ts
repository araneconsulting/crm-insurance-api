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
  readonly payExecutedAt: Date;
  readonly payPeriodEndedAt: Date;
  readonly payPeriodStartedAt: Date;
  readonly payStubs: PayStub[];
  readonly scope: string; //can be COMPANY (C), LOCATION (L), INDIVIDUAL (I)
  readonly status: string; //can be: IN-PROGRESS, EXECUTED

  readonly totalExtraBonus?: number;
  readonly totalDiscount?: number;
  readonly totalDownPayment?: number;
  readonly totalFees?: number;
  readonly totalNetSalary?: number;
  readonly totalPermits?: number;
  readonly totalReimbursement?: number;
  readonly totalRegularSalary?: number;
  readonly totalSaleBonus?: number;
  readonly totalSales?: number;
  readonly totalTips?: number;

  readonly createdBy?: Partial<User>;
  readonly updatedBy?: Partial<User>;
  
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

    totalRegularSalary: { type: SchemaTypes.Number, default: 0 },
    totalTips: { type: SchemaTypes.Number, default: 0 },
    totalFees: { type: SchemaTypes.Number, default: 0 },
    totalPermits: { type: SchemaTypes.Number, default: 0 },
    totalSaleBonus: { type: SchemaTypes.Number, default: 0 },
    totalExtraBonus: { type: SchemaTypes.Number, default: 0 },
    totalDiscount: { type: SchemaTypes.Number, default: 0 },
    totalReimbursement: { type: SchemaTypes.Number, default: 0 },
    totalSales: { type: SchemaTypes.Number, default: 0 },
    totalNetSalary: { type: SchemaTypes.Number, default: 0 },

    createdBy: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
    updatedBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
    
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
