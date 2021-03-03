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
import { Response } from 'express';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RoleType } from '../../shared/enum/role-type.enum';
import { HasRoles } from '../../auth/guard/has-roles.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { ParseObjectIdPipe } from '../../shared/pipe/parse-object-id.pipe';
import { Customer } from '../../database/customer.model';
import { CreateCustomerDto } from './create-customer.dto';
import { CustomerService } from './customer.service';
import { UpdateCustomerDto } from './update-customer.dto';

@Controller({ path: 'customers', scope: Scope.REQUEST })
export class CustomerController {
  constructor(private customerService: CustomerService) { }

  @Get('')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAllCustomers(
    @Query('q') keyword?: string,
    @Query('limit', new DefaultValuePipe(0), ParseIntPipe) limit?: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
  ): Observable<Customer[]> {
    return this.customerService.findAll(keyword, skip, limit);
  }

  @Get(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getCustomerById(@Param('id', ParseObjectIdPipe) id: string): Observable<Customer> {
    return this.customerService.findById(id);
  }

  @Post('')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(RoleType.OWNER, RoleType.ADMIN, RoleType.MANAGER, RoleType.SELLER, RoleType.TRAINEE)
  createCustomer(
    @Body() customer: CreateCustomerDto
  ): Observable<Customer> {
    return from(this.customerService.save(customer));
  }

  @Put(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(RoleType.OWNER, RoleType.ADMIN, RoleType.MANAGER, RoleType.SELLER, RoleType.TRAINEE)
  updateCustomer(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() customer: UpdateCustomerDto,
    
  ): Observable<Customer> {
    return from(this.customerService.update(id, customer));
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(RoleType.OWNER, RoleType.ADMIN, RoleType.MANAGER, RoleType.SELLER, RoleType.TRAINEE)
  @HasRoles(RoleType.ADMIN)
  deleteCustomerById(
    @Param('id', ParseObjectIdPipe) id: string
  ): Observable<Customer> {
    return this.customerService.deleteById(id);
  }
}
