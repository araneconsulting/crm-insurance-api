export class VehicleData {
  make: string;
  type: string;
  model: string;
  year: string;
  trim: string;
  color: string;
  condition: string;
  ownershipStatus: string; //Owned, Financed, Leased
  primaryUse: string; //Commuting, Pleasure, Business
  drivingDaysPerWeek: number;
  drivingMilesPerWeek: number;
  annualMileage: number;
}

export const DEFAULT_VEHICLE_DATA = {
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
