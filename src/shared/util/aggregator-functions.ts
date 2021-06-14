import * as moment from 'moment';
import { GroupingCriteria } from 'shared/enum/grouping-criteria';

export function getDateMatchExpressionByDates(
  startDate?: Date,
  endDate?: Date,
): any {

  if (startDate && endDate) {
    return {
      $gte: new Date(moment(startDate).startOf('day').toISOString()),
      $lte: new Date(moment(endDate).endOf('day').toISOString()),
    };
  } else if (startDate) {
    return {
      $gte: new Date(moment(startDate).startOf('day').toISOString()),
    };
  } else if (endDate) {
    return {
      $lte: new Date(moment(endDate).endOf('day').toISOString()),
    };
  } else
    return {
      $lte: new Date(moment().endOf('day').toISOString()),
    };
}

export function getModifiersByGroupingCriteria(groupingCriteria: string): any {
  switch (groupingCriteria) {
    case GroupingCriteria.SELLER:
      return {
        groupId: {
          id: '$seller._id',
          label: { $concat: ['$seller.firstName', ' ', '$seller.lastName'] },
        },
      };
    case GroupingCriteria.LOCATION:
      return {
        groupId: {
          label: '$location',
        },
      };
    case GroupingCriteria.YEAR:
      return {
        groupId: {
          label: { $year: '$soldAt' },
        },
      };
    case GroupingCriteria.MONTH:
      return {
        groupId: {
          label: { $month: '$soldAt' },
        },
      };
    case GroupingCriteria.DAY:
      return {
        groupId: {
          label: { $dayOfMonth: '$soldAt' },
        },
      };
  }
}
