import { BusinessInfoDto } from 'business-management/company/dto/company.dto';
import { IsNotEmpty, IsNotEmptyObject, IsString } from 'class-validator';
export class CreateLocationDto {
  @IsNotEmpty()
  @IsString()
  readonly alias: string;

  @IsNotEmptyObject()
  readonly info: BusinessInfoDto;

  @IsNotEmpty()
  @IsString()
  readonly payFrequency: string;
}
