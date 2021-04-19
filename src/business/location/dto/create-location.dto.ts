import { BusinessInfo } from 'business/sub-docs/business-info';
import { IsNotEmpty, IsNotEmptyObject, IsString } from 'class-validator';
import { Company } from 'database/company.model';
export class CreateLocationDto {
  @IsNotEmpty()
  @IsString()
  readonly alias: string;

  @IsNotEmpty()
  @IsString()
  readonly company: Partial<Company>;

  @IsNotEmptyObject()
  readonly info: BusinessInfo;

  @IsNotEmpty()
  @IsString()
  readonly payFrequency: string;
}
