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
import { getDateMatchExpressionByDates } from 'shared/util/aggregator-functions';
import {
  getPrimaryRole,
  isAdmin,
  isExecutive,
  isSuperAdmin,
} from 'shared/util/user-functions';
import { roundAmount } from 'shared/util/math-functions';
import { REQUEST } from '@nestjs/core';
import { AuthenticatedRequest } from 'auth/interface/authenticated-request.interface';
import { Location } from 'database/location.model';
import { bonusByRole } from 'shared/vl17-specific/salary/mexico-bonus';

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
    startDate?: Date,
    endDate?: Date,
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

    console.log('dates: ', startDate,endDate);

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

    return query;
  }

  async getAllSales(
    startDate?: Date,
    endDate?: Date,
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
            soldAt: '$soldAt',
            fees: '$fees',
            tips: '$tips',
            chargesPaid: '$chargesPaid',
            premium: '$premium',
            amountReceivable: '$amountReceivable',
            totalCharge: '$totalCharge',
            totalInsurance: '$totalInsurance',
            createdBy: '$createdBy',
            updatedBy: '$updatedBy',
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
            seller: 1,
            customer: 1,
            location: 1,
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
    currentUser: Partial<User>,
    month: number,
    year: number,
    seller?: string,
  ): Promise<any> {
    const startDate: Date = new Date(
      moment([year, month - 1, COMPANY.payrollDay])
        .subtract(1, 'month')
        .toISOString(),
    );
    const endDate: Date = new Date(
      moment([year, month - 1, COMPANY.payrollDay])
        .subtract(1, 'day')
        .toISOString(),
    );

    return await this.getEmployeesSalaryMetrics(
      currentUser,
      startDate,
      endDate,
      seller,
    );
  }

  async getEmployeesSalaryMetrics(
    currentUser: Partial<User>,
    startDate: Date,
    endDate: Date,
    sellerId?: string,
  ): Promise<any> {
    let employeeMetrics = await this.getSalesMetrics(
      startDate,
      endDate,
      null,
      null,
      GROUP_BY_SELLER,
      [],
      [
        'totalCharge',
        'tips',
        'permits',
        'fees',
        'premium',
        'totalInsurance',
        'profits',
      ],
      true,
    );

    employeeMetrics = employeeMetrics.map((metric) => {
      //metric._id contains groupingId object from aggregator
      const result = metric._id;
      result['totalCharge'] = roundAmount(metric.totalCharge);
      result['tips'] = roundAmount(metric.tips);
      result['permits'] = roundAmount(metric.permits);
      result['fees'] = roundAmount(metric.fees);
      result['premium'] = roundAmount(metric.premium);
      result['totalInsurance'] = roundAmount(metric.totalInsurance);
      result['profits'] = roundAmount(metric.profits);

      return result;
    });

    console.log('employee metrics', employeeMetrics);

    const officeTotalSales =
      employeeMetrics && employeeMetrics.length
        ? employeeMetrics.reduce(
            (accumulator, item) => accumulator + item.premium,
            0,
          )
        : 0;

    //console.log('officeTotalSales',officeTotalSales);

    let allEmployeeSalaryMetrics = [];

    if (sellerId) {
      await this.getEmployeeSalaryMetricBySeller(sellerId, employeeMetrics);
    } else {
      allEmployeeSalaryMetrics = await this.getAllEmployeeSalaryMetrics(
        employeeMetrics,
      );
    }

    //TODO: Improve this solution to give access to Boris to all Mexico locations (assign multiple locations)
    const salaryMetricsByAuthUserLocation = allEmployeeSalaryMetrics;
    /* !isAdmin(currentUser) && isExecutive(currentUser)
        ? allEmployeeSalaryMetrics.filter((employee) => {
            return employee.locationId === currentUser.location;
          })
        : allEmployeeSalaryMetrics; */

    const payroll = salaryMetricsByAuthUserLocation.map((employeeInfo) => {
      //      console.log('employee info before bonus calc', employeeInfo);

      if (employeeInfo.location) {
        employeeInfo['bonus'] = bonusByRole(
          getPrimaryRole(employeeInfo),
          employeeInfo.location.business
            ? employeeInfo.location.business.address.country
            : 'N/A',
          employeeInfo.premium,
          employeeInfo.permits,
          employeeInfo.fees,
          employeeInfo.tips,
          employeeMetrics.length,
          officeTotalSales,
        );
        return employeeInfo;
      }
    });

    return payroll;
  }

  async getProfitsReport(
    currentUser: Partial<User>,
    month: number,
    year: number,
    seller?: string,
  ): Promise<any> {
    const startDate: Date = new Date(
      moment([year, month - 1, COMPANY.payrollDay])
        .subtract(1, 'month')
        .toISOString(),
    );
    const endDate: Date = new Date(
      moment([year, month - 1, COMPANY.payrollDay])
        .subtract(1, 'day')
        .toISOString(),
    );

    let employeeMetrics = await this.getSalesMetrics(
      startDate,
      endDate,
      null,
      null,
      'SELLER',
      [],
      ['totalCharge', 'premium', 'totalInsurance', 'permits', 'fees', 'tips'],
      true,
    );

    employeeMetrics = employeeMetrics.map((metric) => {
      const result = metric._id;
      result['totalCharge'] = roundAmount(metric.totalCharge);
      result['premium'] = roundAmount(metric.premium);
      result['totalInsurance'] = roundAmount(metric.totalInsurance);
      result['tips'] = roundAmount(metric.tips);
      result['permits'] = roundAmount(metric.permits);
      result['fees'] = roundAmount(metric.fees);
      result['profits'] = roundAmount(metric.profits);
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
      users = await this.userModel
        .find({ $and: [{ deleted: false }, { location: { $exists: true } }] })
        .exec();
    }

    const profitsReport = users
      .filter((user) => !isAdmin(user))
      .map((user) => {
        const userMetrics = employeeMetrics.find(({ id }) => id == user.id);

        const result = {
          ...user._doc,
          totalCharge: userMetrics ? userMetrics.totalCharge : 0,
          totalInsurance: userMetrics ? userMetrics.totalInsurance : 0,
          premium: userMetrics ? userMetrics.premium : 0,
          tips: userMetrics ? userMetrics.tips : 0,
          fees: userMetrics ? userMetrics.fees : 0,
          permits: userMetrics ? userMetrics.permits : 0,
          profits: userMetrics ? userMetrics.profits : 0,
          sellerName: user.firstName + ' ' + user.lastName,
        };

        result['salesBonus'] = bonusByRole(
          getPrimaryRole(user),
          user.location,
          result.premium,
          result.permits,
          result.fees,
          result.tips,
          employeeMetrics.length,
          officeTotalSales,
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

  async getAllEmployeeSalaryMetrics(employeeMetrics: any) {
    const users: any[] = await this.userModel
      .find({ $and: [{ deleted: false }, { location: { $exists: true } }] })
      .populate('location')
      .exec();

    return users
      .filter((user) => !isSuperAdmin(user))
      .map((user) => {
        const userMetrics = employeeMetrics.find(({ id }) => id == user.id);
        const salaryMetrics = this.setEmployeeSalaryMetric(user, userMetrics);
        return salaryMetrics;
      });
  }

  async getEmployeeSalaryMetricBySeller(
    sellerId: string,
    employeeMetrics: any,
  ) {
    let result = [];
    try {
      const user: any = await this.userModel
        .findOne({ _id: sellerId })
        .populate('location')
        .exec();
      const userMetrics = employeeMetrics.find(({ id }) => id === user.id);
      const salaryMetrics = this.setEmployeeSalaryMetric(user, userMetrics);

      result.push(salaryMetrics);
    } catch (e) {
      throw new NotFoundException('User not found');
    }

    return result;
  }

  setEmployeeSalaryMetric(user: any, userMetrics: any) {
    return {
      id: user.id,
      roles: user.roles,
      permits: userMetrics ? userMetrics.permits : 0,
      fees: userMetrics ? userMetrics.fees : 0,
      tips: userMetrics ? userMetrics.tips : 0,
      location: user.location ? user.location : null,
      locationId: user.location ? user.location.id : null,
      totalCharge: userMetrics ? userMetrics.totalCharge : 0,
      premium: userMetrics ? userMetrics.premium : 0,
      totalInsurance: userMetrics ? userMetrics.totalInsurance : 0,
      sellerName: user.firstName + ' ' + user.lastName,
    };
  }
}
