import { of, Observable } from 'rxjs';
import { DashboardService } from './dashboard.service';

// To unite the method signature of the mocked DashboardServiceStub and DashboardService,
// use `Pick<T, key of T>` instead of writing an extra interface.
// see: https://dev.to/jonrimmer/typesafe-mocking-in-typescript-3b50
// also see: https://www.typescriptlang.org/docs/handbook/utility-types.html#picktk
export class DashboardServiceStub implements Pick<DashboardService, keyof DashboardService> {

  getSalesMetrics(): Observable<any[]> {
    return of();
  }

}
