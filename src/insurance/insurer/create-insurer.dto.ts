import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
export class CreateInsurerDto {

  @IsNotEmpty()
  readonly name: string;
  @IsOptional()
  @IsNotEmpty()
  readonly email: string;
  @IsOptional()
  @IsNotEmpty()
  readonly phone: string;
  @IsNumber()
  readonly liabilityCommission: number;
  @IsNumber()
  readonly cargoCommission: number;
  @IsNumber()
  readonly physicalDamageCommission: number;
  @IsNumber()
  readonly wcGlUmbCommission: number;
}