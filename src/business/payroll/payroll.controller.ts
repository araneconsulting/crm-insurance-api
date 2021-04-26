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
  Scope,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { RoleType } from '../../shared/enum/role-type.enum';
import { HasRoles } from '../../auth/guard/has-roles.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { ParseObjectIdPipe } from '../../shared/pipe/parse-object-id.pipe';
import { Payroll } from '../../database/payroll.model';
import { PayrollService } from './payroll.service';
import { MongoFilter } from 'shared/filter/mongo.filter';
import { CreatePayrollDto } from 'business/payroll/dto/create-payroll.dto';
import { UpdatePayrollDto } from 'business/payroll/dto/update-payroll.dto';

@Controller({ path: 'payrolls', scope: Scope.REQUEST })
export class PayrollController {
  constructor(private payrollService: PayrollService) {}

  @Get()
  @HttpCode(200)
  @HasRoles(RoleType.SUPER,RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllPayrolls(
    @Query('q') keyword?: string,
    @Query('limit', new DefaultValuePipe(0), ParseIntPipe) limit?: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
  ): Promise<Payroll[]> {
    return await this.payrollService.findAll(keyword, skip, limit);
  }

  @Get(':id')
  @HttpCode(200)
  //@HasRoles(RoleType.SUPER,RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getPayrollById(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<Payroll> {
    return await this.payrollService.findById(id);
  }

  @Post()
  @HttpCode(201)
  @HasRoles(RoleType.SUPER,RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters( MongoFilter)
  async createPayroll(@Body() payroll: CreatePayrollDto): Promise<Payroll> {
    return await this.payrollService.save(payroll);
  }

  @Put(':id')
  @HttpCode(200)
  @HasRoles(RoleType.SUPER,RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters( MongoFilter)
  async updatePayroll(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() payroll: UpdatePayrollDto,
  ): Promise<Payroll> {
    return await this.payrollService.update(id, payroll);
  }

  @Delete(':id')
  @HasRoles(RoleType.SUPER,RoleType.ADMIN)
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deletePayrollById(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<Payroll> {
    return await this.payrollService.deleteById(id);
  }
}
