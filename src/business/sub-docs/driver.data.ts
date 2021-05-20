export class DriverData {
  firstName: string;
  lastName: string;
  gender: string;
  maritalStatus: string;
  ssn: string;
  currentInsurance: string;
  currentInsuranceYear: number;
  currentInsuranceLiability: string;
  ageWhenDriverLicense: number;
  educationLevel: string;
  affiliations: string[];
  employmentStatus: string; //Employeed, Unemployeed, Self-employee
  employmentType: string;
  organizations: string[];
}

export const DEFAULT_DRIVER_DATA = {
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
