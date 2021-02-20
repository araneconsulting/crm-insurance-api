import { of, Observable } from 'rxjs';
import { ReportService } from './report.service';

// To unite the method signature of the mocked ReportServiceStub and ReportService,
// use `Pick<T, key of T>` instead of writing an extra interface.
// see: https://dev.to/jonrimmer/typesafe-mocking-in-typescript-3b50
// also see: https://www.typescriptlang.org/docs/handbook/utility-types.html#picktk
export class ReportServiceStub implements Pick<ReportService, keyof ReportService> {

  getSalesMetrics(): Observable<any[]> {
    return of();
  }

}
