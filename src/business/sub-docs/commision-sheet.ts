import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Address } from 'shared/sub-documents/address';

export class CommissionSheet extends Map<any, any> {
  @IsOptional()
  @IsNumber()
  readonly cargoCommission: number;

  @IsOptional()
  @IsNumber()
  readonly liabilityCommission: number;

  @IsOptional()
  @IsNumber()
  readonly physicalDamageCommission: number;

  @IsOptional()
  @IsNumber()
  readonly wcGlUmbCommission: number;
}

export const DEFAULT_BUSINESS_INFO = {
  cargoCommission: 0,
  liabilityCommission: 0,
  physicalDamageCommission: 0,
  wcGlUmbCommission: 0,
};
