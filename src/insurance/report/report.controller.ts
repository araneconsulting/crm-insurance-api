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
import { ReportService } from './report.service';
import { RoleType } from 'shared/enum/role-type.enum';
import { HasRoles } from 'auth/guard/has-roles.decorator';
import { User } from 'database/user.model';
import { Request } from 'express';

@Controller({ path: 'reports', scope: Scope.REQUEST })
export class ReportController {
  constructor(private reportService: ReportService  ) { }

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
    @Query('metrics_layout') metricsLayout?:string
  ): Promise<any> {

    const user: Partial<User> = req.user;

    const response = {
      "metrics": await this.reportService.getSalesMetrics(user, startDate, endDate, filterField?filterField.toLowerCase():null, filterValue?filterValue.toUpperCase():null, metricsLayout),
      "sales": await this.reportService.getAllSales(user, startDate, endDate, filterField?filterField.toLowerCase():null, filterValue?filterValue.toUpperCase():null),
    }
    return res.json(response);
  }
}
