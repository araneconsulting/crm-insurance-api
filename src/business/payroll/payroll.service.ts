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
import { PAYROLL_MODEL } from '../../database/database.constants';
import { ReportService } from 'insurance/report/report.service';
import { InitPayrollDto } from './dto/init-payroll.dto';
import { Location } from 'database/location.model';
import {
  generateDefaultPayStubs,
  getLastPayPeriod,
  runPayrollCalculations,
} from './payroll.utils';
import { UserService } from 'user/user.service';
@Injectable({ scope: Scope.REQUEST })
export class PayrollService {
  constructor(
    @Inject(PAYROLL_MODEL) private payrollModel: Model<Payroll>,
    @Inject(REQUEST) private req: AuthenticatedRequest,
    private reportService: ReportService,
    private userService: UserService,
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

  /*
   * Get Available Pay Period for next Payroll
   */

  getAvailablePayPeriod(location: Partial<Location> = null): InitPayrollDto[] {
    const payPeriod = getLastPayPeriod(21);

    console.log('pay period: ', payPeriod);

    let payrolls: InitPayrollDto[] = [
      {
        payPeriodStartedAt: payPeriod.start,
        payPeriodEndedAt: payPeriod.end,
        location: location,
      },
    ];

    return payrolls;
  }

  /*
   * Generate initial Payroll with Sales bonus calculated but without: regular salary, extra-bonus, discounts, reimbursements,
   * to be set up in frontend by payroll creator user.
   */

  async initPayroll(data: InitPayrollDto): Promise<PayrollDto> {
    let payrollDto: PayrollDto = {
      company: this.req.user.company,
      ...data,
    };

    payrollDto.payStubs = await generateDefaultPayStubs(
      payrollDto,
      this.userService,
    );

    return payrollDto;
  }

  async save(data: CreatePayrollDto): Promise<Payroll> {
    let payrollDto: PayrollDto = {
      ...data,
      createdBy: { _id: this.req.user.id },
    };

    payrollDto = await runPayrollCalculations(
      payrollDto,
      this.reportService,
      this.req.user,
    );

    return this.payrollModel.create(payrollDto);
  }

  async update(id: string, data: Partial<PayrollDto>): Promise<Payroll> {
    let payrollDto: PayrollDto = {
      ...data,
      updatedBy: { _id: this.req.user.id },
    };

    let foundPayroll = await this.findById(id);

    if (!foundPayroll){
      throw new NotFoundException(`Payroll:$id was not found`);
    }

    payrollDto = await runPayrollCalculations(payrollDto, this.reportService, this.req.user);


    return this.payrollModel.findOneAndUpdate(
      { _id: Types.ObjectId(id) },
      {
        //...foundPayroll,
        ...payrollDto,
      },
      { new: true },
    );

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
}
