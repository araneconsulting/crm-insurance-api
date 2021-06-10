import { User } from 'database/user.model';
import { Schema, SchemaTypes } from 'mongoose';
import { nanoid } from 'nanoid';
import { PayAddon, PayAddonSchema } from './pay-addon';

export class PayStub {
  code?: string;
  addons: PayAddon[];
  employee: Partial<User>;
  normalHoursWorked: number;
  overtimeHoursWorked: number;
  payRate: number;

  //AGGREGATORS
  totalBonus: number;
  totalDiscount: number;
  totalDownPayment: number;
  totalFees: number;
  totalNetSalary: number;
  totalPermits: number;
  totalReimbursement: number;
  totalSalary: number;
  totalSaleBonus: number;
  totalSales: number;
  totalTips: number;
}

export const PayStubSchema = new Schema<any>({
  code: { type: SchemaTypes.String, default: () => nanoid(6), required: false },
  addons: [{ type: PayAddonSchema }],
  employee: [{ type: SchemaTypes.ObjectId, ref: 'User' }],
  normalHoursWorked: SchemaTypes.Number,
  overtimeHoursWorked: SchemaTypes.Number,
  payRate: SchemaTypes.Number,
  totalBonus: SchemaTypes.Number,
  totalDiscount: SchemaTypes.Number,
  totalDownPayment: SchemaTypes.Number,
  totalFees: SchemaTypes.Number,
  totalNetSalary: SchemaTypes.Number,
  totalPermits: SchemaTypes.Number,
  totalReimbursement: SchemaTypes.Number,
  totalSalary: SchemaTypes.Number,
  totalSaleBonus: SchemaTypes.Number,
  totalSales: SchemaTypes.Number,
  totalTips: SchemaTypes.Number,
});
