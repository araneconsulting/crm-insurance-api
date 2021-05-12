import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Address } from 'shared/sub-documents/address';

export class Commission extends Map<any, any> {
  productType: string;
  percent: number;
}

export class CommissionSheet extends Map<any, any> {
  @IsOptional()
  @IsArray()
  readonly commisions: Commission[];
}

export const DEFAULT_BUSINESS_INFO = {
  commissions: [
    { productType: 'TRUCKING', percent: 0 },
    { productType: 'AUTO', percent: 0 },
    { productType: 'HOME', percent: 0 },
    { productType: 'RENTAL', percent: 0 },
    { productType: 'COMMERCIAL', percent: 0 },
    { productType: 'LIFE', percent: 0 },
    { productType: 'HEALTH', percent: 0 },
    { productType: 'PERMIT', percent: 0 },
  ]
};
