import { SaleItem } from 'business/sub-docs/sale-item';
import { IsArray, IsDateString, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Customer } from 'database/customer.model';
import { Location } from 'database/location.model';
import { User } from 'database/user.model';
export class SaleDto {

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  amountReceivable: number;

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

  @IsOptional()
  permits: number;

  @IsOptional()
  fees: number;

  @IsOptional()
  profits: number;

  @IsArray()
  items: SaleItem[];

  @IsOptional()
  @IsMongoId()
  createdBy: Partial<User>;

  @IsOptional()
  @IsMongoId()
  updatedBy: Partial<User>;


}