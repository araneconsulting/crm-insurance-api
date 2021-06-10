import { PayStub } from 'business/sub-docs/pay-stub';
import { Company } from 'database/company.model';
import { Location } from 'database/location.model';
import { User } from 'database/user.model';

export class PayrollDto {
  executedBy?: Partial<User>;
  company?: Partial<Company>;
  location?: Partial<Location>;
  payExecutedAt?: string;
  payPeriodEndedAt?: string;
  payPeriodStartedAt?: string;
  payStubs?: Partial<PayStub>[];
  scope?: string;
  status?: string;
  createdBy?: Partial<User>;
  updatedBy?: Partial<User>;
}

