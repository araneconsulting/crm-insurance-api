import { of, Observable } from 'rxjs';
import { CreateInsurerDto } from './create-insurer.dto';
import { UpdateInsurerDto } from './update-insurer.dto';
import { InsurerService } from './insurer.service';
import { Insurer } from '../../database/insurer.model';

// To unite the method signature of the mocked InsurerServiceStub and InsurerService,
// use `Pick<T, key of T>` instead of writing an extra interface.
// see: https://dev.to/jonrimmer/typesafe-mocking-in-typescript-3b50
// also see: https://www.typescriptlang.org/docs/handbook/utility-types.html#picktk
export class InsurerServiceStub implements Pick<InsurerService, keyof InsurerService> {
  private insurers: Insurer[] = [
    {
      _id: '5ee49c3115a4e75254bb732e',
      liabilityCommission: 10,
      cargoCommission: 10,
      physicalDamageCommission: 8,
      wcGlUmbCommission: 10,
      name: 'FutureSoft',
      email: 'aliesky@example.com',
      phone: '832-555-5555',
    } as Insurer,
    {

      _id: '5ee49c3115a4e75254bb732f',
      liabilityCommission: 10,
      cargoCommission: 10,
      physicalDamageCommission: 8,
      wcGlUmbCommission: 10,
      name: 'World Records',
      email: 'ernesto@example.com',
      phone: '832-111-3333',
    } as Insurer,
    {
      _id: '5ee49c3115a4e75254bb7330',
      liabilityCommission: 10,
      cargoCommission: 10,
      physicalDamageCommission: 8,
      wcGlUmbCommission: 10,
      name: 'TED SuperStars',
      email: 'ernesto@example.com',
      phone: '832-222-8888',
    } as Insurer,
  ];

  findAll(): Observable<Insurer[]> {
    return of(this.insurers);
  }

  findById(id: string): Observable<Insurer> {
    const { name, email, phone, liabilityCommission, cargoCommission, physicalDamageCommission, wcGlUmbCommission} = this.insurers[0];
    return of({ _id: id, name, email, phone, liabilityCommission, cargoCommission, physicalDamageCommission, wcGlUmbCommission } as Insurer);
  }

  save(data: CreateInsurerDto): Observable<Insurer> {
    return of({ _id: this.insurers[0]._id, ...data } as Insurer);
  }

  update(id: string, data: UpdateInsurerDto): Observable<Insurer> {
    return of({ _id: id, ...data } as Insurer);
  }

  deleteById(id: string): Observable<Insurer> {
    return of({
      _id: id, 
      liabilityCommission: 10,
      cargoCommission: 10,
      physicalDamageCommission: 8,
      wcGlUmbCommission: 10,
      name: 'TED SuperStars',
      email: 'ernesto@example.com',
      phone: '832-222-8888',
    } as Insurer);
  }

  deleteAll(): Observable<any> {
    throw new Error('Method not implemented.');
  }
}
