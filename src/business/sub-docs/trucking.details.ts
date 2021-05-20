import { DriverData } from "./driver.data";
import { VehicleData } from "./vehicle.data";

export class TruckingDetails {
    dotNumber: string;
    drivers: DriverData[];
    premium: number;
    vehicles: VehicleData[];
    vinNumbers: string[];
  };

export const DEFAULT_TRUCKING_DETAILS = {
    dotNumber: '',
    drivers: [],
    premium: 0,
    vehicles: [], //VehicleData objects
    vinNumbers: [],
  };