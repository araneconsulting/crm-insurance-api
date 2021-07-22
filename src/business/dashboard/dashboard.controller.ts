import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Response,
  Scope,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { DashboardService } from './dashboard.service';
import { RoleType } from 'shared/enum/role-type.enum';
import { HasRoles } from 'auth/guard/has-roles.decorator';
import { User } from 'database/user.model';
import { Request } from 'express';
import { randomBytes } from 'crypto';
import { colorSchemes } from 'shared/const/color-schemes';
import { roundAmount } from 'shared/util/math-functions';

@Controller({ path: 'dashboards/hhrr', scope: Scope.REQUEST })
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('companies/bar')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getCompaniesBarChart(
    @Req() req: Request,
    @Response() res,
    @Query('data_criteria') dataCriteria: string,
    @Query('grouping_criteria') groupingCriteria: string,
    @Query('aggregation') aggregation: string,
    @Query('location') location?: string,
    @Query('start_date') startDate?: Date,
    @Query('end_date') endDate?: Date,
    @Query('options') options?: string,
  ): Promise<any> {
    /* const user: Partial<User> = req.user;

    const aggregations = await this.dashboardService.getCompaniesDatasets(
      dataCriteria,
      groupingCriteria,
      aggregation,
      user,
      startDate,
      endDate,
      location,
    );

    aggregations.sort(function (a, b) {
      return a._id.label < b._id.label
        ? -1
        : a._id.label == b._id.label
        ? 0
        : 1;
    });

    const salesValues = aggregations.map((aggregation) =>
      roundAmount(aggregation.data),
    );
    const salesLabels = aggregations.map(
      (aggregation) => aggregation._id.label,
    );

    const response = {
      type: 'bar',
      data: {
        datasets: [
          {
            data: salesValues,
            backgroundColor: colorSchemes.contrast.red.slice(0,salesValues.length)
          },
        ],
        labels: salesLabels,
      },
      options: {},
    };
 */

    //temporary response
    const response = {}
    return res.json(response);
  }

  @Post('companies/batch')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getSalesCharts(
    @Req() req: Request,
    @Response() res,
    @Body() body,
    @Query('start_date') startDate?: Date,
    @Query('end_date') endDate?: Date,
  ): Promise<any> {
    /* const user: Partial<User> = req.user;

    const queries = body.hasOwnProperty('queries') && body['queries'];

    if (queries.length) {
      Promise.all(
        queries.map(async (config) => {
          switch (config.type) {
            case 'bar':
            case 'line':
            case 'doughnut':
              const aggregations = await this.dashboardService.getSaleDatasets(
                config.queryParams.dataCriteria,
                config.queryParams.groupingCriteria,
                config.queryParams.aggregation,
                user,
                startDate,
                endDate,
                config.queryParams.location,
              );

              aggregations.sort(function (a, b) {
                return a._id.label < b._id.label
                  ? -1
                  : a._id.label == b._id.label
                  ? 0
                  : 1;
              });

              const salesValues = aggregations.map((aggregation) =>
                roundAmount(aggregation.data),
              );
              const salesLabels = aggregations.map(
                (aggregation) => aggregation._id.label,
              );

              const filled = config.type != 'line';
              const legend = config.type === 'doughnut';

              const response = {
                type: config.type,
                title: config.title,
                data: {
                  datasets: [
                    {
                      data: salesValues,
                      backgroundColor: colorSchemes.contrast.red.slice(0,salesValues.length),
                      fill: filled,
                    },
                  ],
                  labels: salesLabels,
                },
                options: {
                  legend: {
                    display: legend,
                  },
                },
              };

              return response;

              break;

            default:
              break;
          }
        }),
      ).then((data) => {
        return res.json(data);
      });
    } else {
      throw new BadRequestException('Invalid Request');
    } */
    return res.json({});
  }
}
