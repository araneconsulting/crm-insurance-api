import {
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
} from 'class-validator';
import { Customer } from 'database/customer.model';
import { Insurer } from 'database/insurer.model';
import { User } from 'database/user.model';

export const DEFAULT_COMMISSION = 0.1;

export class UpdateSaleDto {

  @IsOptional()
  @IsDateString()
  @IsNotEmpty()
  soldAt: string;

  @IsOptional()
  @IsNotEmpty()
  seller: Partial<User>;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  tips: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  chargesPaid: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  premium: number;

  @IsObject()
  items: [];
}
