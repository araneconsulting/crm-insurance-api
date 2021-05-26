import { BusinessInfo } from 'business/sub-docs/business-info';
import { Commission } from 'business/sub-docs/commission';
import { ContactInfo } from 'business/sub-docs/contact-info';
import {
  IsArray,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
} from 'class-validator';
import { Communication } from 'shared/sub-documents/communication';
import { SubProvider } from './update-insurer.dto';
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
  readonly subproviders?: SubProvider[];

  @IsOptional()
  @IsNotEmpty()
  readonly type?: string = 'SINGLE';
}
