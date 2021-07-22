import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  ExceptionFilter,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Redirect,
  Res,
  Scope,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { map } from 'rxjs/operators';
import { RoleType } from '../../shared/enum/role-type.enum';
import { HasRoles } from '../../auth/guard/has-roles.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { ParseObjectIdPipe } from '../../shared/pipe/parse-object-id.pipe';
import { Customer } from '../../database/customer.model';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerService } from './customer.service';
import { UpdateCustomerDto } from './dto/customer.dto';
import { BadRequestFilter } from 'shared/filter/bad-request.filter';
import { MongoFilter } from 'shared/filter/mongo.filter';

@Controller({ path: 'customers', scope: Scope.REQUEST })
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Get()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllCustomers(
  ): Promise<any> {
    const res = await this.customerService.findAll();
    return {
      data: res,
    };
  }

  @Post('/search')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async searchUsers(
    @Body() query: any,
  ): Promise<any> {
    return await this.customerService.search(query.queryParams);
  }

  @Get(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getCustomerById(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<Customer> {
    return await this.customerService.findById(id);
  }

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters(MongoFilter)
  async createCustomer(@Body() customer: CreateCustomerDto): Promise<Customer> {
    return await this.customerService.save(customer);
  }

  @Put(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters(MongoFilter)
  async updateCustomer(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() customer: UpdateCustomerDto,
  ): Promise<Customer> {
    return await this.customerService.update(id, customer);
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteCustomerById(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<Customer> {
    return await this.customerService.deleteById(id);
  }
}
