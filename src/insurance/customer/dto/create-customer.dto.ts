import { BusinessInfoDto } from 'business-management/company/dto/company.dto';
import { IsNotEmpty, IsNotEmptyObject, IsOptional, IsString } from 'class-validator';
import { User } from 'database/user.model';
import { CommunicationDto } from 'shared/dto/communication.dto';
import { ContactInfoDto } from 'shared/dto/contact-info.dto';
export class CreateCustomerDto {
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
  @IsNotEmpty()
  @IsString()
  readonly type: string;
  
}