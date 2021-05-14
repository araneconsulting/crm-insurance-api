import { IsNotEmpty, IsOptional } from 'class-validator';
import { PayStub } from 'database/pay-stub.model';
export class UpdatePayrollDto {
  
  @IsOptional()
  @IsNotEmpty()
  readonly payPeriodEndedAt?: string;

  @IsOptional()
  @IsNotEmpty()
  readonly payPeriodStartedAt?: string;

  @IsOptional() 
  @IsNotEmpty()
  readonly scope?: string; //can be Company (C), Payroll (L), Individual (I)

  readonly payStubs: PayStub[];
}
