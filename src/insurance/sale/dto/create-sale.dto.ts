import { SaleItem } from 'business/sub-docs/sale-item';
import { IsArray, IsDate, IsDateString, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
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
  totalInsurance: number;

  @IsOptional()
  @IsNumber()
  chargesPaid: number;

  @IsOptional()
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
  policyEffectiveAt: string; 

  nextRenewalAt: string;
  
  @IsNumber()
  monthlyPayment: number;

  @IsOptional()
  @IsString()
  financerCompany?: string; //code del subdocumento de la financiera dentro de la compañia
  
}