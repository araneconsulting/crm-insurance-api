import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
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
import { databaseModelsProviders } from './database-models.providers';
import { Company } from './company.model';
import { Customer } from './customer.model';
import { Employee } from './employee.model';
import { Insurer } from './insurer.model';
import { Location } from './location.model';
import { Payroll } from './payroll.model';
import { Sale } from './sale.model';
import { User } from './user.model';


describe('DatabaseModelsProviders', () => {
  let conn: any;
  let userModel: any;
  let customerModel: any;
  let insurerModel: any;
  let saleModel: any;
  let companyModel: any;
  let payrollModel: any;
  let employeeModel: any;
  let locationModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [...databaseModelsProviders,

      {
        provide: DATABASE_CONNECTION,
        useValue: {
          model: jest.fn().mockReturnValue({} as Model<User | Customer | Insurer | Sale | Company | Location | Employee | Payroll>),
        },
      },
      ],

    })
      .compile();

    conn = module.get<Connection>(DATABASE_CONNECTION);
    companyModel = module.get<Model<Company>>(COMPANY_MODEL);
    customerModel = module.get<Model<Customer>>(CUSTOMER_MODEL);
    employeeModel = module.get<Model<Employee>>(EMPLOYEE_MODEL);
    insurerModel = module.get<Model<Insurer>>(INSURER_MODEL);
    locationModel = module.get<Model<Location>>(LOCATION_MODEL);
    payrollModel = module.get<Model<Payroll>>(PAYROLL_MODEL);
    saleModel = module.get<Model<Sale>>(SALE_MODEL);
    userModel = module.get<Model<User>>(USER_MODEL);
  });

  it('DATABASE_CONNECTION should be defined', () => {
    expect(conn).toBeDefined();
  });

  it('USER_MODEL should be defined', () => {
    expect(userModel).toBeDefined();
  });

  it('CUSTOMER_MODEL should be defined', () => {
    expect(customerModel).toBeDefined();
  });

  it('INSURER_MODEL should be defined', () => {
    expect(insurerModel).toBeDefined();
  });

  it('SALE_MODEL should be defined', () => {
    expect(saleModel).toBeDefined();
  });
  it('COMPANY_MODEL should be defined', () => {
    expect(companyModel).toBeDefined();
  });
  it('LOCATION_MODEL should be defined', () => {
    expect(locationModel).toBeDefined();
  });
  it('EMPLOYEE_MODEL should be defined', () => {
    expect(employeeModel).toBeDefined();
  });
  it('PAYROLL_MODEL should be defined', () => {
    expect(payrollModel).toBeDefined();
  });
});
