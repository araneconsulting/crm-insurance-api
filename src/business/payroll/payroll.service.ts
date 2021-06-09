import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { CreatePayrollDto } from 'business/payroll/dto/create-payroll.dto';
import { UpdatePayrollDto } from 'business/payroll/dto/update-payroll.dto';
import { PayrollDto } from 'business/payroll/dto/payroll.dto';
import { Payroll } from 'database/payroll.model';
import { Model, Types } from 'mongoose';
import { EMPTY, from, of } from 'rxjs';
import { mergeMap, throwIfEmpty } from 'rxjs/operators';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';
import { PAYROLL_MODEL, USER_MODEL } from '../../database/database.constants';
import { ReportService } from 'insurance/report/report.service';
import { PayAddon } from 'business/sub-docs/pay-addon';
import e from 'express';
import { InitPayrollDto } from './dto/init-payroll.dto';
import * as moment from 'moment';

const ADDON_TYPE_DISCOUNT = 'DISCOUNT';
const ADDON_TYPE_BONUS = 'BONUS';
const ADDON_TYPE_REIMBURSEMENT = 'REIMBURSEMENT';
const ADDON_SCOPE_LOCATION = 'LOCATION';

@Injectable({ scope: Scope.REQUEST })
export class PayrollService {
  constructor(
    @Inject(PAYROLL_MODEL) private payrollModel: Model<Payroll>,
    @Inject(REQUEST) private req: AuthenticatedRequest,
    private reportService: ReportService,
  ) {}

  findAll(keyword?: string, skip = 0, limit = 0): Promise<Payroll[]> {
    if (keyword && keyword) {
      return this.payrollModel
        .find({
          $or: [
            { name: { $regex: '.*' + keyword + '.*' } },
            { email: { $regex: '.*' + keyword + '.*' } },
          ],
        })
        .skip(skip)
        .limit(limit)
        .exec();
    } else {
      return this.payrollModel.find({}).skip(skip).limit(limit).exec();
    }
  }

  findById(id: string): Promise<Payroll> {
    return from(this.payrollModel.findOne({ _id: id }).exec())
      .pipe(
        mergeMap((p) => (p ? of(p) : EMPTY)),
        throwIfEmpty(() => new NotFoundException(`Payroll:$id was not found`)),
      )
      .toPromise();
  }

  getAvailablePayPeriod(
    scope: string,
    location: string = null,
  ): InitPayrollDto[] {
    const monthDiff = moment().date() >= 21 ? 0 : 1;

    let payrolls: InitPayrollDto[] = [
      {
        payPeriodStartedAt: moment()
          .subtract(monthDiff,'month')
          .date(21)
          .startOf('day')
          .format('MM-DD-YYYY'),
        payPeriodEndedAt: moment()
          .subtract(monthDiff + 1,'month')
          .date(20)
          .endOf('day')
          .format('MM-DD-YYYY'),
        location: location,
        scope: 'LOCATION',
      },
    ];

    return payrolls;

    //TODO: Implement it to return all non executed payroll periods.

    /* const monthsAgo = (moment().date()>= 21) ? 6 : 7;

    const periodStarting = moment()
      .subtract(monthsAgo, 'months')
      .date(21)
      .startOf('day')
      .toISOString();
    console.log(periodStarting);

    let conditions = {};

    conditions['$and'] = [{ payPeriodStartedAt: { $gte: periodStarting } }];

    if (scope === 'LOCATION') {
      conditions['$and'].push({ location: Types.ObjectId(location) });
    }

    let payrolls = this.payrollModel
      .find(conditions)
      .sort({ payPeriodStartedAt: -1 })
      .exec();

    return payrolls; */
  }

  async prepare(data: CreatePayrollDto): Promise<Payroll> {
    let payrollDto: PayrollDto = {
      ...data,
      company: this.req.user.company,
      createdBy: { _id: this.req.user.id },
    };

    payrollDto = await this.runPayrollCalculations(payrollDto);

    if (payrollDto.scope === ADDON_SCOPE_LOCATION && !payrollDto.location) {
      payrollDto.location = this.req.user.location;
    }

    return this.payrollModel.create(payrollDto);
  }

  async save(data: CreatePayrollDto): Promise<Payroll> {
    let payrollDto: PayrollDto = {
      ...data,
      company: this.req.user.company,
      createdBy: { _id: this.req.user.id },
    };

    payrollDto = await this.runPayrollCalculations(payrollDto);

    if (payrollDto.scope === ADDON_SCOPE_LOCATION && !payrollDto.location) {
      payrollDto.location = this.req.user.location;
    }

    return this.payrollModel.create(payrollDto);
  }

  async update(id: string, data: UpdatePayrollDto): Promise<Payroll> {
    const payrollDto = {
      ...data,
      updatedBy: { _id: this.req.user.id },
    };

    await this.runPayrollCalculations(payrollDto);

    return from(
      this.payrollModel
        .findOneAndUpdate({ _id: id }, payrollDto, { new: true })
        .exec(),
    )
      .pipe(
        mergeMap((p) => (p ? of(p) : EMPTY)),
        throwIfEmpty(() => new NotFoundException(`Payroll:$id was not found`)),
      )
      .toPromise();
  }

  deleteById(id: string): Promise<Payroll> {
    return from(this.payrollModel.findOneAndRemove({ _id: id }).exec())
      .pipe(
        mergeMap((p) => (p ? of(p) : EMPTY)),
        throwIfEmpty(() => new NotFoundException(`Payroll:$id was not found`)),
      )
      .toPromise();
  }

  deleteAll(): Promise<any> {
    return this.payrollModel.deleteMany({}).exec();
  }

  async search(queryParams?: any): Promise<any> {
    const sortCriteria = {};
    sortCriteria[queryParams.sortField] =
      queryParams.sortOrder === 'desc' ? -1 : 1;
    const skipCriteria = (queryParams.pageNumber - 1) * queryParams.pageSize;
    const limitCriteria = queryParams.pageSize;

    let location = null;

    if (queryParams.filter.hasOwnProperty('location')) {
      location = queryParams.filter.location;
      delete queryParams.filter['location'];
    }

    let conditions = {};
    let fixedQueries = [];
    let filterQueries = [];

    conditions = {
      $and: [{ deleted: false }],
    };
    if (
      location ||
      (queryParams.filter && Object.keys(queryParams.filter).length > 0)
    ) {
      if (location) {
        conditions['$and'].push({ location: Types.ObjectId(location) });
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

    const query = this.payrollModel.aggregate();

    if (conditions) {
      query.match(conditions);
    }

    query
      .unwind({ path: '$location', preserveNullAndEmptyArrays: true })
      .lookup({
        from: 'locations',
        localField: 'location',
        foreignField: '_id',
        as: 'location',
      })
      .unwind({ path: '$location', preserveNullAndEmptyArrays: true });

    query.append([
      {
        $project: {
          id: '$_id',
          payPeriodStartedAt: '$payPeriodStartedAt',
          payPeriodEndedAt: '$payPeriodEndedAt',
          locationName: {
            $function: {
              body: function (location: any) {
                return location ? location.business.name : 'N/A';
              },
              args: ['$location'],
              lang: 'js',
            },
          },
          code: '$code',
          status: '$status',
          totalSaleBonus: '$totalSaleBonus',
          totalNetSalary: '$totalNetSalary',
          createdAt: '$createdAt',
          scope: '$scope',
          
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

  private async runPayrollCalculations(payrollDto: PayrollDto) {
    let salaryReport: [] = await this.reportService.getSalaryReportByDates(
      this.req.user,
      payrollDto.payPeriodStartedAt,
      payrollDto.payPeriodEndedAt,
      null,
    );

    let bonusAddon: PayAddon = {
      amount: 0,
      category: 'BONUS_SALE',
      description: 'Employee Monthly Sale Bonus',
      type: 'BONUS',
    };

    let reports = salaryReport.filter((employee) => employee);
    let stubs = payrollDto.payStubs.filter((payStub) => payStub);

    console.log('salary report: ', reports);
    console.log('payroll paystubs: ', stubs);

    payrollDto.payStubs = stubs;

    payrollDto.payStubs = payrollDto.payStubs.map((payStub) => {
      const employeeReport = reports.find(({ id }) => id === payStub.employee);

      let stub = { ...payStub };

      if (employeeReport) {
        console.log('hay reporte para ' + employeeReport['id']);
        const saleBonusAddon = {
          ...bonusAddon,
          amount: employeeReport['bonus'] || 0,
        };
        stub.addons.push(saleBonusAddon) || 0;
        stub.totalSales = employeeReport['totalCharge'] || 0;
        stub.totalPermits = employeeReport['totalPermits'] || 0;
        stub.totalFees = employeeReport['totalFees'] || 0;
        stub.totalTips = employeeReport['totalTips'] || 0;
      } else {
        stub.totalSales = 0;
        stub.totalPermits = 0;
        stub.totalFees = 0;
        stub.totalTips = 0;
      }

      stub.totalBonus = payStub.addons.reduce(function (prev, cur) {
        return prev + (cur.type === ADDON_TYPE_BONUS ? cur.amount : 0);
      }, 0);

      stub.totalDiscount = payStub.addons.reduce(function (prev, cur) {
        return prev + (cur.type === ADDON_TYPE_DISCOUNT ? cur.amount : 0);
      }, 0);

      stub.totalReimbursement = payStub.addons.reduce(function (prev, cur) {
        return prev + (cur.type === ADDON_TYPE_REIMBURSEMENT ? cur.amount : 0);
      }, 0);

      stub.totalSalary =
        stub.payRate * stub.normalHoursWorked +
        stub.overtimeHoursWorked * stub.payRate * 1.5;

      stub.totalNetSalary =
        stub.totalSalary +
        stub.totalBonus +
        stub.totalReimbursement -
        stub.totalDiscount;

      console.log('PayStub: ', stub);

      return stub;
    });

    return payrollDto;
  }
}
