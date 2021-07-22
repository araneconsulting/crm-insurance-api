import { BusinessInfo } from 'business/sub-docs/business-info';
import { IsNotEmpty, IsNotEmptyObject, IsOptional, IsString } from 'class-validator';
import { Company } from 'database/company.model';
export class CreateLocationDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  readonly alias: string;

  @IsNotEmptyObject()
  readonly business: BusinessInfo;

  @IsNotEmpty()
  @IsString()
  readonly payFrequency: string;
}
