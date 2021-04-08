import { Connection } from 'mongoose';

import {
  DATABASE_CONNECTION,
  COMPANY_MODEL,
  CUSTOMER_MODEL,
  EMPLOYEE_MODEL,
  INSURER_MODEL,
  LOCATION_MODEL,
  PAYROLL_MODEL,
  SALE_MODEL,
  USER_MODEL,
} from './database.constants';
import { Company, CompanySchema } from './company.model';
import { Customer, CustomerSchema } from './customer.model';
import { Employee, EmployeeSchema } from './employee.model';
import { Insurer, InsurerSchema } from './insurer.model';
import { Location, LocationSchema } from './location.model';
import { Payroll, PayrollSchema } from './payroll.model';
import { Sale, SaleSchema } from './sale.model';
import { User, UserSchema } from './user.model';

import { userModelFn } from './user.model';

export const databaseModelsProviders = [
  {
    provide: CUSTOMER_MODEL,
    useFactory: (connection: Connection) =>
      connection.model<Customer>('Customer', CustomerSchema, 'customers'),
    inject: [DATABASE_CONNECTION],
  },
  {
    provide: INSURER_MODEL,
    useFactory: (connection: Connection) =>
      connection.model<Insurer>('Insurer', InsurerSchema, 'insurers'),
    inject: [DATABASE_CONNECTION],
  },
  {
    provide: SALE_MODEL,
    useFactory: (connection: Connection) =>
      connection.model<Sale>('Sale', SaleSchema, 'sales'),
    inject: [DATABASE_CONNECTION],
  },
  {
    provide: USER_MODEL,
    useFactory: (connection: Connection) => userModelFn(connection),
    inject: [DATABASE_CONNECTION],
  },
  {
    provide: COMPANY_MODEL,
    useFactory: (connection: Connection) =>
      connection.model<Sale>('Company', CompanySchema, 'companies'),
    inject: [DATABASE_CONNECTION],
  },
  {
    provide: LOCATION_MODEL,
    useFactory: (connection: Connection) =>
      connection.model<Location>('Location', LocationSchema, 'locations'),
    inject: [DATABASE_CONNECTION],
  },
  {
    provide: EMPLOYEE_MODEL,
    useFactory: (connection: Connection) =>
      connection.model<Employee>('Employee', EmployeeSchema, 'employees'),
    inject: [DATABASE_CONNECTION],
  },
  {
    provide: PAYROLL_MODEL,
    useFactory: (connection: Connection) =>
      connection.model<Payroll>('Payroll', PayrollSchema, 'payrolls'),
    inject: [DATABASE_CONNECTION],
  },
];
