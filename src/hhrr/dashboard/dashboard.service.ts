import {
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { Company } from 'database/company.model';
import { User } from 'database/user.model';
import { Model } from 'mongoose';
import { getModifiersByGroupingCriteria, getDateMatchExpressionByDates } from 'shared/util/aggregator-functions';
import {
  COMPANY_MODEL,
} from '../../database/database.constants';

@Injectable({ scope: Scope.REQUEST })
export class DashboardService {
  constructor(@Inject(COMPANY_MODEL) private companyModel: Model<Company>) {}

  /* async getCompanyDatasets(
    dataCriteria: string,
    groupingCriteria: string,
    aggregation: string,
    user: Partial<User>,
    startDate?: string,
    endDate?: string,
    location?: string,
  ): Promise<any> {
    const filterConditions = {
      soldAt: getDateMatchExpressionByDates(startDate, endDate),
    };

    if (location) {
      filterConditions['location'] = location;
    }

    const query = this.saleModel.aggregate();

    const modifiers = getModifiersByGroupingCriteria(groupingCriteria);

    query
      .unwind({ path: '$seller', preserveNullAndEmptyArrays: true })
      .lookup({
        from: 'users',
        localField: 'seller',
        foreignField: '_id',
        as: 'seller',
      })
      .unwind({ path: '$seller', preserveNullAndEmptyArrays: true });

    query.match(filterConditions);

    const groupExpression = {
      _id: modifiers.groupId,
    };

    switch (aggregation) {
      case 'count':
        groupExpression['data'] = { $sum: 1 };
        break;
      case 'sum':
        switch (dataCriteria) {
          case 'premium':
            groupExpression['data'] = { $sum: '$premium' };
            break;
          case 'totalCharge':
            groupExpression['data'] = { $sum: '$totalCharge' };
            break;
          case 'chargesPaid':
            groupExpression['data'] = { $sum: '$chargesPaid' };
            break;
          case 'tips':
            groupExpression['data'] = { $sum: '$tips' };
            break;
          case 'amountReceivable':
            groupExpression['data'] = { $sum: '$amountReceivable' };
            break;
        }
        break;
    }

    query.group(groupExpression);

    return query;
  } */
}
