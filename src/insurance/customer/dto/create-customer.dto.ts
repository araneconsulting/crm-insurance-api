import { BusinessInfo } from 'business/company/dto/company.dto';
import { ContactInfo } from 'business/sub-docs/contact-info';
import { IsNotEmpty, IsNotEmptyObject, IsOptional, IsString } from 'class-validator';
import { Communication } from 'shared/sub-documents/communication';
export class CreateCustomerDto {
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
  @IsNotEmpty()
  @IsString()
  readonly type: string;
  
}