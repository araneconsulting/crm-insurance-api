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

  async getSalesMetrics(user: Partial<User>, startDate?: string, endDate?: string, filterField?: string, filterValue?: string, metricsLayout: string = MetricsLayout.FULL): Promise<any> {

    let seller: Partial<User> = null;
    let customer: Partial<Customer> = null;
    let location: string = null;

    const filterConditions = {
      "soldAt": this.getDateMatchExpressionByDates(startDate, endDate)
    };

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

    const query = this.saleModel.aggregate();

    if ((!seller && !customer && !location) || (seller || customer)) {
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
          "chargesPaid": { "$sum": "$chargesPaid" },
          "sellerBonus": { "$sum": "$sellerBonus" },
          "downPayment": { "$sum": "$downPayment" },
          "netProfit": { "$sum": "$netProfit" },
          "grossProfit": { "$sum": "$grossProfit" },
          "amountReceivable": { "$sum": "$amountReceivable" },
          'premium': { "$sum": { "$sum": ["$liabilityCharge", "$cargoCharge", "$physicalDamageCharge", "$wcGlUmbCharge"] } },

          "sales": { "$sum": 1 }
        }
      );

    return query;
  }

  async getAllSales(user: Partial<User>, startDate?: string, endDate?: string, filterField?: string, filterValue?: string): Promise<any> {

    const filterConditions = {
      "soldAt": this.getDateMatchExpressionByDates(startDate, endDate)
    };
    
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

    

    const query = this.saleModel.aggregate();

    if ((!seller && !customer && !location) || (seller || customer)) {
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
          'liabilityCharge': '$liabilityCharge',
          'cargoCharge': '$cargoCharge',
          'physicalDamageCharge': '$physicalDamageCharge',
          'wcGlUmbCharge': '$wcGlUmbCharge',
          'fees': '$fees',
          'permits': '$permits',
          'tips': '$tips',
          'chargesPaid': '$chargesPaid',
          'downPayment': '$downPayment',
          'amountReceivable': '$amountReceivable',
          'sellerBonus': '$sellerBonus',
          'premium': { "$sum": ["$liabilityCharge", "$cargoCharge", "$physicalDamageCharge", "$wcGlUmbCharge"] },
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


}

