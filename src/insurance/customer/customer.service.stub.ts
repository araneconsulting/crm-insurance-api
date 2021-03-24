import { of, Observable } from 'rxjs';
import { CreateCustomerDto } from './create-customer.dto';
import { UpdateCustomerDto } from './update-customer.dto';
import { CustomerService } from './customer.service';
import { Customer } from '../../database/customer.model';
import { Comment } from '../../database/comment.model';

// To unite the method signature of the mocked CustomerServiceStub and CustomerService,
// use `Pick<T, key of T>` instead of writing an extra interface.
// see: https://dev.to/jonrimmer/typesafe-mocking-in-typescript-3b50
// also see: https://www.typescriptlang.org/docs/handbook/utility-types.html#picktk
export class CustomerServiceStub implements Pick<CustomerService, keyof CustomerService> {
  private customers: Customer[] = [
    {
      _id: '5ee49c3115a4e75254bb732e',
      name: 'FutureSoft',
      email: 'aliesky@example.com',
      phone: '832-555-5555',
    } as Customer,
    {
      _id: '5ee49c3115a4e75254bb732f',
      name: 'World Records',
      email: 'ernesto@example.com',
      phone: '832-111-3333',
    } as Customer,
    {
      _id: '5ee49c3115a4e75254bb7330',
      name: 'TED SuperStars',
      email: 'ernesto@example.com',
      phone: '832-222-8888',
    } as Customer,
  ];

  findAll(): Observable<Customer[]> {
    return of(this.customers);
  }

  findById(id: string): Observable<Customer> {
    const { name, company, email, phone, fax, address, city, state, country, zip, dot } = this.customers[0];
    return of({ _id: id, name, company, email, phone, fax, address, city, state, country, zip, dot } as Customer);
  }

  save(data: CreateCustomerDto): Observable<Customer> {
    return of({ _id: this.customers[0]._id, ...data } as Customer);
  }

  update(id: string, data: UpdateCustomerDto): Observable<Customer> {
    return of({ _id: id, ...data } as Customer);
  }

  deleteById(id: string): Observable<Customer> {
    return of({
      name: 'TED SuperStars',
      email: 'ernesto@example.com',
      phone: '832-222-8888',
    } as Customer);
  }

  deleteAll(): Observable<any> {
    throw new Error('Method not implemented.');
  }
}
