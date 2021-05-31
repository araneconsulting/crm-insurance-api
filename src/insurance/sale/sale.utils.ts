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
  providers: Insurer[],
): Promise<Partial<SaleDto>> {
  let sale: Partial<SaleDto> = { ...saleDto };
  let items: SaleItem[] = sale.items;

  if (items) {
    let premium = 0;
    let totalCharge = 0;
    let totalInsurance = 0;
    let profits = 0;
    let permits = 0;
    let fees = 0;

    sale.isChargeItemized = true && sale.isChargeItemized;

    if (sale.isChargeItemized) {
      sale.fees = 0;
      sale.permits = 0;
      sale.premium = 0;
      sale.profits = 0;
      sale.totalInsurance = 0;
      sale.amountReceivable = 0;

      sale.items.map((item: SaleItem) => {
        switch (item.product) {
          case 'PERMIT':
            permits += item.amount;
            item.profits = PERMIT_COMMISION_PERCENT * item.amount;
            profits += item.profits;
            break;
          case 'FEE':
            fees += item.amount;
            item.profits = (1 - FEE_COMMISION_PERCENT) * item.amount;
            profits += item.profits;
            break;
          default:
            totalInsurance += item.amount || 0;
            premium += item.premium || 0;

            //calculate item profits and sale total profits
            if (item.provider) {
              item.profits = calculateProfitByProvider(
                providers,
                item.provider,
                item.amount,
                sale.type,
              );
              profits += item.profits;
            } else {
              throw new ConflictException(`Item provider is required`);
            }
        }

        //all charges but tips
        totalCharge += item.amount;
      });
    }

    if (sale.isChargeItemized) {
      //Do total calculations for itemized
      sale.permits = roundAmount(permits || 0);
      sale.fees = roundAmount(fees || 0);
      sale.totalInsurance = roundAmount(totalInsurance || 0);
      sale.profits = roundAmount(profits || 0);
      sale.totalCharge = roundAmount(totalCharge || 0);
      sale.premium = roundAmount(premium || 0);
    } else {
      //Do total calculations for non itemized
      sale.premium = roundAmount(sale.premium || 0);
      sale.permits = roundAmount(sale.permits || 0);
      sale.fees = roundAmount(sale.fees || 0);
      sale.totalInsurance = roundAmount(sale.totalInsurance || 0);

      sale.totalCharge = roundAmount(
        sale.totalInsurance + sale.permits + sale.fees,
      );

      let providerItem = sale.items.find(
        (item) => item.provider !== 'PERMIT' && item.provider !== 'FEE',
      );

      if (providerItem) {
        profits = calculateProfitByProvider(
          providers,
          providerItem.provider,
          sale.totalInsurance,
          sale.type,
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
  startDate?: string,
  endDate?: string,
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

export function calculateProfitByProvider(
  providers,
  providerId: string,
  amount: number,
  saleType: string,
): number {
  let profits = 0;

  const provider = providers.find(
    (provider) =>
      providerId && providerId !== '' && provider.id === providerId.toString(),
  );

  if (!provider) {
    throw new ConflictException(
      'Sale Item ' + `${providerId}` + ' provider not found',
    );
  }

  let commission = provider.commissions.find(
    (commission) => commission.productType === saleType,
  );

  if (commission) {
    profits = roundAmount((commission.percent / 100) * amount);
  } else {
    throw new ConflictException(`Provider ${providerId} commissions missing`);
  }

  return profits;
}

export function titleCase(str) {
  return str.toLowerCase().split(' ').map(function(word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
}
