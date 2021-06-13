import { PayStub } from 'business/sub-docs/pay-stub';
import { IsNotEmpty, IsOptional } from 'class-validator';
export class UpdatePayrollDto {
  
  @IsOptional()
  @IsNotEmpty()
  readonly payPeriodEndedAt?: Date;

  @IsOptional()
  @IsNotEmpty()
  readonly payPeriodStartedAt?: Date;

  @IsOptional() 
  @IsNotEmpty()
  readonly scope?: string; //can be Company (C), Payroll (L), Individual (I)

  readonly payStubs: PayStub[];
}
