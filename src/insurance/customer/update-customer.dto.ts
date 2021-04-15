import { IsBoolean, IsNotEmpty } from 'class-validator';
import { User } from 'database/user.model';
import { AddressDto } from 'shared/dto/address.dto';
import { CommunicationDto } from 'shared/dto/communication.dto';
import { TruckingInfoDto } from './dto/trucking-info.dto';
export class UpdateCustomerDto {
  readonly address: AddressDto;
  readonly birthday: Date;
  readonly communication: CommunicationDto;
  readonly company: string;
  readonly createdBy?: Partial<User>;
  readonly email: string;
  readonly fax: string;
  readonly name: string;
  readonly phone: string;
  readonly type: string;
  readonly updatedBy?: Partial<User>;
  //EXTRA FIELDS
  readonly truckingInfo?: TruckingInfoDto;

}
