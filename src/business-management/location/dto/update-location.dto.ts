import { BusinessInfoDto } from 'business-management/company/dto/company.dto';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
} from 'class-validator';
export class UpdateLocationDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  readonly alias: string;

  @IsOptional()
  @IsNotEmptyObject()
  readonly info: BusinessInfoDto;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  readonly payFrequency: string;
}
