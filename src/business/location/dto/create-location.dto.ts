import { BusinessInfo } from 'business/company/dto/company.dto';
import { IsNotEmpty, IsNotEmptyObject, IsString } from 'class-validator';
export class CreateLocationDto {
  @IsNotEmpty()
  @IsString()
  readonly alias: string;

  @IsNotEmptyObject()
  readonly info: BusinessInfo;

  @IsNotEmpty()
  @IsString()
  readonly payFrequency: string;
}
