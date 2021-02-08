import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Customer } from 'database/customer.model';
import { Insurer } from 'database/insurer.model';
import { Sale } from 'database/sale.model';
import { User } from 'database/user.model';
import { Model } from 'mongoose';
import { from, Observable } from 'rxjs';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';
import { CUSTOMER_MODEL, INSURER_MODEL, SALE_MODEL, USER_MODEL } from '../../database/database.constants';
import * as DateFactory from 'shared/util/date-factory';


@Injectable({ scope: Scope.REQUEST })
export class ReportService {
  constructor(
    @Inject(INSURER_MODEL) private reportModel: Model<Insurer>,
    @Inject(CUSTOMER_MODEL) private customerModel: Model<Customer>,
    @Inject(USER_MODEL) private insurerModel: Model<User>,
    @Inject(SALE_MODEL) private saleModel: Model<Sale>,
    @Inject(REQUEST) private req: AuthenticatedRequest,
  ) { }

  salesReport(dateRangeCode?:string, keyword?: string, skip = 0, limit = 10): Observable<Sale[]> {
    const dates: string[] = DateFactory.dateRangeByName(dateRangeCode);
    
    if (dateRangeCode) {
      return from(
        this.saleModel
          .find({
            soldAt: {
              $gte: dates[0],
              $lte: dates[1],
            }
          })
          .populate('customer')
          .populate('seller')
          .populate("liabilityInsurer")
          .populate("cargoInsurer")
          .populate("physicalDamageInsurer")
          .populate("wcGlUmbInsurer")
          .skip(skip)
          .limit(limit)
          .exec(),
      );
    } else {
      return from(this.saleModel.find({}).skip(skip).limit(limit).exec());
    }
  }

  
}
