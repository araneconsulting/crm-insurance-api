import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { Customer } from 'database/customer.model';
import { Company } from 'database/company.model';
import { User } from 'database/user.model';
import { Model, Types } from 'mongoose';
import {
  COMPANY_MODEL,
  USER_MODEL,
  CUSTOMER_MODEL,
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

@Injectable({ scope: Scope.REQUEST })
export class ReportService {
  constructor(
    @Inject(COMPANY_MODEL) private companyModel: Model<Company>,
    @Inject(USER_MODEL) private userModel: Model<User>,
    @Inject(CUSTOMER_MODEL) private customerModel: Model<Customer>,
  ) {}

  async getCompaniesMetrics(
    user: Partial<User>,
    startDate?: string,
    endDate?: string,
    filterField?: string,
    filterValue?: string,
    groupBy?: string,
    groupByFields?: string[],
    fields: string[] = METRICS.companies.returnedFields,
    withCount = false,
  ): Promise<any> {
    let seller: Partial<User> = null;
    let customer: Partial<Customer> = null;
    let location: string = null;

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
        location = filterValue;
        filterConditions['location'] = location;
        break;
    }

    const id = this.GetGroupingId(groupBy, groupByFields);

    const query = this.companyModel.aggregate();

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

  async getAllCompanies(
    user: Partial<User>,
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

    const query = this.companyModel.aggregate();

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
          location: '$location',
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
          location: '$location',
        };
    }
    return idExpression;
  }

  async getSalaryReport(
    user: Partial<User>,
    month: number,
    year: number,
    seller?: string,
    location?: string,
  ): Promise<any> {
    const startDate: string = moment([year, month - 1, COMPANY.payrollDay])
      .subtract(1, 'month')
      .toISOString();
    const endDate: string = moment([year, month - 1, COMPANY.payrollDay])
      .subtract(1, 'day')
      .toISOString();

    let employeeMetrics = await this.getCompaniesMetrics(
      user,
      startDate,
      endDate,
      null,
      null,
      'SELLER',
      [],
      ['totalCharge', 'tips'],
      true,
    );

    employeeMetrics = employeeMetrics.map((metric) => {
      //metric._id contains groupingId object from aggregator
      const result = metric._id;
      result['totalCharge'] = roundAmount(metric.totalCharge);
      result['tips'] = metric.tips;

      return result;
    });

    const officeTotalCompanies =
      employeeMetrics && employeeMetrics.length
        ? employeeMetrics.reduce(
            (accumulator, item) => accumulator + item.totalCharge,
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
          totalCharge: userMetrics ? userMetrics.totalCharge : 0,
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
            totalCharge: userMetrics ? userMetrics.totalCharge : 0,
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
        employeeInfo.totalCharge,
        employeeInfo.permits,
        employeeInfo.fees,
        employeeInfo.tips,
        employeeMetrics.length,
        officeTotalCompanies,
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

    let employeeMetrics = await this.getCompaniesMetrics(
      user,
      startDate,
      endDate,
      null,
      null,
      'SELLER',
      [],
      [
        'totalCharge',
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
      result['totalCharge'] = roundAmount(metric.totalCharge);
      result['tips'] = roundAmount(metric.tips);
      result['permits'] = roundAmount(metric.permits);
      result['fees'] = roundAmount(metric.fees);
      result['liabilityProfit'] = roundAmount(metric.liabilityProfit);
      result['cargoProfit'] = roundAmount(metric.cargoProfit);
      result['physicalDamageProfit'] = roundAmount(metric.physicalDamageProfit);
      result['wcGlUmbProfit'] = roundAmount(metric.wcGlUmbProfit);

      return result;
    });

    const officeTotalCompanies =
      employeeMetrics && employeeMetrics.length
        ? employeeMetrics.reduce(
            (accumulator, item) => accumulator + item.totalCharge,
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
          totalCharge: userMetrics ? userMetrics.totalCharge : 0,
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
          result.totalCharge,
          result.permits,
          result.fees,
          result.tips,
          employeeMetrics.length,
          officeTotalCompanies,
        );
        result['totalSalary'] = roundAmount(result.bonus + user.baseSalary);
        result['totalCompanyGrossProfit'] = roundAmount(
          result.liabilityProfit +
            result.cargoProfit +
            result.physicalDamageProfit +
            result.wcGlUmbProfit,
        );
        result['totalCompanyNetProfit'] = roundAmount(
          result.totalCompanyGrossProfit - result.baseSalary - result.bonus,
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
