import { Company } from 'database/company.model';
import { Location } from 'database/location.model';
import { PayStub } from 'database/pay-stub.model';
import { User } from 'database/user.model';

export class Payroll {
  readonly executedBy: Partial<User>;
  readonly company: Partial<Company>;
  readonly location: Partial<Location>;
  readonly payExecutedAt: string;
  readonly payPeriodEndedAt: string;
  readonly payPeriodStartedAt: string;
  readonly payStubs: PayStub[];
  readonly scope: string;
}
