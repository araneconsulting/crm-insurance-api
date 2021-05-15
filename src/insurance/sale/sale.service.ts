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
import { CreateSaleDto } from './dto/create-sale.dto';
import * as DateFactory from 'shared/util/date-functions';
import { isAdmin, isExecutive } from 'shared/util/user-functions';
import { getDateMatchExpressionByDates } from 'shared/util/aggregator-functions';
import { Insurer } from 'database/insurer.model';
import { roundAmount } from 'shared/util/math-functions';
import { CompanyCatalog } from 'shared/const/catalog/company';
import { UpdateSaleDto } from './dto/update-sale.dto';

@Injectable({ scope: Scope.REQUEST })
export class SaleService {
  constructor(
    @Inject(SALE_MODEL) private saleModel: Model<Sale>,
    @Inject(INSURER_MODEL) private insurerModel: Model<Insurer>,
    @Inject(USER_MODEL) private userModel: Model<User>,
    @Inject(REQUEST) private req: AuthenticatedRequest,
  ) {}

  /**
   * @param  {string} startDate?
   * @param  {string} endDate?
   * @param  {string} type?
   * @returns Promise
   */
  async findAll(
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

    if (!isAdmin(this.req.user) && !isExecutive(this.req.user)) {
      filterConditions['seller'] = Types.ObjectId(this.req.user.id);
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
            items: '$items',
            type: '$type',
            soldAt: '$soldAt',
            fees: { $round: ['$fees', 2] },
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
                  return customer.type === 'BUSINESS' ? customer.business.name : customer.contact.firstName + customer.contact.lastName;
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
   * @returns Promise
   */
  async save(saleDto: CreateSaleDto): Promise<Sale> {
    saleDto['createdBy'] = this.req.user.id;

    if (
      !saleDto.seller ||
      (saleDto.seller && !isAdmin(this.req.user) && !isExecutive(this.req.user))
    ) {
      saleDto.seller = this.req.user.id;
      const authUser = await this.userModel.findOne({ _id: this.req.user.id });
      saleDto['location'] = authUser.location;
      saleDto['company'] = authUser.company;
      console.log('user.location', authUser.location);
    } else {
      const seller = await this.userModel.findOne({ _id: saleDto.seller });
      if (!seller) {
        throw new ConflictException('Seller not found');
      }
      saleDto['seller'] = seller._id;
      saleDto['location'] = seller.location;
      saleDto['company'] = seller.company;
      console.log('seller.location', seller.location);
    }

    //let saleData = await this.setSaleCalculations(saleDto);

    /***/ const saleData = saleDto;

    return this.saleModel.create({
      ...saleData,
    });
  }

  /**
   * @param  {string} id
   * @param  {UpdateSaleDto} data
   * @returns Promise
   */
  async update(id: string, saleDto: UpdateSaleDto): Promise<Sale> {
    saleDto['updatedBy'] = this.req.user.id;

    if (
      saleDto.seller &&
      !isAdmin(this.req.user) &&
      !isExecutive(this.req.user)
    ) {
      delete saleDto.seller;
    }

    let sale = await this.saleModel.findById(Types.ObjectId(id)).exec();

    if (!sale) {
      throw new NotFoundException(`sale:$id was not found`);
    }

    let updatedSaleDto = { ...sale['_doc'], ...saleDto };

    //let saleData = await this.setSaleCalculations(saleDto);

    /***/ const saleData = updatedSaleDto;

    return this.saleModel.findOneAndUpdate(
      { _id: Types.ObjectId(id) },
      { saleData },
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
  /* async setSaleCalculations(sale: CreateSaleDto): Promise<CreateSaleDto> {
    const insurers = await this.insurerModel.find({}).exec();
    if (sale.liabilityInsurer) {
      const insurer = insurers.find(
        (insurer) =>
          sale.liabilityInsurer &&
          sale.liabilityInsurer !== '' &&
          insurer.id === sale.liabilityInsurer.toString(),
      );
      sale['liabilityProfit'] = insurer
        ? roundAmount(
            (insurer.commissionSheet.liabilityCommission / 100) * sale.liabilityCharge,
          )
        : 0;
    }

    if (sale.cargoInsurer) {
      const insurer = insurers.find(
        (insurer) =>
          sale.cargoInsurer &&
          sale.cargoInsurer !== '' &&
          insurer.id === sale.cargoInsurer.toString(),
      );
      sale['cargoProfit'] = insurer
        ? roundAmount((insurer.commissionSheet.cargoCommission / 100) * sale.cargoCharge)
        : 0;
    }

    if (sale.physicalDamageInsurer) {
      const insurer = insurers.find(
        (insurer) =>
          sale.physicalDamageInsurer &&
          sale.physicalDamageInsurer !== '' &&
          insurer.id === sale.physicalDamageInsurer.toString(),
      );
      sale['physicalDamageProfit'] = insurer
        ? roundAmount(
            (insurer.commissionSheet.physicalDamageCommission / 100) *
              sale.physicalDamageCharge,
          )
        : 0;
    }

    if (sale.wcGlUmbInsurer) {
      const insurer = insurers.find(
        (insurer) =>
          sale.wcGlUmbInsurer &&
          sale.wcGlUmbInsurer !== '' &&
          insurer.id === sale.wcGlUmbInsurer.toString(),
      );
      sale['wcGlUmbProfit'] = insurer
        ? roundAmount((insurer.commissionSheet.wcGlUmbCommission / 100) * sale.wcGlUmbCharge)
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
  } */

  async search(queryParams?: any): Promise<any> {
    const sortCriteria = {};
    sortCriteria[queryParams.sortField] =
      queryParams.sortOrder === 'desc' ? -1 : 1;
    const skipCriteria = (queryParams.pageNumber - 1) * queryParams.pageSize;
    const limitCriteria = queryParams.pageSize;

    let type = null;
    if (queryParams.filter.hasOwnProperty('type')) {
      type = queryParams.filter.type;
      delete queryParams.filter['type'];
    }

    if (
      type ||
      (queryParams.filter && Object.keys(queryParams.filter).length > 0)
    ) {
      let conditions = type
        ? {
            $and: [{ type: type }],
          }
        : {};

      if (queryParams.filter && Object.keys(queryParams.filter).length > 0) {
        const filterQueries = Object.keys(queryParams.filter).map((key) => {
          return {
            [key]: {
              $regex: new RegExp('.*' + queryParams.filter[key] + '.*', 'i'),
            },
          };
        });

        conditions['$or'] = filterQueries;
      }

      return {
        totalCount: await this.saleModel
          .find(conditions)
          .countDocuments()
          .exec(),
        entities: await this.saleModel
          .find(conditions)
          .populate(
            'customer',
            'type contact.firstName contact.lastName business.name',
          )
          .populate('location', 'alias business.name')
          .skip(skipCriteria)
          .limit(limitCriteria)
          .sort(sortCriteria)
          .exec(),
      };
    } else {
      return {
        totalCount: await this.saleModel.find().countDocuments().exec(),
        entities: await this.saleModel
          .find()
          .populate(
            'customer',
            'type contact.firstName contact.lastName business.name',
          )
          .populate('location', 'alias business.name')
          .skip(skipCriteria)
          .limit(limitCriteria)
          .sort(sortCriteria)
          .exec(),
      };
    }
  }
}
