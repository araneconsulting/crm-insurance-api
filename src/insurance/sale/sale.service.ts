import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Sale } from 'database/sale.model';
import { User } from 'database/user.model';
import { Model, Types } from 'mongoose';
import { EMPTY, from, Observable, of } from 'rxjs';
import { mergeMap, throwIfEmpty } from 'rxjs/operators';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';
import {
  INSURER_MODEL,
  SALE_MODEL,
  USER_MODEL,
} from '../../database/database.constants';
import { CreateSaleDto } from './create-sale.dto';
import { UpdateSaleDto } from './update-sale.dto';
import * as DateFactory from 'shared/util/date-functions';
import { isAdmin, isExecutive } from 'shared/util/user-functions';
import { getDateMatchExpressionByDates } from 'shared/util/aggregator-functions';
import { Insurer } from 'database/insurer.model';
import { roundAmount } from 'shared/util/math-functions';
import { CompanyCatalog } from 'shared/const/catalog/company';

@Injectable({ scope: Scope.REQUEST })
export class SaleService {
  constructor(
    @Inject(SALE_MODEL) private saleModel: Model<Sale>,
    @Inject(INSURER_MODEL) private insurerModel: Model<Insurer>,
    @Inject(USER_MODEL) private userModel: Model<User>,
    @Inject(REQUEST) private req: AuthenticatedRequest,
  ) {}

  /**
   * @param  {Partial<User>} user
   * @param  {string} startDate?
   * @param  {string} endDate?
   * @param  {string} type?
   * @returns Promise
   */
  async findAll(
    user: Partial<User>,
    startDate?: string,
    endDate?: string,
    type?: string,
  ): Promise<any> {
    const filterConditions = {
      soldAt: getDateMatchExpressionByDates(startDate, endDate),
    };

    if (type) {
      filterConditions['type'] = type;
    }

    if (!isAdmin(user) && !isExecutive(user)) {
      filterConditions['seller'] = Types.ObjectId(user.id);
    }

    const query = this.saleModel.aggregate();
    query.match(filterConditions);

    query
      .unwind({ path: '$seller', preserveNullAndEmptyArrays: true })
      .lookup({
        from: 'users',
        localField: 'seller',
        foreignField: '_id',
        as: 'seller',
      })
      .unwind({ path: '$seller', preserveNullAndEmptyArrays: true });

    query
      .unwind({ path: '$customer', preserveNullAndEmptyArrays: true })
      .lookup({
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customer',
      })
      .unwind({ path: '$customer', preserveNullAndEmptyArrays: true })

      .unwind({ path: '$liabilityInsurer', preserveNullAndEmptyArrays: true })
      .lookup({
        from: 'insurers',
        localField: 'liabilityInsurer',
        foreignField: '_id',
        as: 'liabilityInsurer',
      })
      .unwind({ path: '$liabilityInsurer', preserveNullAndEmptyArrays: true })

      .unwind({ path: '$cargoInsurer', preserveNullAndEmptyArrays: true })
      .lookup({
        from: 'insurers',
        localField: 'cargoInsurer',
        foreignField: '_id',
        as: 'cargoInsurer',
      })
      .unwind({ path: '$cargoInsurer', preserveNullAndEmptyArrays: true })

      .unwind({
        path: '$physicalDamageInsurer',
        preserveNullAndEmptyArrays: true,
      })
      .lookup({
        from: 'insurers',
        localField: 'physicalDamageInsurer',
        foreignField: '_id',
        as: 'physicalDamageInsurer',
      })
      .unwind({
        path: '$physicalDamageInsurer',
        preserveNullAndEmptyArrays: true,
      })

      .unwind({ path: '$wcGlUmbInsurer', preserveNullAndEmptyArrays: true })
      .lookup({
        from: 'insurers',
        localField: 'wcGlUmbInsurer',
        foreignField: '_id',
        as: 'wcGlUmbInsurer',
      })
      .unwind({ path: '$wcGlUmbInsurer', preserveNullAndEmptyArrays: true })

      .append([
        {
          $project: {
            type: '$type',
            soldAt: '$soldAt',
            liabilityCharge: { $round: ['$liabilityCharge', 2] },
            liabilityProfit: { $round: ['$liabilityProfit', 2] },
            cargoCharge: { $round: ['$cargoCharge', 2] },
            cargoProfit: { $round: ['$cargoProfit', 2] },
            physicalDamageCharge: { $round: ['$physicalDamageCharge', 2] },
            physicalDamageProfit: { $round: ['$physicalDamageProfit', 2] },
            wcGlUmbCharge: { $round: ['$wcGlUmbCharge', 2] },
            wcGlUmbProfit: { $round: ['$wcGlUmbProfit', 2] },
            fees: { $round: ['$fees', 2] },
            permits: { $round: ['$permits', 2] },
            tips: { $round: ['$tips', 2] },
            chargesPaid: { $round: ['$chargesPaid', 2] },
            premium: { $round: ['$premium', 2] },
            amountReceivable: { $round: ['$amountReceivable', 2] },
            totalCharge: { $round: ['$totalCharge', 2] },
            sellerName: {
              $concat: ['$seller.firstName', ' ', '$seller.lastName'],
            },
            locationName: {
              $function: {
                body: function (seller, CompanyCatalog) {
                  location = CompanyCatalog.locations.find(
                    ({ id }) => id === seller.location,
                  );
                  return location ? location['name'] : '';
                },
                args: ['$seller', CompanyCatalog],
                lang: 'js',
              },
            },
            customerName: {
              $function: {
                body: function (customer) {
                  return customer ? customer.company || customer.name : '';
                },
                args: ['$customer'],
                lang: 'js',
              },
            },
            location: '$location',
            createdBy: '$createdBy',
            updatedBy: '$updatedBy',
            seller: 1,
            customer: 1,
            liabilityInsurer: 1,
            cargoInsurer: 1,
            physicalDamageInsurer: 1,
            wcGlUmbInsurer: 1,
          },
        },
      ])
      .sort({ soldAt: -1 });

    return query;
  }

  /**
   * @param  {string} id
   * @param  {} withSeller=false
   * @param  {} withCustomer=false
   * @param  {} withInsurers=false
   * @returns Observable
   */
  findById(
    id: string,
    withSeller = false,
    withCustomer = false,
    withInsurers = false,
  ): Observable<Sale> {
    const saleQuery = this.saleModel.findOne({ _id: id });

    if (withSeller) {
      saleQuery.populate('seller');
    }

    if (withCustomer) {
      saleQuery.populate('customer');
    }

    if (withInsurers) {
      saleQuery.populate('liabilityInsurer');
      saleQuery.populate('cargoInsurer');
      saleQuery.populate('physicalDamageInsurer');
      saleQuery.populate('wcGlUmbInsurer');
    }

    return from(saleQuery.exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`sale:$id was not found`)),
    );
  }
 
  /**
   * @param  {CreateSaleDto} saleDto
   * @param  {Partial<User>} user
   * @returns Promise
   */
  async save(saleDto: CreateSaleDto, user: Partial<User>): Promise<Sale> {
    if (
      !saleDto.seller ||
      (saleDto.seller && !isAdmin(user) && !isExecutive(user))
    ) {
      saleDto.seller = user.id;
      saleDto['location'] = user.location;
    } else {
      const seller = await this.userModel.findOne({ _id: saleDto.seller });
      if (!seller) {
        throw new ConflictException('Seller not found');
      }
      saleDto['seller'] = seller._id;
      saleDto['location'] = seller.location;
    }

    let saleData = await this.setSaleCalculations(saleDto);

    return this.saleModel.create({
      ...saleData,
    });
  }

  /**
   * @param  {string} id
   * @param  {UpdateSaleDto} data
   * @param  {Partial<User>} user
   * @returns Promise
   */
  async update(
    id: string,
    data: UpdateSaleDto,
    user: Partial<User>,
  ): Promise<Sale> {
    if (data.seller && !isAdmin(user) && !isExecutive(user)) {
      delete data.seller;
    }

    let sale = await this.saleModel.findById(Types.ObjectId(id)).exec();

    if (!sale) {
      throw new NotFoundException(`sale:$id was not found`);
    }

    let saleDto: CreateSaleDto = {...sale["_doc"],...data};
    let saleData = await this.setSaleCalculations(saleDto);

    return this.saleModel.findOneAndUpdate(
      { _id: Types.ObjectId(id) },
      { ...saleData },
      { new: true },
    );
  }

  /**
   * @param  {string} id
   * @returns Observable
   */
  deleteById(id: string): Observable<Sale> {
    return from(this.saleModel.findOneAndDelete({ _id: id }).exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`sale:$id was not found`)),
    );
  }

  /**
 * @returns Observable
 */

  deleteAll(): Observable<any> {
    return from(this.saleModel.deleteMany({}).exec());
  }

  
  /**
   * @param  {string} dateRange
   */
  getDateMatchExpressionByRange(dateRange: string): any {
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
  getDateMatchExpressionByDates(startDate?: string, endDate?: string): Object {
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

  /**
   * @param  {CreateSaleDto} sale
   * @returns Promise
   */
  async setSaleCalculations(sale: CreateSaleDto): Promise<CreateSaleDto> {
    const insurers = await this.insurerModel.find({}).exec();
    if (sale.liabilityInsurer) {
      const insurer = insurers.find(
        (insurer) => sale.liabilityInsurer && insurer.id === sale.liabilityInsurer._id.toString(),
      );
      sale['liabilityProfit'] = insurer
        ? roundAmount(
            (insurer.liabilityCommission / 100) * sale.liabilityCharge,
          )
        : 0;
    }

    if (sale.cargoInsurer) {
      const insurer = insurers.find(
        (insurer) => sale.cargoInsurer && insurer.id === sale.cargoInsurer._id.toString(),
      );
      sale['cargoProfit'] = insurer
        ? roundAmount((insurer.cargoCommission / 100) * sale.cargoCharge)
        : 0;
    }

    if (sale.physicalDamageInsurer) {
      const insurer = insurers.find(
        (insurer) => sale.physicalDamageInsurer && insurer.id === sale.physicalDamageInsurer._id.toString(),
      );
      sale['physicalDamageProfit'] = insurer
        ? roundAmount((insurer.physicalDamageCommission / 100) * sale.physicalDamageCharge)
        : 0;
    }

    if (sale.wcGlUmbInsurer) {
      const insurer = insurers.find(
        (insurer) => sale.wcGlUmbInsurer && insurer.id === sale.wcGlUmbInsurer._id.toString(),
      );
      sale['wcGlUmbProfit'] = insurer
        ? roundAmount((insurer.wcGlUmbCommission / 100) * sale.wcGlUmbCharge)
        : 0;
    }

    sale['premium'] =
      (sale.liabilityCharge || 0) +
      (sale.cargoCharge || 0) +
      (sale.physicalDamageCharge || 0) +
      (sale.wcGlUmbCharge || 0);
    sale['amountReceivable'] =
      (sale.totalCharge || 0) - (sale.chargesPaid || 0);

    return sale;
  }
}
