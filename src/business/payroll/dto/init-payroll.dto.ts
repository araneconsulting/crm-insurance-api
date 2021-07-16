import { PayStub } from 'business/sub-docs/pay-stub';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Location } from 'database/location.model';
export class InitPayrollDto {
  @IsOptional()
  location?: Partial<Location>;

  @IsNotEmpty()
  payPeriodEndedAt: Date;

  @IsNotEmpty()
  payPeriodStartedAt: Date;

  @IsOptional()
  @IsNotEmpty()
  scope?: string; //can be Company (C), Location (L), Individual (I)
}