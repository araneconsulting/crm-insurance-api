import { SaleItem } from 'business/sub-docs/sale-item';
import { IsArray, IsDateString, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Customer } from 'database/customer.model';
import { Location } from 'database/location.model';
import { Sale } from 'database/sale.model';
import { User } from 'database/user.model';
export class CreateSaleDto {

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @IsDateString()
  @IsNotEmpty()
  soldAt: string;
  
  @IsNotEmpty()
  @IsMongoId()
  customer: Partial<Customer>;
  
  @IsOptional()
  @IsNotEmpty()
  seller: Partial<User>;

  @IsNotEmpty()
  @IsMongoId()
  location: Partial<Location>;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  tips: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  totalCharge: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  chargesPaid: number;

  @IsOptional()
  premium: number;

  @IsArray()
  items: SaleItem[];

  @IsOptional()
  isRenewal: boolean; 
  
  @IsOptional()
  @IsMongoId()
  renewalReference: Partial<Sale>; 

  @IsOptional()
  isEndorsement: boolean; 

  @IsOptional()
  @IsMongoId()
  endorsementReference: Partial<Sale>; 
  
  @IsOptional()
  policyEffectiveAt: string; 

  @IsNumber()
  fees: number;

  nextRenewalAt: string;
  
  @IsNumber()
  monthlyPayment: number;

  @IsString()
  financerCompany: string; //code del subdocumento de la financiera dentro de la compañia
  
}