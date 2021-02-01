import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { Comment } from './comment.model';
import {
  DATABASE_CONNECTION,
  USER_MODEL,
  CUSTOMER_MODEL,
  SALE_MODEL,
  INSURER_MODEL,
} from './database.constants';
import { databaseModelsProviders } from './database-models.providers';
import { User } from './user.model';
import { Customer } from './customer.model';
import { Insurer } from './insurer.model';
import { Sale } from './sale.model';


describe('DatabaseModelsProviders', () => {
  let conn: any;
  let userModel: any;
  let customerModel: any;
  let insurerModel: any;
  let saleModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [...databaseModelsProviders,

      {
        provide: DATABASE_CONNECTION,
        useValue: {
          model: jest.fn().mockReturnValue({} as Model<User | Customer | Insurer | Sale>),
        },
      },
      ],

    })
      .compile();

    conn = module.get<Connection>(DATABASE_CONNECTION);
    userModel = module.get<Model<User>>(USER_MODEL);
    customerModel = module.get<Model<Customer>>(CUSTOMER_MODEL);
    insurerModel = module.get<Model<Insurer>>(INSURER_MODEL);
    saleModel = module.get<Model<Sale>>(SALE_MODEL);
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
    expect(insurerModel).toBeDefined();
  });
});
