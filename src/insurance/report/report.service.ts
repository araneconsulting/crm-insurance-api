import { ConflictException, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { Customer } from 'database/customer.model';
import { Sale } from 'database/sale.model';
import { User } from 'database/user.model';
import { Model, Types } from 'mongoose';
import { SALE_MODEL, USER_MODEL, CUSTOMER_MODEL } from '../../database/database.constants';
import * as DateFactory from 'shared/util/date-factory';
import { MetricsLayout } from 'shared/enum/metrics-layout.enum';


@Injectable({ scope: Scope.REQUEST })
export class ReportService {
  constructor(
    @Inject(SALE_MODEL) private saleModel: Model<Sale>,
    @Inject(USER_MODEL) private userModel: Model<User>,
    @Inject(CUSTOMER_MODEL) private customerModel: Model<Customer>,
  ) { }

  async getSalesMetrics(user: Partial<User>, dateRange?: string, filterField?: string, filterValue?: string, metricsLayout: string = MetricsLayout.FULL): Promise<any> {

    const filterConditions = {};
    let seller: Partial<User> = null;
    let customer: Partial<Customer> = null;
    let location: string = null;

    switch (filterField) {
      case 'seller':
        seller = await this.userModel.findById(filterValue).exec();
        if (!seller) {
          throw new NotFoundException(`Seller: ${filterValue} not found`)
        }
        filterConditions["seller"] = Types.ObjectId(seller.id);
        break;

      case 'customer':
        customer = await this.customerModel.findById(filterValue).exec();
        if (!customer) {
          throw new NotFoundException(`Customer: ${filterValue} not found`)
        }
        filterConditions["customer"] = Types.ObjectId(customer.id);
        break;

      case 'location':
        location = filterValue;
        filterConditions["seller.location"] = location;
        break;
    }

    const id = this.getIdByMetricsLayout(metricsLayout);
    filterConditions["soldAt"] = this.getDateMatchExpression(dateRange).soldAt;

    const query = this.saleModel.aggregate();

    if (seller || customer) {
      query.match(filterConditions);
    }

    query
      .unwind({ "path": "$seller", "preserveNullAndEmptyArrays": true })
      .lookup({
        "from": "users",
        "localField": "seller",
        "foreignField": "_id",
        "as": "seller"
      })
      .unwind({ "path": "$seller", "preserveNullAndEmptyArrays": true })

    if (location) {
      query.match(filterConditions);
    }

    query.unwind({ "path": "$customer", "preserveNullAndEmptyArrays": true })
      .lookup({
        "from": "customers",
        "localField": "customer",
        "foreignField": "_id",
        "as": "customer"
      })
    query.unwind({ "path": "$customer", "preserveNullAndEmptyArrays": true })

    query
      .group(
        {
          "_id": id,
          "liabilityCharge": { "$sum": "$liabilityCharge" },
          "cargoCharge": { "$sum": "$cargoCharge" },
          "physicalDamageCharge": { "$sum": "$physicalDamageCharge" },
          "wcGlUmbCharge": { "$sum": "$wcGlUmbCharge" },
          "tips": { "$sum": "$tips" },
          "permits": { "$sum": "$permits" },
          "fees": { "$sum": "$fees" },
          "sellerBonus": { "$sum": "$sellerBonus" },
          "downPayment": { "$sum": "$downPayment" },
          "netProfit": { "$sum": "$netProfit" },
          "grossProfit": { "$sum": "$grossProfit" },
          "amountReceivable": { "$sum": "$amountReceivable" },
          "sales": { "$sum": 1 }
        }
      );

    console.log(query);

    return query;
  }

  async getAllSales(user: Partial<User>, dateRange?: string, filterField?: string, filterValue?: string): Promise<any> {


    const filterConditions = {};
    let seller: Partial<User> = null;
    let customer: Partial<Customer> = null;
    let location: string = null;

    switch (filterField) {
      case 'seller':
        seller = await this.userModel.findById(filterValue).exec();
        if (!seller) {
          throw new NotFoundException(`Seller: ${filterValue} not found`)
        }
        filterConditions["seller"] = Types.ObjectId(seller.id);
        break;

      case 'customer':
        customer = await this.customerModel.findById(filterValue).exec();
        if (!customer) {
          throw new NotFoundException(`Customer: ${filterValue} not found`)
        }
        filterConditions["customer"] = Types.ObjectId(customer.id);
        break;

      case 'location':
        location = filterValue;
        filterConditions["seller.location"] = location;
        break;
    }

    filterConditions["soldAt"] = this.getDateMatchExpression(dateRange).soldAt;

    const query = this.saleModel.aggregate();

    if (seller || customer) {
      query.match(filterConditions);
    }

    query
      .unwind({ "path": "$seller", "preserveNullAndEmptyArrays": true })
      .lookup({
        "from": "users",
        "localField": "seller",
        "foreignField": "_id",
        "as": "seller"
      })
      .unwind({ "path": "$seller", "preserveNullAndEmptyArrays": true })

    if (location) {
      query.match(filterConditions);
    }

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
        "from": "insurer",
        "localField": "liabilityInsurer",
        "foreignField": "_id",
        "as": "liabilityInsurer"
      })
      .unwind({ "path": "$liabilityInsurer", "preserveNullAndEmptyArrays": true })

      .unwind({ "path": "$cargoInsurer", "preserveNullAndEmptyArrays": true })
      .lookup({
        "from": "insurer",
        "localField": "cargoInsurer",
        "foreignField": "_id",
        "as": "cargoInsurer"
      })
      .unwind({ "path": "$cargoInsurer", "preserveNullAndEmptyArrays": true })

      .unwind({ "path": "$physicalDamageInsurer", "preserveNullAndEmptyArrays": true })
      .lookup({
        "from": "insurer",
        "localField": "physicalDamageInsurer",
        "foreignField": "_id",
        "as": "physicalDamageInsurer"
      })
      .unwind({ "path": "$physicalDamageInsurer", "preserveNullAndEmptyArrays": true })

      .unwind({ "path": "$wcGlUmbInsurer", "preserveNullAndEmptyArrays": true })
      .lookup({
        "from": "insurer",
        "localField": "wcGlUmbInsurer",
        "foreignField": "_id",
        "as": "wcGlUmbInsurer"
      })
      .unwind({ "path": "$wcGlUmbInsurer", "preserveNullAndEmptyArrays": true })

      .project(
        {
          'soldAt': '$soldAt',
          'liabilityCharge': '$liabilityCharge',
          'cargoCharge': '$cargoCharge',
          'physicalDamageCharge': '$physicalDamageCharge',
          'wcGlUmbCharge': '$wcGlUmbCharge',
          'fees': '$fees',
          'permits': '$permits',
          'tips': '$tips',
          'chargesPaid': '$chargesPaid',
          'downPayment': '$downPayment',
          'sellerBonus': '$sellerBonus',
          'amountReceivable': '$amountReceivable',
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
      .sort({soldAt:-1})


    return query;
  }


  getIdByMetricsLayout(layout: string): any {
    switch (layout) {
      case MetricsLayout.BY_SELLER:
        return {
          "id": "$seller._id",
          "firstName": "$seller.firstName",
          "lastName": "$seller.lastName",
          "location": "$seller.location"
        };
        break;
      case MetricsLayout.BY_CUSTOMER:
        return {
          "id": "$customer._id",
          "name": "$customer.name",
          "isCompany": "$customer.isCompany"
        };
        break;
      case MetricsLayout.BY_LOCATION:
        return {
          "location": "$seller.location"
        };
    }
    return null;
  }

  getDateMatchExpression(dateRange: string): any {

    //Set filtering conditions
    const dates = DateFactory.dateRangeByName(dateRange);

    const expression = dateRange
      ? { $gte: new Date(dates.start), $lte: new Date(dates.end) }
      : { $lte: new Date() };

    return {
      "soldAt": expression
    }
  }
}


