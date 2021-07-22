import { DriverData } from "./driver.data";
import { VehicleData } from "./vehicle.data";

export class TruckingDetails {
    dotNumber: string;
    drivers: DriverData[];
    vehicles: VehicleData[];
    vinNumbers: string[];
  };

export const DEFAULT_TRUCKING_DETAILS = {
    dotNumber: '',
    drivers: [],
    vehicles: [], //VehicleData objects
    vinNumbers: [],
  };