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
import { isAdmin, isExecutive } from 'shared/util/user-functions';
import { getDateMatchExpressionByDates } from 'shared/util/aggregator-functions';
import { Insurer } from 'database/insurer.model';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { EndorseSaleDto } from './dto/endorse-sale.dto';
import { setSaleCalculations } from './sale.utils';
import { SaleItem } from 'business/sub-docs/sale-item';
import { Location } from 'database/location.model';
import { Customer } from 'database/customer.model';

const SALE_LAYOUT_DEFAULT = 'NORMAL';
const SALE_LAYOUT_FULL = 'FULL';
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
  async findAll(startDate?: Date, endDate?: Date, type?: string): Promise<any> {
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
      .unwind({ path: '$location', preserveNullAndEmptyArrays: true })

      .append([
        {
          $project: {
            code: '$code',
            items: '$items',
            type: '$type',
            soldAt: '$soldAt',
            fees: { $round: ['$fees', 2] },
            tips: { $round: ['$tips', 2] },
            chargesPaid: { $round: ['$chargesPaid', 2] },
            premium: { $round: ['$premium', 2] },
            amountReceivable: { $round: ['$amountReceivable', 2] },
            totalCharge: { $round: ['$totalCharge', 2] },
            totalInsurance: { $round: ['$totalInsurance', 2] },
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
   * @param  {string} code
   * @param  {} withSeller=false
   * @param  {} withCustomer=false
   * @param  {} withInsurers=false
   * @returns Observable
   */
   async findByCode(
    code: string,
    withSeller = false,
    withCustomer = false,
    layout = SALE_LAYOUT_DEFAULT,
  ): Promise<Partial<Sale>> {
    const saleQuery = this.saleModel.findOne({ code: code });

    if (withSeller) {
      saleQuery.populate('seller', 'roles firstName lastName fullName');
    }

    if (withCustomer) {
      saleQuery.populate(
        'customer',
        'type contact.firstName contact.lastName business.name name',
      );
    }

    let sale: Partial<Sale> = await saleQuery.exec();

    if (!sale) {
      throw new NotFoundException(`sale with code:${code} was not found`);
    }

    if (layout === SALE_LAYOUT_FULL) {
      sale.endorsements = await this.saleModel
        .aggregate()
        .match({ endorsementReference: Types.ObjectId(sale.id) })
        .exec();
    }

    return sale;
  }

  /**
   * @param  {string} id
   * @param  {} withSeller=false
   * @param  {} withCustomer=false
   * @param  {} withInsurers=false
   * @returns Observable
   */
  async findById(
    id: string,
    withSeller = false,
    withCustomer = false,
    layout = SALE_LAYOUT_DEFAULT,
  ): Promise<Partial<Sale>> {
    const saleQuery = this.saleModel.findOne({ _id: id });

    if (withSeller) {
      saleQuery.populate('seller', 'roles firstName lastName fullName');
    }

    if (withCustomer) {
      saleQuery.populate(
        'customer',
        'type contact.firstName contact.lastName business.name name',
      );
    }

    let sale: Partial<Sale> = await saleQuery.exec();

    if (!sale) {
      throw new NotFoundException(`sale:${id} was not found`);
    }

    if (layout === SALE_LAYOUT_FULL) {
      sale.endorsements = await this.saleModel
        .aggregate()
        .match({ endorsementReference: Types.ObjectId(sale.id) })
        .exec();
    }

    return sale;
  }

  /**
   * @param  {CreateSaleDto} saleDto
   * @returns Promise
   */
  async save(createSaleDto: CreateSaleDto): Promise<Sale> {
    let saleDto: Partial<SaleDto> = { ...createSaleDto };

    if (!saleDto.isChargeItemized) {
      saleDto.items = saleDto.items.map((item) => {
        if (item.product === 'FEE' || item.product === 'PERMIT') {
          delete item['provider'];
          delete item['subprovider'];
        }

        if (item.provider === '') {
          delete item['provider'];
        }

        if (item.subprovider === '') {
          delete item['subprovider'];
        }

        return {
          ...item,
          amount: 0,
          premium: 0,
          profits: 0,
        };
      });
    }

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
    let saleData = await setSaleCalculations(saleDto, insurers);

    return this.saleModel.create({
      ...saleData,
      createdBy: { _id: this.req.user.id },
      company: { _id: this.req.user.company },
    });
  }

  /**
   * @param  {string} code
   * @param  {UpdateSaleDto} data
   * @returns Promise
   */
  async update(code: string, updateSaleDto: UpdateSaleDto): Promise<Sale> {
    let saleDto: Partial<SaleDto> = { ...updateSaleDto };

    if (!saleDto.isChargeItemized) {
      saleDto.items = saleDto.items.map((item) => ({
        ...item,
        amount: 0,
        premium: 0,
        profits: 0,
      }));
    }

    saleDto.updatedBy = this.req.user.id;

    if (
      saleDto.seller &&
      !isAdmin(this.req.user) &&
      !isExecutive(this.req.user)
    ) {
      delete saleDto.seller;
    }

    let sale: Partial<Sale> = await this.saleModel.findOne({code:code}).exec();

    if (!sale) {
      throw new NotFoundException(`sale:${code} was not found`);
    }

    saleDto = {
      ...sale['_doc'],
      ...saleDto,
      updatedBy: { _id: this.req.user.id },
      company: { _id: this.req.user.company },
    };

    const insurers = await this.insurerModel.find({}).exec();
    let saleData: any = await setSaleCalculations(saleDto, insurers);

    return this.saleModel.findOneAndUpdate(
      { _id: Types.ObjectId(sale.id) },
      {
        ...saleData,
      },
      { new: true },
    );
  }

  /**
   * @param  {string} code
   * @returns Observable
   */
  deleteByCode(code: string): Observable<Sale> {
    return from(this.saleModel.findOneAndDelete({ code: code }).exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`sale:${code} was not found`)),
    );
  }

  /**
   * @returns Observable
   */

  deleteAll(): Observable<any> {
    return from(this.saleModel.deleteMany({}).exec());
  }

  /**
   * @returns Observable
   */

  async batchDelete(codes: string[]): Promise<any> {
    return await from(this.saleModel.deleteMany({ codes: { $in: codes } }).exec());
  }

  async search(queryParams?: any): Promise<any> {
    const sortCriteria = {};
    sortCriteria[queryParams.sortField] =
      queryParams.sortOrder === 'desc' ? -1 : 1;
    const skipCriteria = (queryParams.pageNumber - 1) * queryParams.pageSize;
    const limitCriteria = queryParams.pageSize;

    let saleDateFrom = null;
    let saleDateTo = null;
    if (
      queryParams.filter.hasOwnProperty('saleDateFrom') ||
      queryParams.filter.hasOwnProperty('saleDateTo')
    ) {
      saleDateFrom = queryParams.filter.saleDateFrom;
      saleDateTo = queryParams.filter.saleDateTo;
      delete queryParams.filter['saleDateFrom'];
      delete queryParams.filter['saleDateTo'];
    }

    let effectiveDateFrom = null;
    let effectiveDateTo = null;
    if (
      queryParams.filter.hasOwnProperty('effectiveDateFrom') ||
      queryParams.filter.hasOwnProperty('effectiveDateTo')
    ) {
      effectiveDateFrom = queryParams.filter.effectiveDateFrom;
      effectiveDateTo = queryParams.filter.effectiveDateTo;
      delete queryParams.filter['effectiveDateFrom'];
      delete queryParams.filter['effectiveDateTo'];
    }

    let expirationDateFrom = null;
    let expirationDateTo = null;
    if (
      queryParams.filter.hasOwnProperty('expirationDateFrom') ||
      queryParams.filter.hasOwnProperty('expirationDateTo')
    ) {
      expirationDateFrom = queryParams.filter.expirationDateFrom;
      expirationDateTo = queryParams.filter.expirationDateTo;
      delete queryParams.filter['expirationDateFrom'];
      delete queryParams.filter['expirationDateTo'];
    }

    let type = null;
    if (queryParams.filter.hasOwnProperty('type')) {
      type = queryParams.filter.type;
      delete queryParams.filter['type'];
    }

    let insured = null;
    if (queryParams.filter.hasOwnProperty('insured')) {
      insured = queryParams.filter.insured;
      delete queryParams.filter['insured'];
    }

    let carrier = null;
    if (queryParams.filter.hasOwnProperty('carrier')) {
      carrier = queryParams.filter.carrier;
      delete queryParams.filter['carrier'];
    }

    let broker = null;
    if (queryParams.filter.hasOwnProperty('broker')) {
      broker = queryParams.filter.broker;
      delete queryParams.filter['broker'];
    }

    let status = null;
    if (queryParams.filter.hasOwnProperty('status')) {
      status = queryParams.filter.status;
      delete queryParams.filter['status'];
    }

    let location = null;
    if (queryParams.filter.hasOwnProperty('location')) {
      location = queryParams.filter.location;
      delete queryParams.filter['location'];
    }

    let fixedQueries = [];
    let filterQueries = [];
    let conditions = {};

    conditions = {
      $and: [{ deleted: false }, { renewed: false }, { isEndorsement: false }],
    };
    if (
      saleDateFrom ||
      saleDateTo ||
      effectiveDateFrom ||
      effectiveDateTo ||
      expirationDateFrom ||
      expirationDateTo ||
      type ||
      insured ||
      carrier ||
      broker ||
      status ||
      location ||
      (queryParams.filter && Object.keys(queryParams.filter).length > 0)
    ) {
      if (saleDateFrom || saleDateTo) {
        conditions['$and'].push({
          soldAt: getDateMatchExpressionByDates(saleDateFrom, saleDateTo),
        });
      }

      if (effectiveDateFrom || effectiveDateTo) {
        conditions['$and'].push({
          policyEffectiveAt: getDateMatchExpressionByDates(effectiveDateFrom, effectiveDateTo),
        });
      }

      if (expirationDateFrom || expirationDateTo) {
        conditions['$and'].push({
          policyExpiresAt: getDateMatchExpressionByDates(expirationDateFrom, expirationDateTo),
        });
      }

      if (type) {
        conditions['$and'].push({ type: type });
      }

      if (insured) {
        conditions['$and'].push({ 'customer._id': Types.ObjectId(insured) });
      }

      if (broker) {
        conditions['$and'].push({
          items: { $elemMatch: { provider: Types.ObjectId(broker) } },
        });
      }

      if (carrier) {
        conditions['$and'].push({
          items: { $elemMatch: { subprovider: Types.ObjectId(carrier) } },
        });
      }

      if (status) {
        conditions['$and'].push({ status: status });
      }

      if (location) {
        conditions['$and'].push({ 'location._id': Types.ObjectId(location) });
      }

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

    if (filterQueries.length || fixedQueries.length) {
      conditions['$or'] = [...filterQueries, ...fixedQueries];
    }

    const query = this.saleModel.aggregate();

    query.unwind({ path: '$seller', preserveNullAndEmptyArrays: true }).lookup({
      from: 'users',
      localField: 'seller',
      foreignField: '_id',
      as: 'seller',
    });
    query.unwind({ path: '$seller', preserveNullAndEmptyArrays: true });

    query
      .unwind({ path: '$customer', preserveNullAndEmptyArrays: true })
      .lookup({
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customer',
      });

    query.unwind({ path: '$customer', preserveNullAndEmptyArrays: true });

    query
      .unwind({ path: '$location', preserveNullAndEmptyArrays: true })
      .lookup({
        from: 'locations',
        localField: 'location',
        foreignField: '_id',
        as: 'location',
      });

    query.unwind({ path: '$location', preserveNullAndEmptyArrays: true });

    if (conditions) {
      query.match(conditions);
    }

    query.append([
      {
        $project: {
          id: '$_id',
          code: '$code',
          createdAt: '$createdAt',
          customerName: {
            $function: {
              body: function (customer: Customer) {
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
          deleted: '$deleted',
          isEndorsement: '$isEndorsement',
          isRenewal: '$isRenewal',
          locationName: {
            $function: {
              body: function (location: Location) {
                return location ? location.business.name : 'N/A';
              },
              args: ['$location'],
              lang: 'js',
            },
          },
          policyNumber: '$policyNumber',
          policyEffectiveAt: '$policyEffectiveAt',
          policyExpiresAt: '$policyExpiresAt',
          premium: { $round: ['$premium', 2] },
          productName: {
            $function: {
              body: function (items: SaleItem[]) {
                return [
                  ...new Set(
                    items.map((item) =>
                      item.product
                        .toLowerCase()
                        .split(' ')
                        .map(function (word) {
                          return word.charAt(0).toUpperCase() + word.slice(1);
                        })
                        .join(' '),
                    ),
                  ),
                ].join('/');
              },
              args: ['$items'],
              lang: 'js',
            },
          },
          sellerName: {
            $concat: ['$seller.firstName', ' ', '$seller.lastName'],
          },
          soldAt: '$soldAt',
          status: '$status',
          totalCharge: { $round: ['$totalCharge', 2] },
          totalInsurance: { $round: ['$totalInsurance', 2] },
          type: '$type',
        },
      },
    ]);

    //console.log(JSON.stringify(query));

    query.skip(skipCriteria).limit(limitCriteria).sort(sortCriteria);

    const entities = await query.exec();

    return {
      entities: entities,
      totalCount: entities.length,
    };
  }

  /**
   * @param  {EndorseSaleDto} endorseSaleDto
   * @returns Promise
   */
  async endorse(endorseSaleDto: EndorseSaleDto): Promise<any> {
    //Store new endorsement with mandatory fields

    let saleDto: Partial<SaleDto> = { ...endorseSaleDto };

    if (!saleDto.isChargeItemized) {
      saleDto.items = saleDto.items.map((item) => ({
        ...item,
        amount: 0,
        premium: 0,
        profits: 0,
      }));
    }

    const insurers = await this.insurerModel.find({}).exec();

    const originalSale: Partial<Sale> = await this.saleModel
      .findOne({ _id: saleDto.endorsementReference })
      .exec();

    if (!originalSale) {
      throw new NotFoundException(
        `Cannot find endorsed sale: ${saleDto.endorsementReference}`,
      );
    }

    let endorsedItems = saleDto.items;

    if (saleDto.items && originalSale.items) {
      let newEndorsedItems: SaleItem[] = saleDto.items.map((item) => {
        let originalMatchingItem = originalSale.items.find(
          (originalItem) => originalItem.product === item.product,
        );
        if (originalMatchingItem) {
          //replace item with difference to original
          item.premium = item.premium - originalMatchingItem.premium;
          return { ...item };
        } else {
          return item;
        }
      });
      saleDto.items = newEndorsedItems;
    }

    let saleData = await setSaleCalculations(saleDto, insurers);

    let result = {
      endorsement: await this.saleModel.create({
        ...saleData,
        soldAt: new Date(),
        createdBy: { _id: this.req.user.id },
        company: { _id: this.req.user.company },
      }),
    };

    let newOriginal = {
      ...originalSale['_doc'],
      items: endorsedItems,
      updatedBy: this.req.user.id,
    };

    let newOriginalData: any = await setSaleCalculations(newOriginal, insurers);

    result['endorsed'] = await this.saleModel.findOneAndUpdate(
      { _id: saleDto.endorsementReference },
      {
        ...newOriginalData,
      },
      { new: true },
    );

    return result;
  }

  /**
   * @param  {CreateSaleDto} saleDto
   * @returns Promise
   */
  async renew(code: string, createSaleDto: CreateSaleDto): Promise<Sale> {
    let saleDto: Partial<SaleDto> = { ...createSaleDto };

    if (!saleDto.isChargeItemized) {
      saleDto.items = saleDto.items.map((item) => ({
        ...item,
        amount: 0,
        premium: 0,
        profits: 0,
      }));
    }

    const updated: Partial<Sale> = await this.saleModel
      .findOneAndUpdate({ code: code }, { renewed: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(
        `Cannot renew sale:${code} because is missing. `,
      );
    }

    if (
      !saleDto.seller ||
      (saleDto.seller && !isAdmin(this.req.user) && !isExecutive(this.req.user))
    ) {
      saleDto.seller = this.req.user.id;
      saleDto.location = this.req.user.location;
    } else {
      const seller = await this.userModel.findOne({ _id: saleDto.seller });
      if (!seller) {
        throw new ConflictException('Seller not found');
      }
      saleDto.seller = seller._id;
      saleDto.location = seller.location;
    }

    saleDto.renewalReference = updated.id;

    const insurers = await this.insurerModel.find({}).exec();
    let saleData = await setSaleCalculations(saleDto, insurers);

    return this.saleModel.create({
      ...saleData,
      createdBy: { _id: this.req.user.id },
      company: { _id: this.req.user.company },
    });
  }
}
