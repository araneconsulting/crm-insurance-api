import { User } from "database/user.model";

interface PayStub extends Map<any,any> {
    readonly addons: PayAddon[];  
    readonly employee: Partial<User>;
    readonly normalHoursWorked: number;
    readonly overtimeHoursWorked: number;
    readonly payRate: number;
  }