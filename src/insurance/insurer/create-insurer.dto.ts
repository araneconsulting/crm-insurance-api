import { BusinessInfo } from 'business/sub-docs/business-info';
import { Commission } from 'business/sub-docs/commission';
import { ContactInfo } from 'business/sub-docs/contact-info';
import {
  IsArray,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
} from 'class-validator';
export class CreateInsurerDto {
  @IsNotEmptyObject()
  readonly business?: BusinessInfo;

  @IsArray()
  @IsOptional()
  readonly commissions?: Commission[];

  @IsOptional()
  @IsNotEmptyObject()
  readonly contact?: ContactInfo;

  @IsOptional()
  @IsNotEmpty()
  readonly subproviders?: string[];

  @IsOptional()
  @IsNotEmpty()
  readonly type?: string = 'SINGLE';
}
