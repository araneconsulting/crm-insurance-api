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

  @IsArray()
  items: SaleItem[];

  @IsOptional()
  isRenewal: boolean; 
  
  @IsOptional()
  renewalReference: Partial<Sale>; 

  @IsOptional()
  isEndorsement: boolean; 

  @IsOptional()
  endorsementReference: Partial<Sale>; 
  
  @IsOptional()
  policyEffectiveAt: string; 

  @IsOptional()
  customer: Partial<Customer>;

  @IsOptional()
  totalCharge: number; //Sum of all sale item amounts

  @IsOptional()
  totalInsurance: number; //Sum of all sale item amounts

  @IsOptional()
  nextRenewalAt: string;

  @IsOptional()
  monthlyPayment: number;

  @IsOptional()
  financerCompany?: string; //code del subdocumento de la financiera dentro de la compañia
}
