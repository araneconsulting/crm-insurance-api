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
import { SaleDto } from './dto/sale.dto';
import * as DateFactory from 'shared/util/date-functions';
import { isAdmin, isExecutive } from 'shared/util/user-functions';
import { getDateMatchExpressionByDates } from 'shared/util/aggregator-functions';
import { Insurer } from 'database/insurer.model';
import { roundAmount } from 'shared/util/math-functions';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { SaleItem } from 'business/sub-docs/sale-item';
import { TruckingDetails } from 'business/sub-docs/trucking.details';

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
      .unwind({ path: '$customer', preserveNullAndEmptyArrays: true });

    query
      .unwind({ path: '$location', preserveNullAndEmptyArrays: true })
      .lookup({
        from: 'locations',
        localField: 'location',
        foreignField: '_id',
        as: 'location',
      })
      .unwind({ path: '$location', preserveNullAndEmptyArrays: true })

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
                body: function (location: any) {
                  return location ? location.business.name : 'N/A';
                },
                args: ['$location'],
                lang: 'js',
              },
            },
            customerName: {
              $function: {
                body: function (customer: any) {
                  return customer
                    ? customer.type === 'BUSINESS'
                      ? customer.business.name
                      : `${customer.contact.firstName}  ${customer.contact.lastName}`
                    : 'N/A';
                },
                args: ['$customer'],
                lang: 'js',
              },
            },
            createdBy: '$createdBy',
            updatedBy: '$updatedBy',
            seller: 1,
            customer: 1,
            location: 1,
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

    return from(saleQuery.exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`sale:$id was not found`)),
    );
  }

  /**
   * @param  {CreateSaleDto} saleDto
   * @returns Promise
   */
  async save(createSaleDto: CreateSaleDto): Promise<Sale> {
    let saleDto: Partial<SaleDto> = { ...createSaleDto };

    if (
      !saleDto.seller ||
      (saleDto.seller && !isAdmin(this.req.user) && !isExecutive(this.req.user))
    ) {
      saleDto.seller = this.req.user.id;
      saleDto['location'] = this.req.user.location;
    } else {
      const seller = await this.userModel.findOne({ _id: saleDto.seller });
      if (!seller) {
        throw new ConflictException('Seller not found');
      }
      saleDto['seller'] = seller._id;
      saleDto['location'] = seller.location;
    }

    const insurers = await this.insurerModel.find({}).exec();
    let saleData = await this.setSaleCalculations(saleDto, insurers);

    return this.saleModel.create({
      ...saleData,
      createdBy: { _id: this.req.user.id },
      company: { _id: this.req.user.company },
    });
  }

  /**
   * @param  {string} id
   * @param  {UpdateSaleDto} data
   * @returns Promise
   */
  async update(id: string, updateSaleDto: UpdateSaleDto): Promise<Sale> {
    let saleDto: Partial<SaleDto> = { ...updateSaleDto };

    saleDto.updatedBy = this.req.user.id;

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

    saleDto = {
      ...sale['_doc'],
      ...saleDto,
      updatedBy: { _id: this.req.user.id },
      company: { _id: this.req.user.company },
    };

    const insurers = await this.insurerModel.find({}).exec();
    let saleData: any = await this.setSaleCalculations(saleDto, insurers);

    return this.saleModel.findOneAndUpdate(
      { _id: Types.ObjectId(id) },
      {
        ...saleData,
      },
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

  async setSaleCalculations(
    saleDto: Partial<SaleDto>,
    providers: Insurer[],
  ): Promise<Partial<SaleDto>> {
    let sale: Partial<SaleDto> = { ...saleDto };
    let items: SaleItem[] = sale.items;

    if (items) {
      let premium = 0;
      let calcTotalCharge = !sale.totalCharge || sale.totalCharge === -1;
      let totalCharge = 0;
      let profits = 0;
      let permits = 0;

      sale.items.map((item) => {
        //calculate total premium
        if (item.product !== 'TRUCKING_PERMIT') {
          if (item.details) {
            const details: Partial<TruckingDetails> = item.details;
            //Calculate premium
            premium += details.premium ? parseFloat(item.details.premium) : 0;
          }
        } else {
          permits += item.amount;
        }

        //calculate total charge (aka total down payment)
        if (calcTotalCharge) {
          totalCharge += item.amount ? item.amount : 0;
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

          let commision = provider.commissions.find((productType) => sale.type);

          if (commision) {
            item.profits = roundAmount((commision.percent / 100) * item.amount);
            profits += item.profits;
          } else {
            throw new ConflictException(
              'Provider $item.provider commissions missing.',
            );
          }
        } else {
          throw new ConflictException(
            'Sale Item provider not found :$item.provider.',
          );
        }
      });

      sale.profits = roundAmount(profits || 0);
      sale.premium = roundAmount(premium || 0);
      sale.permits = roundAmount(permits || 0);
      totalCharge = roundAmount(totalCharge || 0);

      if (calcTotalCharge) {
        sale.totalCharge = totalCharge;
      }
      sale.totalCharge = roundAmount(
        sale.totalCharge + sale.tips + sale.permits + sale.fees,
      );

      sale.amountReceivable = roundAmount(sale.totalCharge - sale.chargesPaid);
    }
    return sale;
  }

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

    let conditions = null;
    if (
      type ||
      (queryParams.filter && Object.keys(queryParams.filter).length > 0)
    ) {
      conditions = type
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
    }

    const query = this.saleModel.aggregate();

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
      .unwind({ path: '$customer', preserveNullAndEmptyArrays: true });

    query
      .unwind({ path: '$location', preserveNullAndEmptyArrays: true })
      .lookup({
        from: 'locations',
        localField: 'location',
        foreignField: '_id',
        as: 'location',
      })
      .unwind({ path: '$location', preserveNullAndEmptyArrays: true });

    if (conditions) {
      query.match(conditions);
    }

    query.append([
      {
        $project: {
          
          type: '$type',
          soldAt: '$soldAt',
          totalCharge: { $round: ['$totalCharge', 2] },
          sellerName: {
            $concat: ['$seller.firstName', ' ', '$seller.lastName'],
          },
          locationName: {
            $function: {
              body: function (location: any) {
                return location ? location.business.name : 'N/A';
              },
              args: ['$location'],
              lang: 'js',
            },
          },
          customerName: {
            $function: {
              body: function (customer: any) {
                return customer
                  ? customer.type === 'BUSINESS'
                    ? customer.business.name
                    : `${customer.contact.firstName}  ${customer.contact.lastName}`
                  : 'N/A';
              },
              args: ['$customer'],
              lang: 'js',
            },
          },
          code: '$code'
          //createdBy: '$createdBy',
          //updatedBy: '$updatedBy',
          //seller: 1,
          //customer: 1,
          //location: 1,
        },
      },
    ]);

    query.skip(skipCriteria).limit(limitCriteria).sort(sortCriteria);

    const entities = await query.exec();

    return {
      entities: entities,
      totalCount: entities.length,
    };
  }
}
