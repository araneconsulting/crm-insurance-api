import { User } from 'database/user.model';
import { Schema, SchemaTypes } from 'mongoose';
import { PayAddon, PayAddonSchema } from './pay-addon';

export class PayStub {
  addons: PayAddon[];
  employee: Partial<User>;
  normalHoursWorked: number;
  overtimeHoursWorked: number;
  payRate: number;
  totalSalary: number; //auto-calculated
  totalTips: number; //auto-calculated
  totalFees: number; //auto-calculated
  totalPermits: number; //auto-calculated
  totalBonus: number; //auto-calculated
  totalDiscount: number; //auto-calculated
  totalReimbursement: number; //auto-calculated
  totalSales: number; //auto-calculated
  totalNetSalary: number; //auto-calculated
}

export const PayStubSchema = new Schema<any>({
  addons: [{ type: PayAddonSchema }],
  employee: [{ type: SchemaTypes.ObjectId, ref: 'User' }],
  normalHoursWorked: SchemaTypes.Number,
  overtimeHoursWorked: SchemaTypes.Number,
  payRate: SchemaTypes.Number,
  totalSalary: SchemaTypes.Number,
  totalTips: SchemaTypes.Number,
  totalFees: SchemaTypes.Number,
  totalPermits: SchemaTypes.Number,
  totalBonus: SchemaTypes.Number,
  totalDiscount: SchemaTypes.Number,
  totalReimbursement: SchemaTypes.Number,
  totalSales: SchemaTypes.Number,
  totalNetSalary: SchemaTypes.Number,
});
