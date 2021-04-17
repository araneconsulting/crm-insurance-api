import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Query,
  Req,
  Response,
  Scope,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { ReportService } from './report.service';
import { RoleType } from 'shared/enum/role-type.enum';
import { HasRoles } from 'auth/guard/has-roles.decorator';
import { User } from 'database/user.model';
import { Request } from 'express';
import { ApiQuery } from '@nestjs/swagger';
import * as moment from 'moment';
import { COMPANY } from 'shared/const/project-constants';
import { isAdmin, isExecutive } from 'shared/util/user-functions';

@Controller({ path: 'reports', scope: Scope.REQUEST })
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Get('/companies')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getCompaniesReport(
    @Req() req: Request,
    @Response() res,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('filter_field') filterField?: string,
    @Query('filter_value') filterValue?: string,
    @Query('group_by') groupBy?: string,
    @Query('group_by_fields') groupByFields?: string,
    @Query('fields') fields?: string,
    @Query('with_count') withCount?: boolean,
    @Query('with_companies') withCompanies?: boolean,
  ): Promise<any> {
    const user: Partial<User> = req.user;

    const fieldsArray = fields ? fields.replace(/\s/g, '').split(',') : [];
    const groupByFieldsArray = groupByFields
      ? groupByFields.replace(/\s/g, '').split(',')
      : [];

    const response = {
      metrics: await this.reportService.getCompaniesMetrics(
        user,
        startDate,
        endDate,
        filterField ? filterField.toLowerCase() : null,
        filterValue ? filterValue.toUpperCase() : null,
        groupBy,
        groupByFieldsArray,
        fieldsArray,
        Boolean(withCount),
      ),
    };

    if (Boolean(withCompanies)) {
      response['companies'] = await this.reportService.getAllCompanies(
        user,
        startDate,
        endDate,
        filterField ? filterField.toLowerCase() : null,
        filterValue ? filterValue.toUpperCase() : null,
      );
    }

    return res.json(response);
  }

  @Get('/salaries')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getSalaryReport(
    @Req() req: Request,
    @Response() res,
    @Query('month') month: number,
    @Query('year') year: number,
    @Query('seller') seller?: string,
    @Query('location') location?: string,
  ): Promise<any> {
    const user: Partial<User> = req.user;

    if (!isAdmin(user) && !isExecutive(user)) {
      throw new ForbiddenException(
        'You are not authorized to get salary report.',
      );
    }

    const response = {
      data: await this.reportService.getSalaryReport(
        user,
        month,
        year,
        seller,
        location,
      ),
    };

    return res.json(response);
  }

  @Get('/profits')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getProfitsReport(
    @Req() req: Request,
    @Response() res,
    @Query('month') month: number,
    @Query('year') year: number,
    @Query('seller') seller?: string,
  ): Promise<any> {
    const user: Partial<User> = req.user;

    const response = {
      data: await this.reportService.getProfitsReport(
        user,
        month,
        year,
        seller,
      ),
    };

    return res.json(response);
  }

  @Get('/performance/user')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserPerformanceReport(
    @Req() req: Request,
    @Response() res,
    @Query('month') month: number,
    @Query('year') year: number,
    @Query('seller') seller?: string,
  ): Promise<any> {
    const user: Partial<User> = req.user;

    if (isAdmin(user) && !seller) {
      return res.json({ data: {} });
    }

    const userPerformanceReport = await this.reportService.getUserPerformanceReport(
      user,
      month,
      year,
      user.id,
    );

    const userMetrics = userPerformanceReport[0];

    if (!userMetrics) {
      throw new NotFoundException(
        'User monthly performance metrics are not available',
      );
    }

    const baseDate =
      moment().date() < 21
        ? moment({
            year: year,
            month: month,
            day: COMPANY.payrollDay,
          }).subtract(1, 'months')
        : moment({ year: year, month: month, day: COMPANY.payrollDay });

    const startDate = baseDate.format('MMM D');
    const endDate = baseDate.add(1, 'month').subtract(1, 'day').format('MMM D');
    //const dateRangeTitle = startDate + ' - ' + endDate + ', '+ baseDate.format('YYYY');
    const dateRangeTitle = startDate + ' to today';

    const metrics = [
      {
        title: dateRangeTitle,
        subtitle: '',
        label: 'Companies Total',
        valuePrefix: '$',
        value: userMetrics.premium,
        valueSuffix: '',
        description:
          "Sum of all my companies achieved since last month's 21st to this day.",
      },
      {
        title: dateRangeTitle,
        subtitle: '',
        label: 'Accumulated Salary',
        valuePrefix: '$',
        value: userMetrics.totalSalary,
        valueSuffix: '',
        description:
          'Salary is the sum of your base salary plus bonus and tips minus discounts.',
      },
      {
        title: dateRangeTitle,
        subtitle: '',
        label: 'Accumulated Bonus',
        valuePrefix: '$',
        value: userMetrics.bonus,
        valueSuffix: '',
        description:
          'Bonus calculation is impacted by different variables like: accumulated companies, base salary, tips, discounts, among others.',
      },
    ];

    let message = '';
    if (userMetrics.premium > 100000) {
      message =
        'Come on ' +
        userMetrics.firstName +
        ', can you tell me how you got these numbers? You are the best, did you know?';
    } else if (userMetrics.premium > 50000) {
      message =
        'Hey! ' +
        userMetrics.firstName +
        ', it seems that you are having a month with very good performance. Keep up the good guy!';
    } else if (userMetrics.premium > 25000) {
      message =
        'Psst... ' +
        userMetrics.firstName +
        ', it seems you come with a good momentum. I am sure you will get very far this month!';
    } else {
      message =
        'Uhmm ' +
        userMetrics.firstName +
        ', this seems like a month to achieve great challenges, and you will achieve good numbers!';
    }

    const response = {
      data: {
        message: message,
        metrics: metrics,
      },
    };
    return res.json(response);
  }
}
