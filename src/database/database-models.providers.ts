import { Connection } from 'mongoose';

import {
  DATABASE_CONNECTION,
  CUSTOMER_MODEL, 
  INSURER_MODEL,
  SALE_MODEL,
  USER_MODEL,
} from './database.constants';
import { Customer, CustomerSchema } from './customer.model';
import { Insurer, InsurerSchema } from './insurer.model';
import { Sale, SaleSchema } from './sale.model';
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
];
