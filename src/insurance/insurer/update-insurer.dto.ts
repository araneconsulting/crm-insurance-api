import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export const DEFAULT_COMMISSION: number = -1;

export class UpdateInsurerDto {

  @IsOptional()
  @IsNotEmpty()
  readonly name: string;
  @IsOptional()
  @IsNotEmpty()
  readonly email: string;
  @IsOptional()
  @IsNotEmpty()
  readonly phone: string;
  @IsOptional()
  @IsNumber()
  readonly liabilityCommission: number = DEFAULT_COMMISSION;
  @IsOptional()
  @IsNumber()
  readonly cargoCommission: number = DEFAULT_COMMISSION;
  @IsOptional()
  @IsNumber()
  readonly physicalDamageCommission: number = DEFAULT_COMMISSION;
  @IsOptional()
  @IsNumber()
  readonly wcGlUmbCommission: number = DEFAULT_COMMISSION;
}