import { SaleItem } from 'business/sub-docs/sale-item';
import { IsArray, IsDateString, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Company } from 'database/company.model';
import { Customer } from 'database/customer.model';
import { Insurer } from 'database/insurer.model';
import { Location } from 'database/location.model';
import { Sale } from 'database/sale.model';
import { User } from 'database/user.model';
export class SaleDto {

  code: string;
  amountReceivable?: number;
  chargesPaid: number;
  company: Partial<Company>;
  customer: Partial<Customer>; 
  location?: Partial<Location>;
  items: SaleItem[]; //Contains all info about Sale
  seller: Partial<User>;
  soldAt: Date;
  tips: number;
  totalCharge: number; //Sum of all sale item amounts
  downPayment: number; //Sum of items that are neither fee nor permits
  type: string; 
  isRenewal: boolean; 
  isChargeItemized: boolean; 
  renewalReference?: Partial<Sale>; 
  isEndorsement: boolean; 
  endorsementReference?: Partial<Sale>; 
  policyEffectiveAt?: Date;
  policyExpiresAt?: Date;
  monthlyPayment?: number;
  financerCompany?: Partial<Insurer>; //code del subdocumento de la financiera dentro de la compañia

  createdBy?: Partial<User>;
  updatedBy?: Partial<User>;
  
  fees: number; //[auto-calculated] Sum of SaleItem amount where product = Fee
  permits: number; //[auto-calculated] Sum of SaleItem amount where product = Permit
  premium: number; //[auto-calculated] Sum of al SaleItem details[premium];
  profits: number; //[auto-calculated] Sum of al SaleItem profits;

  policyCancelledAt?: Date;
  status?: string;
  policyNumber: string;

  renewalFrequency: string; //can be: ANNUAL, SEMI-ANNUAL, QUARTERLY, MONTHLY, VARIABLE
  autoRenew: boolean;

  endorsements?: Partial<Sale>[];
}