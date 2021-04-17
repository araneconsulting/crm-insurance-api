import { BusinessInfo } from 'business/company/dto/company.dto';
import { ContactInfo } from 'business/sub-docs/contact-info';
import { IsBoolean, IsNotEmpty, IsNotEmptyObject, IsOptional, IsString } from 'class-validator';
import { User } from 'database/user.model';
import { Address } from 'shared/sub-documents/address';
import { Communication } from 'shared/sub-documents/communication';
import { TruckingInfoDto } from './trucking-info.dto';
export class UpdateCustomerDto {
  
  @IsOptional()
  @IsNotEmptyObject()
  readonly company?: BusinessInfo;

  @IsOptional()
  @IsNotEmptyObject()
  readonly contact?: ContactInfo;

  @IsOptional()
  @IsNotEmptyObject()
  readonly communication?: Communication;

  @IsOptional()
  @IsNotEmptyObject()
  readonly createdBy?: Partial<User>;
  
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  readonly type: string;
  
  @IsOptional()
  @IsNotEmptyObject()
  readonly updatedBy?: Partial<User>;

}
