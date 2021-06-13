import { SaleItem } from 'business/sub-docs/sale-item';
import {
  IsArray,
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
import { Sale } from 'database/sale.model';
import { User } from 'database/user.model';

export const DEFAULT_COMMISSION = 0.1;

export class UpdateSaleDto {

  @IsOptional()
  @IsDateString()
  @IsNotEmpty()
  soldAt: Date;

  @IsOptional()
  @IsNotEmpty()
  seller: Partial<User>;

  @IsOptional()
  @IsNumber()
  tips: number;

  @IsOptional()
  @IsNumber()
  chargesPaid: number;

  @IsOptional()
  @IsNumber()
  premium: number;

  @IsArray()
  items: SaleItem[];

  @IsOptional()
  isRenewal: boolean; 
  
  @IsOptional()
  @IsNotEmpty()
  renewalReference: Partial<Sale>; 

  @IsOptional()
  isEndorsement: boolean; 

  @IsOptional()
  @IsNotEmpty()
  endorsementReference: Partial<Sale>; 
  
  @IsOptional()
  policyEffectiveAt: Date; 

  @IsOptional()
  @IsNotEmpty()
  customer: Partial<Customer>;

  @IsOptional()
  totalCharge: number; //Sum of all sale item amounts

  @IsOptional()
  totalInsurance: number; //Sum of all sale item amounts

  @IsOptional()
  nextRenewalAt: Date;

  @IsOptional()
  monthlyPayment: number;

  @IsOptional()
  financerCompany?: string; //code del subdocumento de la financiera dentro de la compañia
}
