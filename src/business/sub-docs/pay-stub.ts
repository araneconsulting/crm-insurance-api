import { User } from "database/user.model";

interface PayStub {
    readonly addons: PayAddon[];  
    readonly employee: Partial<User>;
    readonly normalHoursWorked: number;
    readonly overtimeHoursWorked: number;
    readonly payRate: number;
    readonly totalSalary: number; //auto-calculated
    readonly totalBonus: number; //auto-calculated
    readonly totalDiscount: number; //auto-calculated
    readonly totalReimbursement: number; //auto-calculated
  }