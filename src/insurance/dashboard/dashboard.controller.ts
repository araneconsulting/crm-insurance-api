import {
  Controller,
  Get,
  HttpCode,
  Query,
  Req,
  Response,
  Scope,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { DashboardService } from './dashboard.service';
import { RoleType } from 'shared/enum/role-type.enum';
import { HasRoles } from 'auth/guard/has-roles.decorator';
import { User } from 'database/user.model';
import { Request } from 'express';

@Controller({ path: 'dashboards', scope: Scope.REQUEST })
export class DashboardController {
  constructor(private dashboardService: DashboardService) { }

  @Get('sales/bar')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(RoleType.USER, RoleType.ADMIN)
  async getSalesBarChart(
    @Req() req: Request,
    @Response() res,
    @Query('data_criteria') dataCriteria: string,
    @Query('grouping_criteria') groupingCriteria: string,
    @Query('aggregation') aggregation: string,
    @Query('location') location?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('options') options?: string,
  ): Promise<any> {

    const user: Partial<User> = req.user;

    const aggregations = await this.dashboardService.getSalesBy(dataCriteria, groupingCriteria, aggregation, user, startDate, endDate, location);


    aggregations.sort(function (a, b) {
      return ((a._id.label < b._id.label) ? -1 : ((a._id.label == b._id.label) ? 0 : 1));
    });

    const salesValues = aggregations.map((aggregation) => (Math.round(aggregation.data)));
    const salesLabels = aggregations.map((aggregation) => (aggregation._id.label));


    const response = {
      type: "bar",
      data: {
        datasets: [{
          data: salesValues,
          //backgroundColor: []
        }],
        labels: salesLabels
      },
      options: {}
    }

    return res.json(response);
  }

  @Get('sales/line')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(RoleType.USER, RoleType.ADMIN)
  async getSalesLineChart(
    @Req() req: Request,
    @Response() res,
    @Query('data_criteria') dataCriteria: string,
    @Query('grouping_criteria') groupingCriteria: string,
    @Query('aggregation') aggregation: string,
    @Query('location') location?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('options') options?: string,
  ): Promise<any> {

    const user: Partial<User> = req.user;

    const aggregations = await this.dashboardService.getSalesBy(dataCriteria, groupingCriteria, aggregation, user, startDate, endDate, location);


    aggregations.sort(function (a, b) {
      return ((a._id.label < b._id.label) ? -1 : ((a._id.label == b._id.label) ? 0 : 1));
    });

    const salesValues = aggregations.map((aggregation) => (Math.round(aggregation.data)));
    const salesLabels = aggregations.map((aggregation) => (aggregation._id.label));


    const response = {
      type: "line",
      data: {
        datasets: [{
          data: salesValues,
          //backgroundColor: []
        }],
        labels: salesLabels
      },
      options: {}
    }

    return res.json(response);
  }


}