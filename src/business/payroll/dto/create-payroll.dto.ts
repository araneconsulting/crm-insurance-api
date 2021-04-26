import { IsNotEmpty, IsOptional } from 'class-validator';
import { Company } from 'database/company.model';
export class CreatePayrollDto {
  
  @IsOptional()
  readonly company: Partial<Company>;

  @IsOptional()
  readonly location?: Partial<Location>;

  @IsNotEmpty()
  readonly payPeriodEndedAt: string;

  @IsNotEmpty()
  readonly payPeriodStartedAt: string;

  @IsOptional() 
  @IsNotEmpty()
  readonly scope?: string; //can be Company (C), Payroll (L), Individual (I)
}
