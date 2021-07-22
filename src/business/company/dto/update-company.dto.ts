import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
export class UpdateCompanyDto {
  @IsOptional()
  readonly address1: string;

  @IsOptional()
  readonly address2: string;

  @IsOptional()
  readonly city: string;

  @IsOptional()
  readonly country: string;

  @IsOptional()
  
  @IsEmail()
  readonly email: string;

  @IsOptional()
  readonly fax: string;

  @IsOptional()
  readonly industry: string; //can be: Auto Parts, Entertainment, Chemical, Engineering, etc

  @IsOptional()
  readonly logo: string;

  @IsOptional()
  
  readonly name: string;

  @IsOptional()
  @IsOptional()
  readonly otherPhones: string[]; // delimited by-comma string
  
  @IsOptional()
  readonly primaryPhone: string;

  @IsOptional()
  readonly primaryPhoneExtension: string;

  @IsOptional()
  readonly secondaryPhone: string;

  @IsOptional()
  readonly secondaryPhoneExtension: string;

  @IsOptional()
  readonly sector: string; // can be: Financial, Technology, Healthcare, etc

  @IsOptional()
  readonly startedAt: Date;

  @IsOptional()
  readonly state: string;

  @IsOptional()
  readonly type: string; // headquarter (H), point of sale (P), office (O)

  @IsOptional()
  readonly website: string;

  @IsOptional()
  readonly zip: string;
}
