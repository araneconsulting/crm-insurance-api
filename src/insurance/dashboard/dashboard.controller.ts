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

@Controller({ path: 'dashboards', scope: Scope.REQUEST })
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

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

    const aggregations = await this.dashboardService.getSalesBy(
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
      Math.round(aggregation.data),
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
            backgroundColor: [
              '#ffbeb2',
              '#feb4a6',
              '#fdab9b',
              '#fca290',
              '#fb9984',
              '#fa8f79',
              '#f9856e',
              '#f77b66',
              '#f5715d',
              '#f36754',
              '#f05c4d',
              '#ec5049',
              '#e74545',
              '#e13b42',
              '#da323f',
              '#d3293d',
              '#ca223c',
              '#c11a3b',
              '#b8163a',
              '#ae123a',
              '#f77b66',
              '#f5715d',
              '#f36754',
              '#f05c4d',
              '#ec5049',
              '#e74545',
              '#e13b42',
              '#da323f',
              '#d3293d',
              '#ca223c',
              '#c11a3b',
              '#b8163a',
              '#ae123a',
              '#f77b66',
              '#f5715d',
              '#f36754',
              '#f05c4d',
              '#ec5049',
              '#e74545',
              '#e13b42',
              '#da323f',
              '#d3293d',
              '#ca223c',
              '#c11a3b',
              '#b8163a',
              '#ae123a',
            ],
          },
        ],
        labels: salesLabels,
      },
      options: {},
    };

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
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ): Promise<any> {
    const user: Partial<User> = req.user;

    const queries = body.hasOwnProperty('queries') && body['queries'];

    if (queries.length) {
      Promise.all(
        queries.map(async (config) => {
          switch (config.type) {
            case 'bar':
            case 'line':
            case 'doughnut':
              const aggregations = await this.dashboardService.getSalesBy(
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
                Math.round(aggregation.data),
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
                      backgroundColor: this.colorSchemes().red50,
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

              console.log(response);

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
    }
  }

  colorSchemes(): any {
    return {
      red50: [
        '#ffbeb2',
        '#fdab9b',
        '#fb9984',
        '#f9856e',
        '#f5715d',
        '#f05c4d',
        '#e74545',
        '#da323f',
        '#ca223c',
        '#b8163a',
        '#ae123a',
        '#f77b66',
        '#f5715d',
        '#f36754',
        '#f05c4d',
        '#ec5049',
        '#e74545',
        '#e13b42',
        '#da323f',
        '#d3293d',
        '#ca223c',
        '#c11a3b',
        '#b8163a',
        '#ae123a',
        '#f77b66',
        '#f5715d',
        '#f36754',
        '#f05c4d',
        '#ec5049',
        '#e74545',
        '#e13b42',
        '#da323f',
        '#d3293d',
        '#ca223c',
        '#c11a3b',
        '#b8163a',
        '#ae123a',
      ],
      constrast: [
        '#1ba3c6',
        '#2cb5c0',
        '#30bcad',
        '#21B087',
        '#33a65c',
        '#57a337',
        '#a2b627',
        '#d5bb21',
        '#f8b620',
        '#f89217',
        '#f06719',
        '#e03426',
        '#f64971',
        '#fc719e',
        '#eb73b3',
        '#ce69be',
        '#a26dc2',
        '#7873c0',
        '#4f7cba',
        '#1ba3c6',
        '#2cb5c0',
        '#30bcad',
        '#21B087',
        '#33a65c',
        '#57a337',
        '#a2b627',
        '#d5bb21',
        '#f8b620',
        '#f89217',
        '#f06719',
        '#e03426',
        '#f64971',
        '#fc719e',
        '#eb73b3',
        '#ce69be',
        '#a26dc2',
        '#7873c0',
        '#4f7cba',
        '#1ba3c6',
        '#2cb5c0',
        '#30bcad',
        '#21B087',
        '#33a65c',
        '#57a337',
        '#a2b627',
        '#d5bb21',
        '#f8b620',
        '#f89217',
        '#f06719',
        '#e03426',
        '#f64971',
        '#fc719e',
        '#eb73b3',
        '#ce69be',
        '#a26dc2',
        '#7873c0',
        '#4f7cba',
      ],
    };
  }
}
