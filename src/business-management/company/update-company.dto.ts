import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber } from 'class-validator';
export class UpdateCompanyDto {
  @IsOptional()
  @IsNotEmpty()
  readonly address1: string;

  @IsOptional()
  @IsNotEmpty()
  readonly address2: string;

  @IsOptional()
  @IsNotEmpty()
  readonly city: string;

  @IsOptional()
  @IsNotEmpty()
  readonly code: string;

  @IsOptional()
  @IsNotEmpty()
  readonly country: string;

  @IsOptional()
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

  @IsOptional()
  @IsNotEmpty()
  readonly name: string;

  @IsOptional()
  @IsOptional()
  readonly otherPhones: string[]; // delimited by-comma string
  
  @IsOptional()
  @IsPhoneNumber()
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

  @IsOptional()
  @IsNotEmpty()
  readonly state: string;

  @IsOptional()
  @IsNotEmpty()
  readonly type: string; // headquarter (H), point of sale (P), office (O)

  @IsOptional()
  @IsNotEmpty()
  readonly website: string;

  @IsOptional()
  @IsNotEmpty()
  readonly zip: string;
}
