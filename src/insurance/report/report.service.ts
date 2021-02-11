import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Customer } from 'database/customer.model';
import { Insurer } from 'database/insurer.model';
import { Sale } from 'database/sale.model';
import { User } from 'database/user.model';
import { Model } from 'mongoose';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';
import { CUSTOMER_MODEL, INSURER_MODEL, SALE_MODEL, USER_MODEL } from '../../database/database.constants';
import * as DateFactory from 'shared/util/date-factory';
import { RoleType } from 'shared/enum/role-type.enum';


@Injectable({ scope: Scope.REQUEST })
export class ReportService {
  constructor(
    @Inject(INSURER_MODEL) private reportModel: Model<Insurer>,
    @Inject(CUSTOMER_MODEL) private customerModel: Model<Customer>,
    @Inject(USER_MODEL) private insurerModel: Model<User>,
    @Inject(SALE_MODEL) private saleModel: Model<Sale>,
    @Inject(REQUEST) private req: AuthenticatedRequest,
  ) { }

  async salesReport(user: Partial<User>) {

    //const dates: string[] = DateFactory.dateRangeByName(dateRangeCode);

    return this.saleModel.aggregate([
      {
        "$match":
        {
          //"soldAt": { "$gte": dates[0], "$lte": dates[1] }
        }
      },
      { "$unwind": "$seller" },
      {
        "$lookup": {
          "from": "users", // <-- collection to join
          "localField": "seller",
          "foreignField": "_id",
          "as": "seller"
        }
      },
      { "$unwind": "$seller" },
      {
        "$match": { "seller.email": user.email },
      },
      {
        "$group": {
          "_id": {
            "id": "$seller.id",
            "firstName": "$seller.firstName",
            "lastName": "$seller.lastName",
          },

          "liabilityCharge": { "$sum": "$liabilityCharge" },
          "cargoCharge": { "$sum": "$cargoCharge" },
          "physicalDamageCharge": { "$sum": "$physicalDamageCharge" },
          "wcGlUmbCharge": { "$sum": "$wcGlUmbCharge" },
          "tips": { "$sum": "$tips" },
          "permits": { "$sum": "$permits" },
          "fees": { "$sum": "$fees" },
          "sellerBonus": { "$sum": "$sellerBonus" },

          "totalCharge": { "$sum": "$totalCharge" },
          "netProfit": { "$sum": "$netProfit" },
          "grossProfit": { "$sum": "$grossProfit" },
          "amountReceivable": { "$sum": "$amountReceivable" },
          "sales": { "$sum": 1 }
        },
      },

      /* {
        "$addFields": {
          "netProfit": { "$multiply": ["$cargoCharge", "$cargoInsurer_joined.cargoCommission"] },
        }
      } */
    ]);
  }

  async findAllSales(
    user: Partial<User>,
    dateRangeCode?: string,
  ) {

    const userId = user.id;
    const userRole = user.roles && user.roles[0] ? user.roles[0] : RoleType.USER;

    console.log("user: " + user);
    console.log("user id: " + userId);
    console.log("user role: " + userRole);

    const dates: string[] = DateFactory.dateRangeByName(dateRangeCode);

    return this.saleModel.aggregate([
      { $project: { 
        'soldAt': '$soldAt',
        'liabilityCharge': '$liabilityCharge',
        'cargoCharge': '$cargoCharge',
        'physicalDamageCharge': '$physicalDamageCharge',
        'wcGlUmbCharge': '$wcGlUmbCharge',
        'fees': '$fees',
        'permits': '$permits',
        'tips': '$tips',
        'chargesPaid': '$chargesPaid',
        'totalCharge': '$totalCharge',
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
      } },
      { "$unwind": "$customer" },
      {
        "$lookup": {
          "from": "customers", // <-- collection to join
          "localField": "customer",
          "foreignField": "_id",
          "as": "customer"
        }
      },
      { "$unwind": "$customer" },
      { "$unwind": "$seller" },
      {
        "$lookup": {
          "from": "users", // <-- collection to join
          "localField": "seller",
          "foreignField": "_id",
          "as": "seller"
        }
      },
      { "$unwind": "$seller" },
      {
        "$match": { "seller.email": user.email },
      },

      { "$unwind": "$liabilityInsurer" },
      {
        "$lookup": {
          "from": "insurer", // <-- collection to join
          "localField": "liabilityInsurer",
          "foreignField": "_id",
          "as": "liabilityInsurer"
        }
      },
      { "$unwind": "$liabilityInsurer" },
 
      { "$unwind": "$cargoInsurer" },
      {
        "$lookup": {
          "from": "insurer", // <-- collection to join
          "localField": "cargoInsurer",
          "foreignField": "_id",
          "as": "cargoInsurer"
        }
      },
      { "$unwind": "$cargoInsurer" },

      { "$unwind": "$physicalDamageInsurer" },
      {
        "$lookup": {
          "from": "insurer", // <-- collection to join
          "localField": "physicalDamageInsurer",
          "foreignField": "_id",
          "as": "physicalDamageInsurer"
        }
      },
      { "$unwind": "$physicalDamageInsurer" },

      { "$unwind": "$wcGlUmbInsurer" },
      {
        "$lookup": {
          "from": "insurer", // <-- collection to join
          "localField": "wcGlUmbInsurer",
          "foreignField": "_id",
          "as": "wcGlUmbInsurer"
        }
      },
      { "$unwind": "$wcGlUmbInsurer" },

      

    ]);


  }


}
