import { ConflictException } from '@nestjs/common';
import { SaleItem } from 'business/sub-docs/sale-item';
import { TruckingDetails } from 'business/sub-docs/trucking.details';
import { Insurer } from 'database/insurer.model';
import { roundAmount } from 'shared/util/math-functions';
import { SaleDto } from './dto/sale.dto';
import * as DateFactory from 'shared/util/date-functions';
import { Aggregate, Number, Types } from 'mongoose';

const PERMIT_COMMISION_PERCENT = 0.2;
const FEE_COMMISION_PERCENT = 0.2;
export async function setSaleCalculations(
  saleDto: Partial<SaleDto>,
  brokers: Insurer[],
): Promise<Partial<SaleDto>> {
  let sale: Partial<SaleDto> = { ...saleDto };
  let items: SaleItem[] = sale.items;

  if (items) {
    let premium = 0;
    let totalCharge = 0;
    let downPayment = 0;
    let profits = 0;
    let permits = 0;
    let fees = 0;

    sale.isChargeItemized = true && sale.isChargeItemized;

    if (sale.isChargeItemized) {
      sale.fees = 0;
      sale.permits = 0;
      sale.premium = 0;
      sale.profits = 0;
      sale.downPayment = 0;
      sale.amountReceivable = 0;

      sale.items.map((item: SaleItem) => {
        switch (sale.type) {
          case 'PERMIT':
            permits += item.amount;
            item.profits = PERMIT_COMMISION_PERCENT * item.amount;
            profits += item.profits;
            totalCharge += item.amount;
            break;
          /* case 'FEE':
            fees += item.premium;
            item.profits = (1 - FEE_COMMISION_PERCENT) * item.premium;
            profits += item.profits;
            totalCharge += item.premium;
            break; */
          default:
            downPayment += item.premium || 0;
            premium += item.premium || 0;
            totalCharge += item.amount;

            if (item.broker) {
              //calculate item profits based on broker commissions
              item.profits = calculateProfitByCarrier(
                brokers,
                item.broker,
                item.premium,
                sale.lineOfBusiness,
              );
              profits += item.profits;
            } else if (item.carrier) {
              //calculate item profits based on carrier commissions
              item.profits = calculateProfitByCarrier(
                brokers,
                item.carrier,
                item.premium,
                sale.lineOfBusiness,
              );
              profits += item.profits;
            } else {
              throw new ConflictException(
                `Carrier/MGA at least one of them is required for this product.`,
              );
            }
            break;
        }
      });
    }

    if (sale.isChargeItemized) {
      //Do total calculations for itemized
      sale.permits = roundAmount(permits || 0);
      sale.fees = roundAmount(fees || 0);
      sale.downPayment = roundAmount(downPayment || 0);
      sale.profits = roundAmount(profits || 0);
      sale.totalCharge = roundAmount(totalCharge || 0);
      sale.premium = roundAmount(premium || 0);
    } else {
      //Do total calculations for non itemized
      sale.premium = roundAmount(sale.premium || 0);
      sale.permits = roundAmount(sale.permits || 0);
      sale.fees = roundAmount(sale.fees || 0);
      sale.downPayment = roundAmount(sale.downPayment || 0);

      sale.totalCharge = roundAmount(
        sale.downPayment + sale.permits + sale.fees,
      );

      let insuranceItems = sale.items.filter(
        (item) => item.product !== 'PERMIT' && item.product !== 'FEE',
      );

      let profits = 0;
      if (insuranceItems && sale.type === 'POLICY') {
        //This assumes that on non-itemized policies, there should be only one broker/carrier, to take the commission from it, so we take the first one.

        const insurer = items[0].carrier;

        profits = calculateProfitByCarrier(
          brokers,
          insurer,
          sale.downPayment,
          sale.lineOfBusiness,
        );
      }

      sale.profits = roundAmount(
        (profits || 0) +
          PERMIT_COMMISION_PERCENT * sale.permits +
          (1 - FEE_COMMISION_PERCENT) * sale.fees,
      );
    }

    sale.amountReceivable = roundAmount(
      sale.totalCharge + (sale.tips || 0) - (sale.chargesPaid || 0),
    );
  }
  return sale;
}

/**
 * @param  {string} dateRange
 */
export function getDateMatchExpressionByRange(dateRange: string): any {
  //Set filtering conditions
  const dates = DateFactory.dateRangeByName(dateRange);

  return dateRange
    ? {
        $gte: new Date(dates.start + 'T00:00:00.000Z'),
        $lte: new Date(dates.end + 'T23:59:59.999Z'),
      }
    : { $lte: new Date() };
}

/**
 * @param  {string} startDate?
 * @param  {string} endDate?
 */
export function getDateMatchExpressionByDates(
  startDate?: Date,
  endDate?: Date,
): Object {
  if (startDate && endDate) {
    return {
      $gte: new Date(startDate + 'T00:00:00.000Z'),
      $lte: new Date(endDate + 'T23:59:59.999Z'),
    };
  } else if (startDate) {
    return { $gte: new Date(startDate + 'T00:00:00.000Z') };
  } else if (endDate) {
    return { $lte: new Date(endDate + 'T23:59:59.999Z') };
  } else return { $lte: new Date() };
}

export function calculateProfitByCarrier(
  brokers: Partial<Insurer>[],
  broker: Partial<Insurer>,
  amount: number,
  lineOfBusiness: string,
): number {
  let profits = 0;

  const foundProvider = brokers.find(
    (found) => found && found.id === broker.id,
  );

  let commission = { percent: 0 };
  if (foundProvider) {
    commission = foundProvider.commissions.find(
      (commission) => commission.lineOfBusiness === lineOfBusiness,
    );

    if (commission) {
      profits = roundAmount((commission.percent / 100) * amount);
    } else {
      profits = 0;
    }
  }

  return profits;
}

export function titleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function sanitizeSale(sale: any) {
  if (!sale.financerCompany) {
    delete sale['financerCompany'];
  }

  if (sale.items) {
    sale.items = sale.items.map((item) => {
      if (item.product === 'FEE' || item.product === 'PERMIT') {
        delete item['broker'];
        delete item['carrier'];
      }

      if (!item.broker) {
        delete item['broker'];
      }

      if (!item.carrier) {
        delete item['carrier'];
      }

      return {
        ...item,
      };
    });
  }
}

export function extractParamFilters(queryParams: any): Object {
  const queryFilters = {};
  if (
    queryParams.filter.hasOwnProperty('saleDateFrom') ||
    queryParams.filter.hasOwnProperty('saleDateTo')
  ) {
    queryFilters['saleDateFrom'] = queryParams.filter.saleDateFrom;
    queryFilters['saleDateTo'] = queryParams.filter.saleDateTo;
    delete queryParams.filter['saleDateFrom'];
    delete queryParams.filter['saleDateTo'];
  }

  if (
    queryParams.filter.hasOwnProperty('effectiveDateFrom') ||
    queryParams.filter.hasOwnProperty('effectiveDateTo')
  ) {
    queryFilters['effectiveDateFrom'] = queryParams.filter.effectiveDateFrom;
    queryFilters['effectiveDateTo'] = queryParams.filter.effectiveDateTo;
    delete queryParams.filter['effectiveDateFrom'];
    delete queryParams.filter['effectiveDateTo'];
  }

  if (
    queryParams.filter.hasOwnProperty('expirationDateFrom') ||
    queryParams.filter.hasOwnProperty('expirationDateTo')
  ) {
    queryFilters['expirationDateFrom'] = queryParams.filter.expirationDateFrom;
    queryFilters['expirationDateTo'] = queryParams.filter.expirationDateTo;
    delete queryParams.filter['expirationDateFrom'];
    delete queryParams.filter['expirationDateTo'];
  }

  if (queryParams.filter.hasOwnProperty('lineOfBusiness')) {
    queryFilters['lineOfBusiness'] = queryParams.filter.lineOfBusiness;
    delete queryParams.filter['lineOfBusiness'];
  }

  if (queryParams.filter.hasOwnProperty('type')) {
    queryFilters['type'] = queryParams.filter.type;
    delete queryParams.filter['type'];
  }

  if (queryParams.filter.hasOwnProperty('insured')) {
    queryFilters['insured'] = queryParams.filter.insured;
    delete queryParams.filter['insured'];
  }

  if (queryParams.filter.hasOwnProperty('carrier')) {
    queryFilters['carrier'] = queryParams.filter.carrier;
    delete queryParams.filter['carrier'];
  }

  if (queryParams.filter.hasOwnProperty('broker')) {
    queryFilters['broker'] = queryParams.filter.broker;
    delete queryParams.filter['broker'];
  }

  if (queryParams.filter.hasOwnProperty('status')) {
    queryFilters['status'] = queryParams.filter.status;
    delete queryParams.filter['status'];
  }

  if (queryParams.filter.hasOwnProperty('location')) {
    queryFilters['location'] = queryParams.filter.location;
    delete queryParams.filter['location'];
  }
  return queryFilters;
}

export function unwindReferenceFields(
  query: Aggregate<any[]>,
): Aggregate<any[]> {
  query.unwind({ path: '$seller', preserveNullAndEmptyArrays: true }).lookup({
    from: 'users',
    localField: 'seller',
    foreignField: '_id',
    as: 'seller',
  });
  query.unwind({ path: '$seller', preserveNullAndEmptyArrays: true });

  query.unwind({ path: '$customer', preserveNullAndEmptyArrays: true }).lookup({
    from: 'customers',
    localField: 'customer',
    foreignField: '_id',
    as: 'customer',
  });

  query.unwind({ path: '$customer', preserveNullAndEmptyArrays: true });

  query.unwind({ path: '$location', preserveNullAndEmptyArrays: true }).lookup({
    from: 'locations',
    localField: 'location',
    foreignField: '_id',
    as: 'location',
  });

  query.unwind({ path: '$location', preserveNullAndEmptyArrays: true });

  return query;
}



export function setSortCriteria(queryParams: any) {
  const sortCriteria = {};
  sortCriteria[queryParams.sortField] =
    queryParams.sortOrder === 'desc' ? -1 : 1;
  return sortCriteria;
}

export function buildQueryConditions(queryParams: any, queryFilters: Object) {
  let fixedQueries = [];
  let filterQueries = [];
  let conditions = {};

  conditions = {
    $and: [{ deleted: false }, { renewed: false }],
  };

  if (
    Object.keys(queryFilters).length > 0 ||
    (queryParams.filter && Object.keys(queryParams.filter).length > 0)
  ) {
    setFiltersByParams(conditions, queryFilters);
    setFilterByQueryString(queryParams, filterQueries);
  }

  if (filterQueries.length || fixedQueries.length) {
    conditions['$or'] = [...filterQueries, ...fixedQueries];
  }
  return conditions;
}

export function setFiltersByParams(
  conditions: any,
  queryFilters: Object,
): void {
  if (queryFilters['saleDateFrom'] || queryFilters['saleDateTo']) {
    conditions['$and'].push({
      soldAt: getDateMatchExpressionByDates(
        queryFilters['saleDateFrom'],
        queryFilters['saleDateTo'],
      ),
    });
  }

  if (queryFilters['effectiveDateFrom'] || queryFilters['effectiveDateTo']) {
    conditions['$and'].push({
      effectiveAt: getDateMatchExpressionByDates(
        queryFilters['effectiveDateFrom'],
        queryFilters['effectiveDateTo'],
      ),
    });
  }

  if (queryFilters['expirationDateFrom'] || queryFilters['expirationDateTo']) {
    conditions['$and'].push({
      expiresAt: getDateMatchExpressionByDates(
        queryFilters['expirationDateFrom'],
        queryFilters['expirationDateTo'],
      ),
    });
  }

  if (queryFilters['type']) {
    conditions['$and'].push({ type: queryFilters['type'] });
  }

  if (queryFilters['lineOfBusiness']) {
    conditions['$and'].push({
      lineOfBusiness: queryFilters['lineOfBusiness'],
    });
  }

  if (queryFilters['insured']) {
    conditions['$and'].push({
      'customer._id': Types.ObjectId(queryFilters['insured']),
    });
  }

  if (queryFilters['broker']) {
    conditions['$and'].push({
      items: {
        $elemMatch: { broker: Types.ObjectId(queryFilters['broker']) },
      },
    });
  }

  if (queryFilters['carrier']) {
    conditions['$and'].push({
      items: {
        $elemMatch: { carrier: Types.ObjectId(queryFilters['carrier']) },
      },
    });
  }

  if (queryFilters['status']) {
    conditions['$and'].push({ status: queryFilters['status'] });
  }

  if (queryFilters['location']) {
    conditions['$and'].push({
      'location._id': Types.ObjectId(queryFilters['location']),
    });
  }
}

export function setFilterByQueryString(queryParams: any, filterQueries: any[]) {
  if (queryParams.filter && Object.keys(queryParams.filter).length > 0) {
    filterQueries = Object.keys(queryParams.filter).map((key) => {
      return {
        [key]: {
          $regex: new RegExp('.*' + queryParams.filter[key] + '.*', 'i'),
        },
      };
    });
  }
}

