import { IsNotEmpty, IsOptional } from 'class-validator';
export class UpdatePayrollDto {
  
  @IsOptional()
  @IsNotEmpty()
  readonly payPeriodEndedAt?: string;

  @IsOptional()
  @IsNotEmpty()
  readonly payPeriodStartedAt?: string;

  @IsOptional() 
  @IsNotEmpty()
  readonly scope?: string; //can be Company (C), Location (L), Individual (I)
}
