import { BusinessInfoDto } from 'business-management/company/dto/company.dto';
import { IsBoolean, IsNotEmpty, IsNotEmptyObject, IsOptional, IsString } from 'class-validator';
import { User } from 'database/user.model';
import { AddressDto } from 'shared/dto/address.dto';
import { CommunicationDto } from 'shared/dto/communication.dto';
import { ContactInfoDto } from 'shared/dto/contact-info.dto';
import { TruckingInfoDto } from './trucking-info.dto';
export class UpdateCustomerDto {
  
  readonly company?: BusinessInfoDto;
  readonly contact?: ContactInfoDto;
  readonly communication?: CommunicationDto;
  readonly createdBy?: Partial<User>;
  readonly type: string;
  readonly updatedBy?: Partial<User>;

}
