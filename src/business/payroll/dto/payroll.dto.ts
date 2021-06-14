import { PayStub } from 'business/sub-docs/pay-stub';
import { Company } from 'database/company.model';
import { Location } from 'database/location.model';
import { User } from 'database/user.model';

export class PayrollDto {
  executedBy?: Partial<User>;
  company?: Partial<Company>;
  location?: Partial<Location>;
  payExecutedAt?: Date;
  payPeriodEndedAt?: Date;
  payPeriodStartedAt?: Date;
  payStubs?: PayStub[];
  scope?: string;
  status?: string;
  createdBy?: Partial<User>;
  updatedBy?: Partial<User>;

  totalExtraBonus?: number;
  totalDiscount?: number;
  totalDownPayment?: number;
  totalFees?: number;
  totalNetSalary?: number;
  totalPermits?: number;
  totalReimbursement?: number;
  totalRegularSalary?: number;
  totalSaleBonus?: number;
  totalSales?: number;
  totalTips?: number;
}

