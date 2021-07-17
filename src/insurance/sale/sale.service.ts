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
  ENDORSEMENT_MODEL,
  USER_MODEL,
} from '../../database/database.constants';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleDto } from './dto/sale.dto';
import { isAdmin, isExecutive } from 'shared/util/user-functions';
import { getDateMatchExpressionByDates } from 'shared/util/aggregator-functions';
import { Insurer } from 'database/insurer.model';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { setSaleCalculations } from './sale.utils';
import { SaleItem } from 'business/sub-docs/sale-item';
import { Location } from 'database/location.model';
import { Customer } from 'database/customer.model';
import { EndorsementDto } from './dto/endorsement.dto';
import { Endorsement } from 'database/endorsement.model';

const SALE_LAYOUT_DEFAULT = 'NORMAL';
const SALE_LAYOUT_FULL = 'FULL';
@Injectable({ scope: Scope.REQUEST })
export class SaleService {
  constructor(
    @Inject(SALE_MODEL) private saleModel: Model<Sale>,
    @Inject(ENDORSEMENT_MODEL) private endorsementModel: Model<Endorsement>,
    @Inject(INSURER_MODEL) private insurerModel: Model<Insurer>,
    @Inject(USER_MODEL) private userModel: Model<User>,
    @Inject(REQUEST) private req: AuthenticatedRequest,
  ) {}

  /**
   * @param  {string} startDate?
   * @param  {string} endDate?
   * @param  {string} lineOfBusiness?
   * @returns Promise
   */
  async findAll(): Promise<any> {
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
            lineOfBusiness: '$lineOfBusiness',
            soldAt: '$soldAt',
            fees: { $round: ['$fees', 2] },
            tips: { $round: ['$tips', 2] },
            chargesPaid: { $round: ['$chargesPaid', 2] },
            premium: { $round: ['$premium', 2] },
            amountReceivable: { $round: ['$amountReceivable', 2] },
            totalCharge: { $round: ['$totalCharge', 2] },
            downPayment: { $round: ['$downPayment', 2] },
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
  ): Promise<any> {
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

    const sale: Partial<Sale> = await saleQuery.exec();

    if (!sale) {
      throw new NotFoundException(`sale with code:${code} was not found`);
    }

    let saleDto: Partial<SaleDto> = {...sale['_doc']};

    saleDto.endorsements = await this.endorsementModel
      .find({ policy: sale._id })
      .exec();

      console.log('endorsements:', saleDto.endorsements);

    return saleDto;
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
  ): Promise<Partial<any>> {
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

    let sale: Partial<any> = await saleQuery.exec();

    if (!sale) {
      throw new NotFoundException(`sale:${id} was not found`);
    }

    if (layout === SALE_LAYOUT_FULL) {
      sale.endorsements = await this.endorsementModel
        .find({ policy: sale.id })
        .exec();
    }

    return sale;
  }

  /**
   * @param  {CreateSaleDto} saleDto
   * @returns Promise
   */
  async save(createSaleDto: CreateSaleDto): Promise<Partial<SaleDto>> {
    let saleDto: Partial<SaleDto> = { ...createSaleDto };

    if (!saleDto.isChargeItemized) {
      saleDto.items = saleDto.items.map((item) => {
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

    const endorsements: Partial<EndorsementDto>[] = saleData.endorsements;

    if (endorsements) {
      delete saleData['endorsements'];
    }

    const created: any = await this.saleModel.create({
      ...saleData,
      createdBy: { _id: this.req.user.id },
      company: { _id: this.req.user.company },
    });

    const createdSaleDto: Partial<SaleDto> = { ...created['_doc'] };


    await this.processEndorsements(endorsements, created, createdSaleDto);

    return createdSaleDto;
  }

  
  /**
   * @param  {string} code
   * @param  {UpdateSaleDto} data
   * @returns Promise
   */
  async update(code: string, updateSaleDto: UpdateSaleDto): Promise<Partial<SaleDto>> {
    let saleDto: Partial<SaleDto> = { ...updateSaleDto };

    if (!saleDto.isChargeItemized && saleDto.items) {
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

    let sale: Partial<Sale> = await this.saleModel
      .findOne({ code: code })
      .exec();

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
    const saleData: any = await setSaleCalculations(saleDto, insurers);

    const endorsements: Partial<EndorsementDto>[] = saleData.endorsements;
    if (endorsements) {
      delete saleData['endorsements'];
    }

    const updated = await this.saleModel.findOneAndUpdate(
      { _id: Types.ObjectId(sale.id) },
      {
        ...saleData,
      },
      { new: true },
    );

    const updatedSaleDto: Partial<SaleDto> = { ...updated['_doc'] };

    await this.processEndorsements(endorsements, updated, updatedSaleDto);

    return updatedSaleDto;
  }

  /**
   * @param  {string} code
   * @returns Observable
   */
  async deleteByCode(code: string): Promise<Sale> {
    let sale: Partial<Sale> = await this.saleModel
      .findOne({ code: code })
      .exec();

    if (!sale) {
      throw new NotFoundException(`sale:${code} was not found`);
    }

    const deleteEndorsementsResult = this.endorsementModel
      .deleteMany({ policy: sale.id })
      .exec();

    console.log(
      'Delete all sale endorsements result: ',
      deleteEndorsementsResult,
    );

    return this.saleModel.findOneAndDelete({ code: code }).exec();
  }

  /**
   * @returns Observable
   */

  deleteAll(): Observable<any> {
    this.endorsementModel.deleteMany({}).exec();
    return from(this.saleModel.deleteMany({}).exec());
  }

  /**
   * @returns Observable
   */

  async batchDelete(codes: string[]): Promise<any> {
    //TODO: Delete all endorsements with (get all policies by codes, then delete all endorsement by policy Id)

    return this.saleModel.deleteMany({ code: { $in: codes } }).exec();
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

    let lineOfBusiness = null;
    if (queryParams.filter.hasOwnProperty('lineOfBusiness')) {
      lineOfBusiness = queryParams.filter.lineOfBusiness;
      delete queryParams.filter['lineOfBusiness'];
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
      $and: [{ deleted: false }, { renewed: false }],
    };
    if (
      saleDateFrom ||
      saleDateTo ||
      effectiveDateFrom ||
      effectiveDateTo ||
      expirationDateFrom ||
      expirationDateTo ||
      lineOfBusiness ||
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
          policyEffectiveAt: getDateMatchExpressionByDates(
            effectiveDateFrom,
            effectiveDateTo,
          ),
        });
      }

      if (expirationDateFrom || expirationDateTo) {
        conditions['$and'].push({
          policyExpiresAt: getDateMatchExpressionByDates(
            expirationDateFrom,
            expirationDateTo,
          ),
        });
      }

      if (type) {
        conditions['$and'].push({ type: type });
      }

      if (lineOfBusiness) {
        conditions['$and'].push({ lineOfBusiness: lineOfBusiness });
      }

      if (insured) {
        conditions['$and'].push({ 'customer._id': Types.ObjectId(insured) });
      }

      if (broker) {
        conditions['$and'].push({
          items: { $elemMatch: { broker: Types.ObjectId(broker) } },
        });
      }

      if (carrier) {
        conditions['$and'].push({
          items: { $elemMatch: { carrier: Types.ObjectId(carrier) } },
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
          coverages: {
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
          downPayment: { $round: ['$downPayment', 2] },
          lineOfBusiness: '$lineOfBusiness',
          type: '$type',
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

  /**
   * @param  {EndorsementDto} endorsementDto
   * @returns Promise
   */
  async addEndorsement(endorsementDto: EndorsementDto): Promise<Endorsement> {
    //TODO: set accountingClass by type value
    //TODO: update sale calculations based on endorsement

    return this.endorsementModel.create({
      ...endorsementDto,
      createdBy: { _id: this.req.user.id },
      company: { _id: this.req.user.company },
    });
  }

  /**
   * @param  {CreateSaleDto} saleDto
   * @returns Promise
   */
  async renew(code: string, createSaleDto: CreateSaleDto): Promise<Partial<SaleDto>> {
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

    const endorsements: Partial<EndorsementDto>[] = saleData.endorsements;

    if (endorsements) {
      delete saleData['endorsements'];
    }    

    let created: any = this.saleModel.create({
      ...saleData,
      createdBy: { _id: this.req.user.id },
      company: { _id: this.req.user.company },
    });

    const createdSaleDto: Partial<SaleDto> = { ...created['_doc'] };

    await this.processEndorsements(endorsements, created, createdSaleDto);

    return createdSaleDto;

  }

  async upsertAndDeleteEndorsements(
    endorsements: Partial<EndorsementDto>[],
    policy: Partial<Sale>,
  ) {
    let endorsementDocs: any[] = [];

    const user = this.req.user.id;
    const company = this.req.user.company;

    endorsements.forEach((endorsement) => {

      if (!endorsement.followUpPerson || endorsement.followUpPerson===''){
        delete endorsement['followUpPerson'];
      }

      if (endorsement.items){
        endorsement.items = endorsement.items.map(item => {
          if (!item.followUpPerson || item.followUpPerson===''){
            delete item['followUpPerson'];
          }
          return item;
        })
      }

      const markedToDelete = endorsement.markedToDelete;
      delete endorsement['markedToDelete'];

      if (endorsement.code) {
        endorsement = {
          ...endorsement,
          updatedBy: user,
        };
        endorsementDocs.push({
          updateOne: {
            filter: { code: endorsement.code },
            update: endorsement,
            upsert: true,
          },
        });
      } else if (markedToDelete) {
        endorsementDocs.push({
          deleteOne: {
            filter: { code: endorsement.code },
          },
        });
      } else {
        endorsement = {
          ...endorsement,
          createdBy: user,
          company: company,
          policy: policy,
        };
        endorsementDocs.push({
          insertOne: {
            document: endorsement,
          },
        });
      }
    });

    let endorsementUpsertResult = await this.endorsementModel.bulkWrite(
      endorsementDocs,
    );
    return endorsementUpsertResult;
  }

  private async processEndorsements(endorsements: Partial<EndorsementDto>[], sale: any, saleDto: Partial<SaleDto>) {
    if (endorsements) {
      const endorsementUpsertResult = await this.upsertAndDeleteEndorsements(
        endorsements,
        sale
      );

      if (endorsementUpsertResult.result['ok'] !== endorsements.length) {
        console.log('Endorsement upsert failed at least in one of them');
        console.log('Results: ', endorsementUpsertResult);
      }

      saleDto.endorsements = await this.endorsementModel
        .find({ policy: sale.id })
        .exec();
    }
  }

}
