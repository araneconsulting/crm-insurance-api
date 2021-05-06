import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export const DEFAULT_COMMISSION = -1;
export class CreateInsurerDto {

  @IsOptional()
  readonly cargoCommission: number = DEFAULT_COMMISSION;
  @IsOptional()
  @IsNotEmpty()
  readonly email: string;
  @IsNotEmpty()
  readonly name: string;
  @IsOptional()
  @IsNotEmpty()
  readonly phone: string;
  @IsOptional()
  readonly liabilityCommission: number = DEFAULT_COMMISSION;
  @IsOptional()
  readonly physicalDamageCommission: number = DEFAULT_COMMISSION;
  @IsOptional()
  readonly wcGlUmbCommission: number = DEFAULT_COMMISSION;
}