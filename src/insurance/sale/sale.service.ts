import {
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
import { CUSTOMER_MODEL, SALE_MODEL,USER_MODEL,} from '../../database/database.constants';
import { CreateSaleDto } from './create-sale.dto';
import { UpdateSaleDto } from './update-sale.dto';
import * as DateFactory from 'shared/util/date-functions';
import { Customer } from 'database/customer.model';
import { isAdmin, isSeller } from 'shared/util/user-functions';
import { getDateMatchExpressionByDates } from 'shared/util/aggregator-functions';

@Injectable({ scope: Scope.REQUEST })
export class SaleService {
  constructor(
    @Inject(SALE_MODEL) private saleModel: Model<Sale>,
    @Inject(REQUEST) private req: AuthenticatedRequest,
  ) {}

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

    if (!isAdmin(user)) {
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

      .project({
        type: '$type',
        soldAt: '$soldAt',
        liabilityCharge: { $round: ['$liabilityCharge', 2] },
        cargoCharge: { $round: ['$cargoCharge', 2] },
        physicalDamageCharge: { $round: ['$physicalDamageCharge', 2] },
        wcGlUmbCharge: { $round: ['$wcGlUmbCharge', 2] },
        fees: { $round: ['$fees', 2] },
        permits: { $round: ['$permits', 2] },
        tips: { $round: ['$tips', 2] },
        chargesPaid: { $round: ['$chargesPaid', 2] },
        premium: { $round: ['$premium', 2] },
        amountReceivable: { $round: ['$amountReceivable', 2] },
        totalCharge: { $round: ['$totalCharge', 2] },
        sellerName: { $concat: ['$seller.firstName', ' ', '$seller.lastName'] },
        createdBy: '$createdBy',
        updatedBy: '$updatedBy',
        seller: 1,
        customer: 1,
        liabilityInsurer: 1,
        cargoInsurer: 1,
        physicalDamageInsurer: 1,
        wcGlUmbInsurer: 1,
      })
      .sort({ soldAt: -1 });

    return query;
  }

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

  save(data: CreateSaleDto, user: Partial<User>): Observable<Sale> {
    if ((isAdmin(user) && !data.seller) || isSeller(user)) {
      data.seller = user.id;
    }

    const createSale = this.saleModel.create({
      ...data,
    });

    return from(createSale);
  }

  update(
    id: string,
    data: UpdateSaleDto,
    user: Partial<User>,
  ): Observable<Sale> {
    if ((isAdmin(user) && !data.seller) || isSeller(user)) {
      {
        data.seller = user.id;
      }

      return from(
        this.saleModel
          .findOneAndUpdate({ _id: id }, { ...data }, { new: true })
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
      ? {
          $gte: new Date(dates.start + 'T00:00:00.000Z'),
          $lte: new Date(dates.end + 'T23:59:59.999Z'),
        }
      : { $lte: new Date() };
  }

  getDateMatchExpressionByDates(startDate?: string, endDate?: string): any {
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
}
