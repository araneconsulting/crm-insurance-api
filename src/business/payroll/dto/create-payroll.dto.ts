import { IsNotEmpty, IsOptional } from 'class-validator';
import { Company } from 'database/company.model';
import { Location } from 'database/location.model';
import { PayStub } from 'database/pay-stub.model';
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
