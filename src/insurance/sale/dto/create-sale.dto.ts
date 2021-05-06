import { IsDateString, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Customer } from 'database/customer.model';
import { Insurer } from 'database/insurer.model-old';
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

  @IsOptional()
  @IsNotEmpty()
  @IsMongoId()
  liabilityInsurer: Partial<Insurer>;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  liabilityCharge: number;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  liabilityProfit: number;

  @IsOptional()
  @IsNotEmpty()
  @IsMongoId()
  cargoInsurer: Partial<Insurer>;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  cargoCharge: number;
  
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  cargoProfit: number;

  @IsOptional()
  @IsNotEmpty()
  @IsMongoId()
  physicalDamageInsurer: Partial<Insurer>;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  physicalDamageCharge: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  physicalDamageProfit: number;

  @IsOptional()
  @IsNotEmpty()
  @IsMongoId()
  wcGlUmbInsurer: Partial<Insurer>;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  wcGlUmbCharge: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  wcGlUmbProfit: number;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  location: Partial<Location>;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  fees: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  permits: number;

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

}