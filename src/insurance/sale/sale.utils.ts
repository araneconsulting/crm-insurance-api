import { ConflictException } from '@nestjs/common';
import { SaleItem } from 'business/sub-docs/sale-item';
import { TruckingDetails } from 'business/sub-docs/trucking.details';
import { Insurer } from 'database/insurer.model';
import { roundAmount } from 'shared/util/math-functions';
import { SaleDto } from './dto/sale.dto';
import * as DateFactory from 'shared/util/date-functions';
import { Number } from 'mongoose';

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
        switch (item.product) {
          case 'PERMIT':
            permits += item.premium;
            item.profits = PERMIT_COMMISION_PERCENT * item.premium;
            profits += item.profits;
            totalCharge += item.premium;
            break;
          case 'FEE':
            fees += item.premium;
            item.profits = (1 - FEE_COMMISION_PERCENT) * item.premium;
            profits += item.profits;
            totalCharge += item.premium;
            break;
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
      if (insuranceItems) {
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
