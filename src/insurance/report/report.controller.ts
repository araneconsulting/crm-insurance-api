import {
  Controller,
  Get,
  HttpCode,
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

@Controller({ path: 'reports', scope: Scope.REQUEST })
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Get('/sales')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getSalesReport(
    @Req() req: Request,
    @Response() res,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('filter_field') filterField?: string,
    @Query('filter_value') filterValue?: string,
    @Query('group_by') groupBy?: string,
    @Query('group_by_fields') groupByFields?: string,
    @Query('fields') fields?: string,
    @Query('with_count') withCount?:boolean,
    @Query('with_sales') withSales?:boolean,
  ): Promise<any> {
    
    console.log(withCount, withSales);

    const includeCount = Boolean(withCount);
    const includeSales = Boolean(withSales);

    console.log(includeCount, includeSales);

    const user: Partial<User> = req.user;

    const fieldsArray = fields ? fields.replace(/\s/g, '').split(',') : [];
    const groupByFieldsArray = groupByFields ? groupByFields.replace(/\s/g, '').split(',') : [];

    const response = {
      metrics: await this.reportService.getSalesMetrics(
        user,
        startDate,
        endDate,
        filterField ? filterField.toLowerCase() : null,
        filterValue ? filterValue.toUpperCase() : null,
        groupBy,
        groupByFieldsArray,
        fieldsArray,
        includeCount,
      ),
    };

    if (includeSales) {
      console.log('sales included');
      response['sales'] = await this.reportService.getAllSales(
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
  ): Promise<any> {

    const user: Partial<User> = req.user;

    const response = {
      salaries: await this.reportService.getSalaryReport(
        user,
        month, 
        year, 
        seller
      ),
    };

    return res.json(response);
  }
}
