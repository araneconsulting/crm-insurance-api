import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Redirect,
  Res,
  Scope,
  UseGuards
} from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { RoleType } from '../../shared/enum/role-type.enum';
import { HasRoles } from '../../auth/guard/has-roles.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { ParseObjectIdPipe } from '../../shared/pipe/parse-object-id.pipe';
import { ReportService } from './report.service';
import { Sale } from 'database/sale.model';

@Controller({ path: 'reports', scope: Scope.REQUEST })
export class ReportController {
  constructor(private reportService: ReportService) { }

  @Get('/sales')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getSales(
    @Query('date_range') dateRangeCode?: string,
    @Query('q') keyword?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
  ): Observable<Sale[]> {
    return this.reportService.salesReport(dateRangeCode, keyword, skip, limit);
  }

  
}
