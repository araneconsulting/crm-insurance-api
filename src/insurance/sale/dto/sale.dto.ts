import { SaleItem } from 'business/sub-docs/sale-item';
import { IsArray, IsDateString, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Company } from 'database/company.model';
import { Customer } from 'database/customer.model';
import { Location } from 'database/location.model';
import { Sale } from 'database/sale.model';
import { User } from 'database/user.model';
export class SaleDto {

  code: string;
  amountReceivable: number;
  chargesPaid: number;
  company: Partial<Company>;
  customer: Partial<Customer>; 
  location?: Partial<Location>;
  items: SaleItem[]; //Contains all info about Sale
  seller: Partial<User>;
  soldAt: string;
  tips: number;
  totalCharge: number; //Sum of all sale item amounts
  type: string; 
  isRenewal: boolean; 
  renewalReference?: Partial<Sale>; 
  isEndorsement: boolean; 
  endorsementReference?: Partial<Sale>; 
  policyEffectiveAt?: string;
  nextRenewalAt?: string;
  monthlyPayment?: number;
  financerCompany?: string; //code del subdocumento de la financiera dentro de la compañia

  createdBy?: Partial<User>;
  updatedBy?: Partial<User>;
  
  fees: number; //[auto-calculated] Sum of SaleItem amount where product = Fee
  permits: number; //[auto-calculated] Sum of SaleItem amount where product = Permit
  premium: number; //[auto-calculated] Sum of al SaleItem details[premium];
  profits: number; //[auto-calculated] Sum of al SaleItem profits;

}