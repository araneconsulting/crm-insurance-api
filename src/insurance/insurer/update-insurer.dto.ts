import { BusinessInfo } from 'business/sub-docs/business-info';
import { CommissionSheet } from 'business/sub-docs/commision-sheet';
import { ContactInfo } from 'business/sub-docs/contact-info';
import {
  IsBoolean,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class UpdateInsurerDto {
  @IsOptional()
  @IsNotEmptyObject()
  readonly business?: BusinessInfo;

  @IsOptional()
  @IsNotEmptyObject()
  readonly commissionSheet?: CommissionSheet;

  @IsOptional()
  @IsNotEmptyObject()
  readonly contact?: ContactInfo;

  @IsOptional()
  @IsNotEmpty()
  readonly subproviders?: string[];

  @IsOptional()
  @IsNotEmpty()
  readonly type?: string;
}
