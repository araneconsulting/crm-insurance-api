import { of, Observable } from 'rxjs';
import { CreateSaleDto } from './create-sale.dto';
import { UpdateSaleDto } from './update-sale.dto';
import { SaleService } from './sale.service';
import { Sale } from '../../database/sale.model';

// To unite the method signature of the mocked SaleServiceStub and SaleService,
// use `Pick<T, key of T>` instead of writing an extra interface.
// see: https://dev.to/jonrimmer/typesafe-mocking-in-typescript-3b50
// also see: https://www.typescriptlang.org/docs/handbook/utility-types.html#picktk
export class SaleServiceStub implements Pick<SaleService, keyof SaleService> {
  private sales: Sale[] = [
    {
      _id: '5ee49c3115a4e75254bb732e',
      soldAt: "01-30-2021",
      customer: {_id: 'dummyId',},
      seller: {_id: 'dummyId',},
      liabilityInsurer: {_id: 'dummyId',},
      liabilityCharge: 3000.50,
      cargoInsurer: {_id: 'dummyId',},
      cargoCharge: 500.50,
      physicalDamageInsurer: {_id: 'dummyId',},
      physicalDamageCharge: 100.00,
      wcGlUmbInsurer: {_id: 'dummyId',},
      wcGlUmbCharge: 200.00,
      fees: 500,
      permits: 150,
      tips: 30,
      chargesPaid: 1130.00,
    } as Sale,
    {

      _id: '5ee49c3115a4e75254bb732f',
      soldAt: "01-30-2021",
      customer: {_id: 'dummyId',},
      seller: {_id: 'dummyId',},
      liabilityInsurer: {_id: 'dummyId',},
      liabilityCharge: 3000.50,
      cargoInsurer: {_id: 'dummyId',},
      cargoCharge: 500.50,
      physicalDamageInsurer: {_id: 'dummyId',},
      physicalDamageCharge: 100.00,
      wcGlUmbInsurer: {_id: 'dummyId',},
      wcGlUmbCharge: 200.00,
      fees: 500,
      permits: 150,
      tips: 30,
      chargesPaid: 1130.00,
    } as Sale,
    {
      _id: '5ee49c3115a4e75254bb7330',
      soldAt: "01-30-2021",
      customer: {_id: 'dummyId',},
      seller: {_id: 'dummyId',},
      liabilityInsurer: {_id: 'dummyId',},
      liabilityCharge: 3000.50,
      cargoInsurer: {_id: 'dummyId',},
      cargoCharge: 500.50,
      physicalDamageInsurer: {_id: 'dummyId',},
      physicalDamageCharge: 100.00,
      wcGlUmbInsurer: {_id: 'dummyId',},
      wcGlUmbCharge: 200.00,
      fees: 500,
      permits: 150,
      tips: 30,
      chargesPaid: 1130.00
    } as Sale,
  ];

  findAll(): Observable<Sale[]> {
    return of(this.sales);
  }

  findById(id: string): Observable<Sale> {
    const { soldAt, customer, seller, liabilityInsurer, liabilityCharge, cargoInsurer, cargoCharge, physicalDamageInsurer, physicalDamageCharge, wcGlUmbInsurer, wcGlUmbCharge, fees, permits, tips, chargesPaid } = this.sales[0];
    return of({ _id: id, soldAt, customer, seller, liabilityInsurer, liabilityCharge, cargoInsurer, cargoCharge, physicalDamageInsurer, physicalDamageCharge, wcGlUmbInsurer, wcGlUmbCharge, fees, permits, tips, chargesPaid  } as Sale);
  }

  save(data: CreateSaleDto): Observable<Sale> {
    return of({ _id: this.sales[0]._id, ...data } as Sale);
  }

  update(id: string, data: UpdateSaleDto): Observable<Sale> {
    return of({ _id: id, ...data } as Sale);
  }

  deleteById(id: string): Observable<Sale> {
    return of({
      _id: id, 
      soldAt: "01-30-2021",
      customer: {_id: 'dummyId',},
      seller: {_id: 'dummyId',},
      liabilityInsurer: {_id: 'dummyId',},
      liabilityCharge: 3000.50,
      cargoInsurer: {_id: 'dummyId',},
      cargoCharge: 500.50,
      physicalDamageInsurer: {_id: 'dummyId',},
      physicalDamageCharge: 100.00,
      wcGlUmbInsurer: {_id: 'dummyId',},
      wcGlUmbCharge: 200.00,
      fees: 500,
      permits: 150,
      tips: 30,
      chargesPaid: 1130.00
    } as Sale);
  }

  deleteAll(): Observable<any> {
    throw new Error('Method not implemented.');
  }
}




