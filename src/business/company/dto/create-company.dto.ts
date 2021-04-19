import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { Address } from 'shared/sub-documents/address';
export class CreateCompanyDto {
  
  @IsNotEmpty()
  readonly alias: string;

  @IsOptional()
  @IsNotEmpty()
  readonly address: Address;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsNotEmpty()
  readonly fax: string;

  @IsOptional()
  @IsNotEmpty()
  readonly industry: string; //can be: Auto Parts, Entertainment, Chemical, Engineering, etc

  @IsOptional()
  @IsNotEmpty()
  readonly logo: string;

  @IsNotEmpty()
  readonly name: string;

  @IsOptional()
  readonly otherPhones: string[]; // delimited by-comma string
  
  @IsOptional()
  readonly primaryPhone: string;

  @IsOptional()
  @IsNotEmpty()
  readonly primaryPhoneExtension: string;

  @IsOptional()
  @IsNotEmpty()
  readonly secondaryPhone: string;

  @IsOptional()
  @IsNotEmpty()
  readonly secondaryPhoneExtension: string;

  @IsOptional()
  @IsNotEmpty()
  readonly sector: string; // can be: Financial, Technology, Healthcare, etc

  @IsOptional()
  @IsNotEmpty()
  readonly startedAt: string;

  @IsNotEmpty()
  readonly type: string; // headquarter (H), point of sale (P), office (O)

  @IsOptional()
  @IsNotEmpty()
  readonly website: string;
}
