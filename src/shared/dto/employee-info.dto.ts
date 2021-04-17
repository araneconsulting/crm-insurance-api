import { IsBoolean, IsBooleanString, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class EmployeeInfoDto extends Map<any, any> {

  @IsOptional()
  @IsDateString()
  readonly endedAt: string;
  
  @IsOptional()
  readonly location: Partial<Location>;

  @IsOptional()
  @IsNotEmpty()
  readonly position: string; //can be: Sales Agent, IT, Certificates Assistant, etc

  @IsOptional()
  @IsNotEmpty()
  readonly payFrequency: string; //can be: hourly (H), daily (D), weekly (W), monthly (M), Bi-weekly (B), Twice a month (T), Yearly (Y)

  @IsOptional()
  @IsNumber()
  readonly payRate: number;

  @IsOptional()
  @IsBoolean()
  readonly overtimeAuthorized: boolean;

  @IsOptional()
  @IsNumber()
  readonly overtimePayRate: number;

  @IsOptional()
  @IsNotEmpty()
  readonly salaryFormula: string;

  @IsOptional()
  @IsDateString()
  readonly startedAt: string;

  @IsOptional()
  @IsNotEmpty()
  readonly workPrimaryPhone: string;

  @IsOptional()
  @IsNotEmpty()
  readonly workPrimaryPhoneExtension: string;

  @IsOptional()
  @IsNumber()
  hourlyRate: number;
}
