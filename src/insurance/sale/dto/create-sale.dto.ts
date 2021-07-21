import { SaleItem } from 'business/sub-docs/sale-item';
import { IsArray, IsDate, IsDateString, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Customer } from 'database/customer.model';
import { Insurer } from 'database/insurer.model';
import { Location } from 'database/location.model';
import { Sale } from 'database/sale.model';
import { User } from 'database/user.model';
import { EndorsementDto } from './endorsement.dto';
export class CreateSaleDto {

  @IsString()
  @IsNotEmpty()
  lineOfBusiness: string;
  
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @IsDateString()
  @IsNotEmpty()
  soldAt: Date;
  
  @IsOptional()
  @IsNotEmpty()
  customer: Partial<Customer>;
  
  @IsOptional()
  @IsNotEmpty()
  seller: Partial<User>;

  @IsOptional()
  @IsNotEmpty()
  location: Partial<Location>;

  @IsOptional()
  @IsNumber()
  tips: number;

  @IsOptional()
  @IsNumber()
  totalCharge: number;

  @IsOptional()
  @IsNumber()
  downPayment: number;

  @IsOptional()
  @IsNumber()
  chargesPaid: number;

  @IsOptional()
  premium: number;

  @IsArray()
  items?: SaleItem[];

  @IsOptional()
  isRenewal: boolean; 
  
  @IsOptional()
  @IsNotEmpty()
  renewalReference: Partial<Sale>; 
  
  @IsOptional()
  effectiveAt: Date; 

  expiresAt: Date;
  
  @IsNumber()
  monthlyPayment: number;

  @IsOptional()
  @IsString()
  financerCompany?: Partial<Insurer>; //code del subdocumento de la financiera dentro de la compañia

  @IsOptional()
  @IsDateString()
  cancelledAt?: Date;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  number: string;

  renewalFrequency: string; //can be: ANNUAL, SEMI-ANNUAL, QUARTERLY, MONTHLY, VARIABLE
  autoRenew: boolean;

  endorsements?: Partial<EndorsementDto>[];
  
}