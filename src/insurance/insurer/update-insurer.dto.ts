import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export const DEFAULT_COMMISSION: number = 0.1;

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
  @IsNumber()
  readonly liabilityCommission: number = DEFAULT_COMMISSION;
  @IsNumber()
  readonly cargoCommission: number = DEFAULT_COMMISSION;
  @IsNumber()
  readonly physicalDamageCommission: number = DEFAULT_COMMISSION;
  @IsNumber()
  readonly wcGlUmbCommission: number = DEFAULT_COMMISSION;
}