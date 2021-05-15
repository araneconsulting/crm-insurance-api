import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { Customer } from 'database/customer.model';
import { Sale } from 'database/sale.model';
import { User } from 'database/user.model';
import { Model, Types } from 'mongoose';
import {
  SALE_MODEL,
  USER_MODEL,
  CUSTOMER_MODEL,
  LOCATION_MODEL,
} from '../../database/database.constants';
import * as DateFactory from 'shared/util/date-functions';
import { GroupingCriteria } from 'shared/enum/metrics-layout.enum';
import { COMPANY, METRICS } from 'shared/const/project-constants';
import * as moment from 'moment';
import { bonusByRole } from '../../shared/util/salary-functions';
import { getDateMatchExpressionByDates } from 'shared/util/aggregator-functions';
import {
  getPrimaryRole,
  isAdmin,
  isExecutive,
} from 'shared/util/user-functions';
import { roundAmount } from 'shared/util/math-functions';
import { CompanyCatalog } from '../../shared/const/catalog/company';
import { REQUEST } from '@nestjs/core';
import { AuthenticatedRequest } from 'auth/interface/authenticated-request.interface';
import { Location } from 'database/location.model';

const GROUP_BY_SELLER = 'SELLER';
@Injectable({ scope: Scope.REQUEST })
export class ReportService {
  constructor(
    @Inject(SALE_MODEL) private saleModel: Model<Sale>,
    @Inject(USER_MODEL) private userModel: Model<User>,
    @Inject(CUSTOMER_MODEL) private customerModel: Model<Customer>,
    @Inject(LOCATION_MODEL) private locationModel: Model<Location>,
    @Inject(REQUEST) private req: AuthenticatedRequest,
  ) {}

  async getSalesMetrics(
    startDate?: string,
    endDate?: string,
    filterField?: string,
    filterValue?: string,
    groupBy?: string,
    groupByFields?: string[],
    fields: string[] = METRICS.sales.returnedFields,
    withCount = false,
  ): Promise<any> {
    let seller: Partial<User> = null;
    let customer: Partial<Customer> = null;
    let location: Partial<Location> = null;

    const filterConditions = {
      soldAt: getDateMatchExpressionByDates(startDate, endDate),
    };

    switch (filterField) {
      case 'seller':
        seller = await this.userModel.findById(filterValue).exec();
        if (!seller) {
          throw new NotFoundException(`Seller: ${filterValue} not found`);
        }
        filterConditions['seller'] = Types.ObjectId(seller.id);
        break;

      case 'customer':
        customer = await this.customerModel.findById(filterValue).exec();
        if (!customer) {
          throw new NotFoundException(`Customer: ${filterValue} not found`);
        }
        filterConditions['customer'] = Types.ObjectId(customer.id);
        break;

      case 'location':
        location = await this.locationModel.findById(filterValue).exec();
        if (!location) {
          throw new NotFoundException(`Location: ${filterValue} not found`);
        }
        filterConditions['location'] = Types.ObjectId(location.id);
        break;
    }

    const id = this.GetGroupingId(groupBy, groupByFields);

    const query = this.saleModel.aggregate();

    if ((!seller && !customer && !location) || seller || customer) {
      query.match(filterConditions);
    }

    query
      .unwind({ path: '$seller', preserveNullAndEmptyArrays: true })
      .lookup({
        from: 'users',
        localField: 'seller',
        foreignField: '_id',
        as: 'seller',
      })
      .unwind({ path: '$seller', preserveNullAndEmptyArrays: true });

    if (location) {
      query.match(filterConditions);
    }

    query
      .unwind({ path: '$customer', preserveNullAndEmptyArrays: true })
      .lookup({
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customer',
      });
    query.unwind({ path: '$customer', preserveNullAndEmptyArrays: true });

    const groupExpression = {};
    fields.map(
      (field) =>
        (groupExpression[''.concat(field)] = { $sum: '$'.concat(field) }),
    );

    groupExpression['_id'] = id;
    if (withCount) {
      groupExpression['count'] = { $sum: 1 };
    }

    query.group(groupExpression);

    console.log(JSON.stringify(query));

    return query;
  }

  async getAllSales(
    startDate?: string,
    endDate?: string,
    filterField?: string,
    filterValue?: string,
  ): Promise<any> {
    const filterConditions = {
      soldAt: getDateMatchExpressionByDates(startDate, endDate),
    };

    let seller: Partial<User> = null;
    let customer: Partial<Customer> = null;
    let location: string = null;

    switch (filterField) {
      case 'seller':
        seller = await this.userModel.findById(filterValue).exec();
        if (!seller) {
          throw new NotFoundException(`Seller: ${filterValue} not found`);
        }
        filterConditions['seller'] = Types.ObjectId(seller.id);
        break;

      case 'customer':
        customer = await this.customerModel.findById(filterValue).exec();
        if (!customer) {
          throw new NotFoundException(`Customer: ${filterValue} not found`);
        }
        filterConditions['customer'] = Types.ObjectId(customer.id);
        break;

      case 'location':
        location = filterValue;
        filterConditions['location'] = location;
        break;
    }

    const query = this.saleModel.aggregate();

    if ((!seller && !customer && !location) || seller || customer) {
      query.match(filterConditions);
    }

    query
      .unwind({ path: '$seller', preserveNullAndEmptyArrays: true })
      .lookup({
        from: 'users',
        localField: 'seller',
        foreignField: '_id',
        as: 'seller',
      })
      .unwind({ path: '$seller', preserveNullAndEmptyArrays: true });

    if (location) {
      query.match(filterConditions);
    }

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
            soldAt: '$soldAt',
            fees: '$fees',
            tips: '$tips',
            chargesPaid: '$chargesPaid',
            premium: '$premium',
            amountReceivable: '$amountReceivable',
            totalCharge: '$totalCharge',
            createdBy: '$createdBy',
            updatedBy: '$updatedBy',
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
            insurerNames: {
              $concat: [
                { $ifNull: ['$liabilityInsurer.name', ''] },
                '/',
                { $ifNull: ['$cargoInsurer.name', ''] },
                '/',
                { $ifNull: ['$physicalDamageInsurer.name', ''] },
                '/',
                { $ifNull: ['$wcGlUmbInsurer.name', ''] },
              ],
            },
          },
        },
      ])
      .sort({ soldAt: -1 });

    return query;
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

  GetGroupingId(groupingCriteria: string, fields?: string[]): any {
    let idExpression = null;

    switch (groupingCriteria) {
      case GroupingCriteria.SELLER:
        idExpression = {
          id: '$seller._id',
          firstName: '$seller.firstName',
          lastName: '$seller.lastName',
          location: '$location.name',
          roles: '$seller.roles',
        };

        fields.map(
          (field) =>
            (idExpression[''.concat(field.trim())] = '$seller.'.concat(
              field.trim(),
            )),
        );
        break;

      case GroupingCriteria.CUSTOMER:
        idExpression = {
          id: '$customer._id',
          firstName: '$customer.contact.firstName',
          lastName: '$customer.contact.lastName',
          company: '$customer.business.name',
        };

        fields.map(
          (field) =>
            (idExpression[''.concat(field.trim())] = '$customer.'.concat(
              field.trim(),
            )),
        );
        break;

      case GroupingCriteria.LOCATION:
        idExpression = {
          id: '$location._id',
          name: '$location.business.name',
        };
    }
    return idExpression;
  }

  async getSalaryReport(
    user: Partial<User>,
    month: number,
    year: number,
    seller?: string,
  ): Promise<any> {
    const startDate: string = moment([year, month - 1, COMPANY.payrollDay])
      .subtract(1, 'month')
      .toISOString();
    const endDate: string = moment([year, month - 1, COMPANY.payrollDay])
      .subtract(1, 'day')
      .toISOString();

    return this.getSalaryReportByDates(user, startDate, endDate, seller)
  }


  async getSalaryReportByDates(
    user: Partial<User>,
    startDate: string,
    endDate: string,
    seller?: string,
  ): Promise<any> {
    
    let employeeMetrics = await this.getSalesMetrics(
      moment(startDate).toISOString(),
      moment(endDate).toISOString(),
      null,
      null,
      GROUP_BY_SELLER,
      [],
      ['premium', 'tips'],
      true,
    );

    console.log("Metrics ",employeeMetrics);

    employeeMetrics = employeeMetrics.map((metric) => {
      //metric._id contains groupingId object from aggregator
      const result = metric._id;
      result['premium'] = roundAmount(metric.premium);
      result['tips'] = metric.tips;

      return result;
    });

    const officeTotalSales =
      employeeMetrics && employeeMetrics.length
        ? employeeMetrics.reduce(
            (accumulator, item) => accumulator + item.premium,
            0,
          )
        : 0;

    let allUsers = [];

    if (seller) {
      try {
        const user: any = await this.userModel.findOne({ _id: seller }).exec();
        const userMetrics = employeeMetrics.find(({ id }) => id === user.id);

        const result = {
          ...user._doc,
          premium: userMetrics ? userMetrics.premium : 0,
          tips: userMetrics ? userMetrics.tips : 0,
          sellerName: user.firstName + ' ' + user.lastName,
        };

        allUsers.push(result);
      } catch (e) {
        throw new NotFoundException('User not found');
      }
    } else {
      const users: any[] = await this.userModel.find({}).exec();
      allUsers = users
        .filter((user) => !isAdmin(user) && !isExecutive(user))
        .map((user) => {
          const userMetrics = employeeMetrics.find(({ id }) => id == user.id);

          const result = {
            ...user._doc,
            premium: userMetrics ? userMetrics.premium : 0,
            tips: userMetrics ? userMetrics.tips : 0,
            sellerName: user.firstName + ' ' + user.lastName,
          };

          return result;
        });
    }

    const userFilteredByLocation =
      isExecutive(user) && !isAdmin(user)
        ? allUsers.filter((employee) => employee.location === user.location)
        : allUsers;

    const payroll = userFilteredByLocation.map((employeeInfo) => {
      employeeInfo['bonus'] = bonusByRole(
        getPrimaryRole(employeeInfo),
        user.location.toString(),
        employeeInfo.premium,
        employeeInfo.permits,
        employeeInfo.fees,
        employeeInfo.tips,
        employeeMetrics.length,
        officeTotalSales,
      );
      employeeInfo['total'] = roundAmount(
        employeeInfo.baseSalary + employeeInfo.bonus,
      );

      return employeeInfo;
    });

    return payroll;
  }


  async getProfitsReport(
    user: Partial<User>,
    month: number,
    year: number,
    seller?: string,
  ): Promise<any> {
    const startDate: string = moment([year, month - 1, COMPANY.payrollDay])
      .subtract(1, 'month')
      .toISOString();
    const endDate: string = moment([year, month - 1, COMPANY.payrollDay])
      .subtract(1, 'day')
      .toISOString();

    let employeeMetrics = await this.getSalesMetrics(
      startDate,
      endDate,
      null,
      null,
      'SELLER',
      [],
      [
        'premium',
        'permits',
        'fees',
        'tips',
        'liabilityProfit',
        'cargoProfit',
        'physicalDamageProfit',
        'wcGlUmbProfit',
      ],
      true,
    );

    employeeMetrics = employeeMetrics.map((metric) => {
      const result = metric._id;
      result['premium'] = roundAmount(metric.premium);
      result['tips'] = roundAmount(metric.tips);
      result['permits'] = roundAmount(metric.permits);
      result['fees'] = roundAmount(metric.fees);
      result['liabilityProfit'] = roundAmount(metric.liabilityProfit);
      result['cargoProfit'] = roundAmount(metric.cargoProfit);
      result['physicalDamageProfit'] = roundAmount(metric.physicalDamageProfit);
      result['wcGlUmbProfit'] = roundAmount(metric.wcGlUmbProfit);

      return result;
    });

    const officeTotalSales =
      employeeMetrics && employeeMetrics.length
        ? employeeMetrics.reduce(
            (accumulator, item) => accumulator + item.premium,
            0,
          )
        : 0;

    let users = [];

    if (seller) {
      try {
        const user: any = await this.userModel.findOne({ _id: seller }).exec();
        users.push(user);
      } catch (e) {
        throw new NotFoundException('User not found');
      }
    } else {
      users = await this.userModel.find({}).exec();
    }

    const profitsReport = users
      .filter((user) => !isAdmin(user))
      .map((user) => {
        const userMetrics = employeeMetrics.find(({ id }) => id == user.id);

        const result = {
          ...user._doc,
          premium: userMetrics ? userMetrics.premium : 0,
          tips: userMetrics ? userMetrics.tips : 0,
          fees: userMetrics ? userMetrics.fees : 0,
          permits: userMetrics ? userMetrics.permits : 0,
          sellerName: user.firstName + ' ' + user.lastName,
          liabilityProfit: userMetrics ? userMetrics.liabilityProfit : 0,
          cargoProfit: userMetrics ? userMetrics.cargoProfit : 0,
          physicalDamageProfit: userMetrics
            ? userMetrics.physicalDamageProfit
            : 0,
          wcGlUmbProfit: userMetrics ? userMetrics.wcGlUmbProfit : 0,
        };

        result['bonus'] = bonusByRole(
          getPrimaryRole(user),
          user.location,
          result.premium,
          result.permits,
          result.fees,
          result.tips,
          employeeMetrics.length,
          officeTotalSales,
        );
        result['totalSalary'] = roundAmount(result.bonus + user.baseSalary);
        result['totalSaleGrossProfit'] = roundAmount(
          result.liabilityProfit +
            result.cargoProfit +
            result.physicalDamageProfit +
            result.wcGlUmbProfit,
        );
        result['totalSaleNetProfit'] = roundAmount(
          result.totalSaleGrossProfit - result.baseSalary - result.bonus,
        );

        return result;
      });

    return profitsReport;
  }

  async getUserPerformanceReport(
    user: Partial<User>,
    month: number,
    year: number,
    seller?: string,
  ): Promise<any> {
    return await this.getProfitsReport(user, month, year, seller);
  }
}
