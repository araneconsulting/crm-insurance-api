import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber } from 'class-validator';
export class CreateCompanyDto {
  @IsOptional()
  @IsNotEmpty()
  readonly address_1: string;

  @IsOptional()
  @IsNotEmpty()
  readonly address_2: string;

  @IsOptional()
  @IsNotEmpty()
  readonly city: string;

  @IsNotEmpty()
  readonly code: string;

  @IsOptional()
  @IsNotEmpty()
  readonly country: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsNotEmpty()
  readonly fax: string;

  @IsOptional()
  @IsNotEmpty()
  readonly industry: string; //can be: Auto Parts, Entertainment, Chemical, Engineering, etc

  @IsNotEmpty()
  readonly name: string;

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

  @IsNotEmpty()
  readonly type: string; // headquarter (H), point of sale (P), office (O)

  @IsOptional()
  @IsNotEmpty()
  readonly website: string;

  @IsOptional()
  @IsNotEmpty()
  readonly zip: string;
}
