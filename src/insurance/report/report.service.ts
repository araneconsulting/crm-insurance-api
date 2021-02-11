import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Customer } from 'database/customer.model';
import { Insurer } from 'database/insurer.model';
import { Sale } from 'database/sale.model';
import { User } from 'database/user.model';
import { Model } from 'mongoose';
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

  async salesReport(dateRangeCode: string="MTD") {

    const dates: string[] = DateFactory.dateRangeByName(dateRangeCode);

    console.log("Fecha 1:"+dates[0]);
    console.log("Fecha 2:"+dates[1]);

    return this.saleModel.aggregate([
      {
        "$match":
        {
          //"soldAt": { "$gte": dates[0], "$lte": dates[1] }
        }
      },
      { "$unwind": "$seller" },
      {
        "$lookup": {
          "from": "users", // <-- collection to join
          "localField": "seller",
          "foreignField": "_id",
          "as": "seller_joined"
        }
      },
      { "$unwind": "$seller_joined" },

      { "$unwind": "$cargoInsurer" },
      {
        "$lookup": {
          "from": "insurer", // <-- collection to join
          "localField": "cargoInsurer",
          "foreignField": "_id",
          "as": "cargoInsurer_joined"
        }
      },
      { "$unwind": "$cargoInsurer_joined" },

      {
        "$group": {
          "_id": {
            "id": "$seller.id",
            "firstName": "$seller_joined.firstName",
            "lastName": "$seller_joined.lastName",
          },

          "liabilityCharge": { "$sum": "$liabilityCharge" },
          "cargoCharge": { "$sum": "$cargoCharge" },
          "physicalDamageCharge": { "$sum": "$physicalDamageCharge" },
          "wcGlUmbCharge": { "$sum": "$wcGlUmbCharge" },
          "tips": { "$sum": "$tips" },
          "permits": { "$sum": "$permits" },
          "fees": { "$sum": "$fees" },
          "sellerBonus": { "$sum": "$sellerBonus" },

          "totalCharge": { "$sum": "$totalCharge" },
          "netProfit": { "$sum": "$netProfit" },
          "grossProfit": { "$sum": "$grossProfit" },
          "amountReceivable": { "$sum": "$amountReceivable" },
          "sales": { "$sum": 1 }
        },
      },

      /* {
        "$addFields": {
          "netProfit": { "$multiply": ["$cargoCharge", "$cargoInsurer_joined.cargoCommission"] },
        }
      } */
    ]);
  }


}
