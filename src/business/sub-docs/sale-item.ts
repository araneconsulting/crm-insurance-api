import { IsNotEmpty, IsNumber, IsObject, IsOptional } from 'class-validator';

export class SaleItem extends Map<any, any> {
  @IsNotEmpty()
  product: string;
  //can be: TRUCKING_LIABILITY, TRUCKING_WCGLUMB, TRUCKING_CARGO, TRUCKING_PHYSICAL_DAMAGE, TRUCKING_PERMIT,  AUTO_LIABILITY_FULL, AUTO_LIABILITY_GENERAL...

  @IsNotEmpty()
  type: string; //can be:

  @IsNumber()
  amount: number;

  @IsNotEmpty()
  provider: string; //Provider (Insurer) ID

  @IsOptional()
  subprovider: string; //Broker subprovider name (ej: Progressive)

  @IsNumber()
  profits: number; //Auto calculated (commission % of amount)

  @IsOptional()
  @IsObject()
  details: any;
}

export const DEFAULT_SALE_ITEM = {
  name: '',
  type: '',
  amount: 0,
  provider: '',
  subprovider: '',
  profits: 0,
};

export const DEFAULT_SALE_ITEM_TRUCKING = {
  product: '',
  type: '',
  amount: 0,
  provider: '',
  subprovider: '',
  profits: 0,
  details: {
    dotNumber: '',
    drivers: [],
    premium: 0,
    vehicles: [],
    vinNumbers: [],
  },
};
