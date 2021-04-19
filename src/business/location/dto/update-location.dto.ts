
import { BusinessInfo } from 'business/sub-docs/business-info';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Company } from 'database/company.model';
export class UpdateLocationDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  readonly alias: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  readonly company: Partial<Company>;

  @IsOptional()
  @IsNotEmptyObject()
  readonly info: BusinessInfo;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  readonly payFrequency: string;
}
