import { Test, TestingModule } from '@nestjs/testing';
import { Observable, of } from 'rxjs';
import { anyNumber, anyString, instance, mock, verify, when } from 'ts-mockito';
import { Customer } from '../database/customer.model';
import { CreateCustomerDto } from './create-customer.dto';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CustomerServiceStub } from './customer.service.stub';
import { UpdateCustomerDto } from './update-customer.dto';
import { createMock } from '@golevelup/ts-jest';
import { Response } from 'express';

describe('Customer Controller', () => {
  describe('Replace CustomerService in provider(useClass: CustomerServiceStub)', () => {
    let controller: CustomerController;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: CustomerService,
            useClass: CustomerServiceStub,
          },
        ],
        controllers: [CustomerController],
      }).compile();

      controller = await module.resolve<CustomerController>(CustomerController);
    });

    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('GET on /customers should return all customers', async () => {
      const customers = await controller.getAllCustomers().toPromise();
      expect(customers.length).toBe(3);
    });

    it('GET on /customers/:id should return one customer ', (done) => {
      controller.getCustomerById('1').subscribe((data) => {
        expect(data._id).toEqual('1');
        done();
      });
    });

    it('POST on /customers should save customer', async () => {
      const customer: CreateCustomerDto = {
        isCompany: true,
        name: 'TestSoft',
        email: 'test@example.com',
        phone: '832-111-1111',
      };
      const saved = await controller
        .createCustomer(
          customer,
          createMock<Response>({
            location: jest.fn().mockReturnValue({
              status: jest.fn().mockReturnValue({
                send: jest.fn().mockReturnValue({
                  headers: { location: '/customers/customer_id' },
                  status: 201,
                }),
              }),
            }),
          }),
        )
        .toPromise();
      // console.log(saved);
      expect(saved.status).toBe(201);
    });

    it('PUT on /customers/:id should update the existing customer', (done) => {
      const customer: UpdateCustomerDto = {
        firstName: 'Test',
        lastName: 'Test',
        name: 'TestSoft',
        email: 'test@example.com',
        phone: '832-111-1111',
      };
      controller
        .updateCustomer(
          '1',
          customer,
          createMock<Response>({
            status: jest.fn().mockReturnValue({
              send: jest.fn().mockReturnValue({
                status: 204,
              }),
            }),
          }),
        )
        .subscribe((data) => {
          expect(data.status).toBe(204);
          done();
        });
    });

    it('DELETE on /customers/:id should delete customer', (done) => {
      controller
        .deleteCustomerById(
          '1',
          createMock<Response>({
            status: jest.fn().mockReturnValue({
              send: jest.fn().mockReturnValue({
                status: 204,
              }),
            }),
          }),
        )
        .subscribe((data) => {
          expect(data).toBeTruthy();
          done();
        });
    });
  });

  describe('Replace CustomerService in provider(useValue: fake object)', () => {
    let controller: CustomerController;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: CustomerService,
            useValue: {
              findAll: (_keyword?: string, _skip?: number, _limit?: number) =>
                of<any[]>([
                  {
                    _id: 'testid',
                    title: 'test title',
                    content: 'test content',
                  },
                ]),
            },
          },
        ],
        controllers: [CustomerController],
      }).compile();

      controller = await module.resolve<CustomerController>(CustomerController);
    });

    it('should get all customers(useValue: fake object)', async () => {
      const result = await controller.getAllCustomers().toPromise();
      expect(result[0]._id).toEqual('testid');
    });
  });

  describe('Replace CustomerService in provider(useValue: jest mocked object)', () => {
    let controller: CustomerController;
    let customerService: CustomerService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: CustomerService,
            useValue: {
              constructor: jest.fn(),
              findAll: jest
                .fn()
                .mockImplementation(
                  (_keyword?: string, _skip?: number, _limit?: number) =>
                    of<any[]>([
                      {
                        _id: 'testid',
                        title: 'test title',
                        content: 'test content',
                      },
                    ]),
                ),
            },
          },
        ],
        controllers: [CustomerController],
      }).compile();

      controller = await module.resolve<CustomerController>(CustomerController);
      customerService = module.get<CustomerService>(CustomerService);
    });

    it('should get all customers(useValue: jest mocking)', async () => {
      const result = await controller.getAllCustomers('test', 10, 0).toPromise();
      expect(result[0]._id).toEqual('testid');
      expect(customerService.findAll).toBeCalled();
      expect(customerService.findAll).lastCalledWith('test', 0, 10);
    });
  });

  describe('Mocking CustomerService using ts-mockito', () => {
    let controller: CustomerController;
    const mockedCustomerService: CustomerService = mock(CustomerService);

    beforeEach(async () => {
      controller = new CustomerController(instance(mockedCustomerService));
    });

    it('should get all customers(ts-mockito)', async () => {
      when(
        mockedCustomerService.findAll(anyString(), anyNumber(), anyNumber()),
      ).thenReturn(
        of([
          {
            _id: 'testid', 
            firstName: 'Test',
            lastName: 'Test',
            name: 'TestSoft',
            email: 'test@example.com',
            phone: '832-111-1111',
          },
        ]) as Observable<Customer[]>,
      );
      const result = await controller.getAllCustomers('', 10, 0).toPromise();
      expect(result.length).toEqual(1);
      expect(result[0].firstName).toBe('Test');
      verify(
        mockedCustomerService.findAll(anyString(), anyNumber(), anyNumber()),
      ).once();
    });
  });
});
