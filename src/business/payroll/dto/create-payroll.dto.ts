import { PayStub } from 'business/sub-docs/pay-stub';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Location } from 'database/location.model';
export class CreatePayrollDto {

  @IsOptional()
  readonly location?: Partial<Location>;

  @IsNotEmpty()
  readonly payPeriodEndedAt: string;

  @IsNotEmpty()
  readonly payPeriodStartedAt: string;

  @IsOptional() 
  @IsNotEmpty()
  readonly scope?: string; //can be Company (C), Location (L), Individual (I)

  readonly payStubs: PayStub[]
}
