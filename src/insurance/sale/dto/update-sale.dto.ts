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
  IsString,
} from 'class-validator';
import { Customer } from 'database/customer.model';
import { Insurer } from 'database/insurer.model';
import { Sale } from 'database/sale.model';
import { User } from 'database/user.model';
import { EndorsementDto } from './endorsement.dto';

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
  policyEffectiveAt: Date; 

  @IsOptional()
  @IsNotEmpty()
  customer: Partial<Customer>;

  @IsOptional()
  totalCharge: number; //Sum of all sale item amounts

  @IsOptional()
  downPayment: number; //Sum of all sale item amounts

  @IsOptional()
  policyExpiresAt: Date;

  @IsOptional()
  monthlyPayment: number;

  @IsOptional()
  financerCompany?: Partial<Insurer>; //code del subdocumento de la financiera dentro de la compañia

  @IsOptional()
  @IsDateString()
  policyCancelledAt?: Date;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  policyNumber: string;

  renewalFrequency: string; //can be: ANNUAL, SEMI-ANNUAL, QUARTERLY, MONTHLY, VARIABLE
  autoRenew: boolean;

  endorsements?: Partial<EndorsementDto>[];
}
