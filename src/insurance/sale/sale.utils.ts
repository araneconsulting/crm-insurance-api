import { ConflictException } from '@nestjs/common';
import { SaleItem } from 'business/sub-docs/sale-item';
import { TruckingDetails } from 'business/sub-docs/trucking.details';
import { Insurer } from 'database/insurer.model';
import { roundAmount } from 'shared/util/math-functions';
import { SaleDto } from './dto/sale.dto';
import * as DateFactory from 'shared/util/date-functions';


export async function setSaleCalculations(
  saleDto: Partial<SaleDto>,
  providers: Insurer[],
): Promise<Partial<SaleDto>> {

  let sale: Partial<SaleDto> = { ...saleDto };
  let items: SaleItem[] = sale.items;

  if (items) {
    let premium = 0;
    let totalCharge = 0;
    let profits = 0;
    let permits = 0;
    let fees = 0;

    const totalChargeItemized = !sale.totalCharge || sale.totalCharge === -1;

    sale.items.map((item) => {
      switch (item.product) {
        case 'PERMIT':
          permits += item.amount;
          break;
        case 'FEE':
          fees += item.amount;
          break;
        default:
          if (item.details) {
            const details: Partial<TruckingDetails> = item.details;
            //Calculate premium (sum of providers amounts)
            premium += details.premium || 0;
          }

          //calculate total charge (aka total down payment)
          if (totalChargeItemized) {
            totalCharge += item.amount || 0;
          }

          //calculate item profits and sale total profits
          if (item.provider) {
            const provider = providers.find(
              (provider) =>
                item.provider &&
                item.provider !== '' &&
                provider.id === item.provider.toString(),
            );

            if (!provider) {
              throw new ConflictException(
                'Sale Item ' + `${item.provider}` + ' provider not found',
              );
            }

            let commission = provider.commissions.find(
              (commission) => commission.productType === sale.type,
            );

            if (commission) {
              item.profits = roundAmount(
                (commission.percent / 100) * item.amount,
              );
              profits += item.profits;
            } else {
              throw new ConflictException(
                `Provider ${item.provider} commissions missing`,
              );
            }
          } else {
            throw new ConflictException(`Item provider is required`);
          }
      }
    });

    sale.profits = roundAmount(profits || 0);
    sale.premium = roundAmount(premium || 0);
    sale.permits = roundAmount(permits || 0);

    if (totalChargeItemized) {
      sale.totalCharge = totalCharge = roundAmount(totalCharge || 0);
    }

    sale.amountReceivable = roundAmount(sale.totalCharge - sale.chargesPaid);
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
export function getDateMatchExpressionByDates(startDate?: string, endDate?: string): Object {
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
