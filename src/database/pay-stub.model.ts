import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { PayAddon } from './pay-addon.model';
import { Payroll } from './payroll.model';
import { User } from './user.model';

interface PayStub extends Document<any> {
  readonly addons: PayAddon[];  
  readonly employee: Partial<User>;
  readonly normalHoursWorked: number;
  readonly overtimeHoursWorked: number;
  readonly payRate: number;
  readonly payroll: Partial<Payroll>;
}

type PayStubModel = Model<PayStub>;
const PayStubSchema = new Schema<any>(
  {
    addons: [{ type: SchemaTypes.ObjectId, ref: 'PayAddon', required: false }],
    employee: { type: SchemaTypes.ObjectId, ref: 'Employee', required: false },
    normalHoursWorked: { type: SchemaTypes.Number },
    overtimeHoursWorked: { type: SchemaTypes.Number },
    payRate: { type: SchemaTypes.Number },
    payroll: { type: SchemaTypes.ObjectId, ref: 'Payroll', required: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);
const payStubModelFn: (conn: Connection) => PayStubModel = (
  conn: Connection,
) =>
  conn.model<PayStub, PayStubModel>(
    'PayStub',
    PayStubSchema,
    'pay_stubs',
  );
export { PayStub, PayStubModel, PayStubSchema, payStubModelFn };
