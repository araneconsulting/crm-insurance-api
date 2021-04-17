import { BusinessInfo } from 'business/company/dto/company.dto';
import { ContactInfo } from 'business/sub-docs/contact-info';
import { User } from 'database/user.model';
import { Communication } from 'shared/sub-documents/communication';
export class UpdateCustomerDto {
  
  readonly company?: BusinessInfo;
  readonly contact?: ContactInfo;
  readonly communication?: Communication;
  readonly createdBy?: Partial<User>;
  readonly type: string;
  readonly updatedBy?: Partial<User>;

}
