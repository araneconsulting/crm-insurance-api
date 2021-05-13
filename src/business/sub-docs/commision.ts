import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class Commission extends Map<any, any> {
  @IsString()
  @IsNotEmpty()
  productType: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  percent: number;
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
