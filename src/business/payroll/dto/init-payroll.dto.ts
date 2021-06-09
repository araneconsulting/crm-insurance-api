import { PayStub } from 'business/sub-docs/pay-stub';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Location } from 'database/location.model';
export class InitPayrollDto {
  @IsOptional()
  location?: string;

  @IsNotEmpty()
  payPeriodEndedAt: string;

  @IsNotEmpty()
  payPeriodStartedAt: string;

  @IsOptional()
  @IsNotEmpty()
  scope?: string; //can be Company (C), Location (L), Individual (I)
}
