import { BusinessInfoDto } from 'business-management/company/dto/company.dto';
import { IsBoolean, IsNotEmpty, IsNotEmptyObject, IsOptional, IsString } from 'class-validator';
import { User } from 'database/user.model';
import { AddressDto } from 'shared/dto/address.dto';
import { CommunicationDto } from 'shared/dto/communication.dto';
import { ContactInfoDto } from 'shared/dto/contact-info.dto';
import { TruckingInfoDto } from './trucking-info.dto';
export class UpdateCustomerDto {
  
  @IsOptional()
  @IsNotEmptyObject()
  readonly company?: BusinessInfoDto;

  @IsOptional()
  @IsNotEmptyObject()
  readonly contact?: ContactInfoDto;

  @IsOptional()
  @IsNotEmptyObject()
  readonly communication?: CommunicationDto;

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
