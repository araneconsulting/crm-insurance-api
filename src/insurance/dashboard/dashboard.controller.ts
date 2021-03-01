import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
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
import { randomBytes } from 'crypto';

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


  @Post('sales/batch')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(RoleType.USER, RoleType.ADMIN)
  async getSalesCharts(
    @Req() req: Request,
    @Response() res,
    @Body() body,
  ): Promise<any> {

    const user: Partial<User> = req.user;

    const queries = body.hasOwnProperty('queries') && body['queries'];

    

    if (queries.length) {

      Promise.all(queries.map(async config => {

        switch (config.type) {
          case "bar":
            const aggregations = await this.dashboardService.getSalesBy(config.queryParams.dataCriteria, config.queryParams.groupingCriteria, config.queryParams.aggregation,
              user, config.queryParams.startDate, config.queryParams.endDate, config.queryParams.location);

            aggregations.sort(function (a, b) {
              return ((a._id.label < b._id.label) ? -1 : ((a._id.label == b._id.label) ? 0 : 1));
            });

            const salesValues = aggregations.map((aggregation) => (Math.round(aggregation.data)));
            const salesLabels = aggregations.map((aggregation) => (aggregation._id.label));

            const response = {
              type: config.type,
              data: {
                datasets: [{
                  data: salesValues,
                  //backgroundColor: []
                }],
                labels: salesLabels
              },
              options: {}
            }

            console.log(response);

            return response;
            
            break;

          default:
            break;
        }



      })).then(data => {
        return res.json(data);
      });

    }



    
  }




}