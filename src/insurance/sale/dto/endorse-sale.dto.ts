import { SaleItem } from 'business/sub-docs/sale-item';
import { IsArray, IsMongoId, IsNumber, IsOptional } from 'class-validator';
import { Sale } from 'database/sale.model';
export class EndorseSaleDto {
  premium?: number;
  chargesPaid?: number;
  items: SaleItem[];
  isEndorsement: boolean; 
  endorsementReference: Partial<Sale>; 
  monthlyPayment?: number;
}