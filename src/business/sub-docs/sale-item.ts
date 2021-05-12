import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
} from 'class-validator';

export class SaleItem extends Map<any, any> {
  @IsNotEmpty()
  readonly product: string;
  //can be: Liability Insurance, Cargo Damage Insurance, WCGLUMB Insurance, Physical Damage Insurance, Vehicle Insurance, Homeowner Insurance, Auto Insurance
  
  @IsNotEmpty()
  readonly type: string; //can be: Individual, Commercial

  @IsNumber()
  readonly amount: string;

  @IsNotEmpty()
  readonly provider: string; //Provider (Insurer) ID

  @IsOptional()
  readonly subprovider: string; //Broker subprovider name (ej: Progressive)

  @IsNumber()
  readonly profit: string; //Auto calculated (commission % of amount)

  @IsOptional()
  @IsObject()
  readonly details: Map<string, any>;
}

export const VehicleData = {
  make: '',
  type: '',
  model: '',
  year: '',
  trim: '',
  color: '',
  condition: '',
  ownershipStatus: '', //Owned, Financed, Leased
  primaryUse: '', //Commuting, Pleasure, Business
  drivingDaysPerWeek: 0,
  drivingMilesPerWeek: 0,
  annualMileage: 0,
};

export const DriverData = {
  firstName: '',
  lastName: '',
  gender: '',
  maritalStatus: '',
  ssn: '',
  currentInsurance: '',
  currentInsuranceYear: 0,
  currentInsuranceLiability: '',
  ageWhenDriverLicense: 0,
  educationLevel: '',
  affiliations: [],
  employmentStatus: '', //Employeed, Unemployeed, Self-employee
  employmentType: '',
  organizations: [],
};

export const TruckingDetails = {
  dotNumber: '',
  drivers: [],
  premium: 0,
  vehicles: [], //VehicleData objects
  vinNumbers: [],
};

export const DEFAULT_SALE_ITEM = {
  name: '',
  type: '',
  amount: 0,
  provider: '',
  subprovider: '',
  profit: 0,
};

export const DEFAULT_SALE_ITEM_TRUCKING = {
  product: '',
  type: '',
  amount: 0,
  provider: '',
  subprovider: '',
  profit: 0,
  details: {
    dotNumber: '',
    drivers: [],
    premium: 0,
    vehicles: [],
    vinNumbers: [],
  },
};
