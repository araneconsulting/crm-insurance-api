import { BusinessInfo } from 'business/sub-docs/business-info';
import { CommissionSheet } from 'business/sub-docs/commision-sheet';
import { ContactInfo } from 'business/sub-docs/contact-info';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
} from 'class-validator';
import { Communication } from 'shared/sub-documents/communication';
export class CreateInsurerDto {
  @IsNotEmptyObject()
  readonly business?: BusinessInfo;

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
  readonly type?: string = 'SINGLE';
}
