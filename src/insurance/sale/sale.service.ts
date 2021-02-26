import { ExecutionContext, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Sale } from 'database/sale.model';
import { User } from 'database/user.model';
import { Model, Types } from 'mongoose';
import { EMPTY, from, Observable, of } from 'rxjs';
import { mergeMap, throwIfEmpty } from 'rxjs/operators';
import { RoleType } from 'shared/enum/role-type.enum';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';
import { CUSTOMER_MODEL, SALE_MODEL, USER_MODEL } from '../../database/database.constants';
import { CreateSaleDto } from './create-sale.dto';
import { UpdateSaleDto } from './update-sale.dto';
import * as DateFactory from 'shared/util/date-factory';
import { Customer } from 'database/customer.model';

@Injectable({ scope: Scope.REQUEST })
export class SaleService {
  constructor(
    @Inject(SALE_MODEL) private saleModel: Model<Sale>,
    @Inject(USER_MODEL) private userModel: Model<User>,
    @Inject(CUSTOMER_MODEL) private customerModel: Model<Customer>,
    @Inject(REQUEST) private req: AuthenticatedRequest,
  ) { }

  async getAllSales(user: Partial<User>, startDate?: string, endDate?: string): Promise<any> {

    const filterConditions = {
      "soldAt": this.getDateMatchExpressionByDates(startDate, endDate)
    };

    console.log(filterConditions.soldAt)

    const query = this.saleModel.aggregate();
    query.match(filterConditions);

    query
      .unwind({ "path": "$seller", "preserveNullAndEmptyArrays": true })
      .lookup({
        "from": "users",
        "localField": "seller",
        "foreignField": "_id",
        "as": "seller"
      })
      .unwind({ "path": "$seller", "preserveNullAndEmptyArrays": true })

    query
      .unwind({ "path": "$customer", "preserveNullAndEmptyArrays": true })
      .lookup({
        "from": "customers",
        "localField": "customer",
        "foreignField": "_id",
        "as": "customer"
      })
      .unwind({ "path": "$customer", "preserveNullAndEmptyArrays": true })

      .unwind({ "path": "$liabilityInsurer", "preserveNullAndEmptyArrays": true })
      .lookup({
        "from": "insurers",
        "localField": "liabilityInsurer",
        "foreignField": "_id",
        "as": "liabilityInsurer"
      })
      .unwind({ "path": "$liabilityInsurer", "preserveNullAndEmptyArrays": true })

      .unwind({ "path": "$cargoInsurer", "preserveNullAndEmptyArrays": true })
      .lookup({
        "from": "insurers",
        "localField": "cargoInsurer",
        "foreignField": "_id",
        "as": "cargoInsurer"
      })
      .unwind({ "path": "$cargoInsurer", "preserveNullAndEmptyArrays": true })

      .unwind({ "path": "$physicalDamageInsurer", "preserveNullAndEmptyArrays": true })
      .lookup({
        "from": "insurers",
        "localField": "physicalDamageInsurer",
        "foreignField": "_id",
        "as": "physicalDamageInsurer"
      })
      .unwind({ "path": "$physicalDamageInsurer", "preserveNullAndEmptyArrays": true })

      .unwind({ "path": "$wcGlUmbInsurer", "preserveNullAndEmptyArrays": true })
      .lookup({
        "from": "insurers",
        "localField": "wcGlUmbInsurer",
        "foreignField": "_id",
        "as": "wcGlUmbInsurer"
      })
      .unwind({ "path": "$wcGlUmbInsurer", "preserveNullAndEmptyArrays": true })

      .project(
        {
          'soldAt': '$soldAt',
          'liabilityCharge': { "$round": ['$liabilityCharge', 2]},
          'cargoCharge': { "$round": ['$cargoCharge', 2]},
          'physicalDamageCharge':  { "$round": ['$physicalDamageCharge', 2]},
          'wcGlUmbCharge':  { "$round": ['$wcGlUmbCharge', 2]},
          'fees':  { "$round": ['$fees', 2]},
          'permits':  { "$round": ['$permits', 2]},
          'tips':  { "$round": ['$tips', 2]},
          'chargesPaid':  { "$round": ['$chargesPaid', 2]},
          'downPayment':  { "$round": ['$downPayment', 2]},
          'amountReceivable':  { "$round": ['$amountReceivable', 2]},
          'sellerBonus': '$sellerBonus',
          'premium': { "$round":{ "$sum": ["$liabilityCharge", "$cargoCharge", "$physicalDamageCharge", "$wcGlUmbCharge"] }},
          'sellerName': { "$concat":["$seller.firstName", " ", "$seller.lastName"]},
          'createdBy': '$createdBy',
          'updatedBy': '$updatedBy',
          'seller': 1,
          'customer': 1,
          'liabilityInsurer': 1,
          'cargoInsurer': 1,
          'physicalDamageInsurer': 1,
          'wcGlUmbInsurer': 1,
        }
      )
      .sort({ soldAt: -1 })


    return query;
  }

  findAll(
    user: Partial<User>,
    //keyword?: string, 
    skip = 0,
    limit = 0,
    withSeller = false,
    withCustomer = false,
    withInsurers = false,
    dateRange?: string
  ): Observable<Sale[]> {

    const userRole = user.roles && user.roles[0] ? user.roles[0] : RoleType.USER;

    const dates = DateFactory.dateRangeByName(dateRange);

    const expression = {};
    expression['soldAt'] = dateRange
      ? { $gte: new Date(dates.start), $lte: new Date(dates.end) }
      : { $lte: new Date() };


    if (userRole == RoleType.USER) {
      expression['seller'] = user.id;
    }

    const saleQuery = this.saleModel
      .find(expression)
      .skip(skip)
      .limit(limit);

    if (withSeller) {
      saleQuery.populate({ path: "seller" });
    }

    if (withCustomer) {
      saleQuery.populate("customer");
    }

    if (withInsurers) {
      saleQuery.populate("liabilityInsurer");
      saleQuery.populate("cargoInsurer");
      saleQuery.populate("physicalDamageInsurer");
      saleQuery.populate("wcGlUmbInsurer");
    }

    saleQuery.sort({ soldAt: 'desc'});

    return from(saleQuery.exec());
  }

  findById(id: string, withSeller = false, withCustomer = false, withInsurers = false): Observable<Sale> {

    const saleQuery = this.saleModel.findOne({ _id: id });

    if (withSeller) {
      saleQuery.populate("seller");
    }

    if (withCustomer) {
      saleQuery.populate("customer");
    }

    if (withInsurers) {
      saleQuery.populate("liabilityInsurer");
      saleQuery.populate("cargoInsurer");
      saleQuery.populate("physicalDamageInsurer");
      saleQuery.populate("wcGlUmbInsurer");
    }

    return from(saleQuery.exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`sale:$id was not found`)),
    );
  }

  save(data: CreateSaleDto, user: Partial<User>): Observable<Sale> {
    if (user.roles[0] == 'USER') {
      data.seller = user.id;
    } else if (user.roles[0] == 'ADMIN') {
      if (!data.seller) {
        data.seller = user.id;
      }
    }
    const createSale = this.saleModel.create({
      ...data
    });

    return from(createSale);
  }

  update(id: string, data: UpdateSaleDto, user: Partial<User>): Observable<Sale> {

    if (user.roles[0] == 'USER') {
      data.seller = user.id;
    } else if (user.roles[0] == 'ADMIN') {
      if (!data.seller) {
        data.seller = user.id;
      }
    }

    return from(
      this.saleModel
        .findOneAndUpdate(
          { _id: id },
          { ...data },
          { new: true },
        )
        .exec(),
    ).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`sale:$id was not found`)),
    );


    // const filter = { _id: id };
    // const update = { ...data, updatedBy: { _id: this.req.user.id } };
    // return from(this.saleModel.findOne(filter).exec()).pipe(
    //   mergeMap((sale) => (sale ? of(sale) : EMPTY)),
    //   throwIfEmpty(() => new NotFoundException(`sale:$id was not found`)),
    //   switchMap((p, i) => {
    //     return from(this.saleModel.updateOne(filter, update).exec());
    //   }),
    //   map((res) => res.nModified),
    // );
  }

  deleteById(id: string): Observable<Sale> {
    return from(this.saleModel.findOneAndDelete({ _id: id }).exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`sale:$id was not found`)),
    );
    // const filter = { _id: id };
    // return from(this.saleModel.findOne(filter).exec()).pipe(
    //   mergeMap((sale) => (sale ? of(sale) : EMPTY)),
    //   throwIfEmpty(() => new NotFoundException(`sale:$id was not found`)),
    //   switchMap((p, i) => {
    //     return from(this.saleModel.deleteOne(filter).exec());
    //   }),
    //   map((res) => res.deletedCount),
    // );
  }

  deleteAll(): Observable<any> {
    return from(this.saleModel.deleteMany({}).exec());
  }

  getDateMatchExpressionByRange(dateRange: string): any {

    //Set filtering conditions
    const dates = DateFactory.dateRangeByName(dateRange);

    return dateRange
      ? { $gte: new Date(dates.start+'T00:00:00.000Z'), $lte: new Date(dates.end+'T23:59:59.999Z') }
      : { $lte: new Date() };    
  }

  getDateMatchExpressionByDates(startDate?: string, endDate?:string): any {
    if (startDate && endDate){
      return { $gte: new Date(startDate+'T00:00:00.000Z'), $lte: new Date(endDate+'T23:59:59.999Z') }
    } else if (startDate){
      return { $gte: new Date(startDate+'T00:00:00.000Z')}
    } else if (endDate){
      return { $lte: new Date(endDate+'T23:59:59.999Z')}
    } else return { $lte: new Date() };    
  }
}
