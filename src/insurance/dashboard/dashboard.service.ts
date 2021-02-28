import { ConflictException, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { Customer } from 'database/customer.model';
import { Sale } from 'database/sale.model';
import { User } from 'database/user.model';
import { Model, Types } from 'mongoose';
import { SALE_MODEL, USER_MODEL, CUSTOMER_MODEL } from '../../database/database.constants';
import * as DateFactory from 'shared/util/date-factory';
import { GroupingCriteria } from 'shared/enum/grouping-criteria';

import * as ProjectConstants from 'shared/const/project-constants';


@Injectable({ scope: Scope.REQUEST })
export class DashboardService {

  constructor(
    @Inject(SALE_MODEL) private saleModel: Model<Sale>
  ) { }

  async getSalesBy(dataCriteria: string, groupingCriteria: string, aggregation: string, user: Partial<User>, startDate?: string, endDate?: string, location?: string): Promise<any> {

    const filterConditions = {
      "soldAt": this.getDateMatchExpressionByDates(startDate, endDate)
    };

    if (location) {
      filterConditions["seller.location"] = location;
    }

    const query = this.saleModel.aggregate();

    const modifiers = this.getModifiersByGroupingCriteria(groupingCriteria);

    query
      .unwind({ "path": "$seller", "preserveNullAndEmptyArrays": true })
      .lookup({
        "from": "users",
        "localField": "seller",
        "foreignField": "_id",
        "as": "seller"
      })
      .unwind({ "path": "$seller", "preserveNullAndEmptyArrays": true })

    if (location) {
      query.match(filterConditions);
    }

    const groupExpression = {
      "_id": modifiers.groupId
    }

    switch (aggregation) {
      case "count":
        groupExpression["data"] = { "$sum": 1 }
        break;
      case "sum":
        switch (dataCriteria) {
          case "downPayment":
            groupExpression["data"] = { "$sum": "$downPayment" };
            break;
          case "premium":
            groupExpression["data"] = { "$sum": { "$sum": ["$liabilityCharge", "$cargoCharge", "$physicalDamageCharge", "$wcGlUmbCharge"] } };
            break;
          case "chargesPaid":
            groupExpression["data"] = { "$sum": "$chargesPaid" };
            break;
          case "tips":
            groupExpression["data"] = { "$sum": "$tips" };
            break;
          case "amountReceivable":
            groupExpression["data"] = { "$sum": "$amountReceivable" };
            break;
          case "totalCharge":
            groupExpression["data"] = { "$sum": { "$sum": ["$liabilityCharge", "$cargoCharge", "$physicalDamageCharge", "$wcGlUmbCharge", "$fees", "$permits", "$tips"] } };
            break;
        }
        break;
    }

    query
      .group(groupExpression);

    return query;
  }

  getDateMatchExpressionByDates(startDate?: string, endDate?: string): any {
    if (startDate && endDate) {
      return { $gte: new Date(startDate + ProjectConstants.startOfDayTime), $lte: new Date(endDate + ProjectConstants.endOfDayTime) }
    } else if (startDate) {
      return { $gte: new Date(startDate + ProjectConstants.startOfDayTime) }
    } else if (endDate) {
      return { $lte: new Date(endDate + ProjectConstants.endOfDayTime) }
    } else return { $lte: new Date() };
  }


  getModifiersByGroupingCriteria(groupingCriteria: string): any {

    switch (groupingCriteria) {
      case GroupingCriteria.BY_SELLER:
        return {
          "groupId": {
            "id": "$seller._id",
            'label': { "$concat": ["$seller.firstName", " ", "$seller.lastName"] },
          }
        }
      case GroupingCriteria.BY_LOCATION:
        return {
          "groupId": {
            'label': "$seller.location",
          }
        }
      case GroupingCriteria.BY_YEAR:
        return {
          "groupId": {
            "label": { $year: "$soldAt" },
          }
        }
      case GroupingCriteria.BY_MONTH:
        return {
          "groupId": {
            "label": { $month: "$soldAt" },
          }
        }
      case GroupingCriteria.BY_DAY:
        return {
          "groupId": {
            "label": { $dayOfMonth: "$soldAt" },
          }
        }
    }

  }


}


