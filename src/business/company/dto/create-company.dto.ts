import { BusinessInfo } from 'business/sub-docs/business-info';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { Address } from 'shared/sub-documents/address';
export class CreateCompanyDto {

  @IsOptional()
  @IsNotEmpty()
  address: Address;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsNotEmpty()
  fax: string;

  @IsOptional()
  @IsNotEmpty()
  industry: string; //can be: Auto Parts, Entertainment, Chemical, Engineering, etc

  @IsOptional()
  @IsNotEmpty()
  logo: string;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  otherPhones: string[]; // delimited by-comma string
  
  @IsOptional()
  primaryPhone: string;

  @IsOptional()
  @IsNotEmpty()
  primaryPhoneExtension: string;

  @IsOptional()
  @IsNotEmpty()
  secondaryPhone: string;

  @IsOptional()
  @IsNotEmpty()
  secondaryPhoneExtension: string;

  @IsOptional()
  @IsNotEmpty()
  sector: string; // can be: Financial, Technology, Healthcare, etc

  @IsOptional()
  @IsNotEmpty()
  startedAt: string;

  @IsNotEmpty()
  type: string; // LLC, S Corp, C Corp

  @IsOptional()
  @IsNotEmpty()
  website: string;

  financerCompanies: BusinessInfo[];
}
