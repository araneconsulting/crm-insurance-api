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
  fax: string;

  @IsOptional()
  industry: string; //can be: Auto Parts, Entertainment, Chemical, Engineering, etc

  @IsOptional()
  logo: string;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  otherPhones: string[]; // delimited by-comma string
  
  @IsOptional()
  primaryPhone: string;

  @IsOptional()
  primaryPhoneExtension: string;

  @IsOptional()
  secondaryPhone: string;

  @IsOptional()
  secondaryPhoneExtension: string;

  @IsOptional()
  sector: string; // can be: Financial, Technology, Healthcare, etc

  @IsOptional()
  startedAt: Date;

  @IsOptional()
  type: string; // LLC, S Corp, C Corp

  @IsOptional()
  website: string;

  financerCompanies: BusinessInfo[];
}
