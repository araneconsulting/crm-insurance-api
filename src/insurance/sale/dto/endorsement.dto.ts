import { Company } from 'database/company.model';
import { Sale } from 'database/sale.model';
import { User } from 'database/user.model';

export class EndorsementDto {
  amount: number;
  code: string;
  company: Partial<Company>
  description?: string;

  markedToDelete: boolean = false;

  endorsedAt: Date;
  followUpDate?: Date;
  followUpPerson?: Partial<User>;

  policy: Partial<Sale>;
  status?: string; //Available values: src/shared/const/catalog/endorsement-status.ts
  type: string; //Available values: src/shared/const/catalog/endorsement-type.ts

  createdBy: Partial<User>;
  updatedBy?: Partial<User>;

  items?: any[];
  accountingClass: string; //Self created from: [CHECKSUM_SANITY, PREMIUM, TAXES_AND_FEES, AGENCY_COMMISSION, RECEIVABLES, PAYABLES, FINANCED_AMOUNT]
}
