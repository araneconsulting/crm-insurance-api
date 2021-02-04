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
import { Sale } from '../../database/sale.model';
import { CreateSaleDto } from './create-sale.dto';
import { SaleService } from './sale.service';
import { UpdateSaleDto } from './update-sale.dto';

@Controller({ path: 'sales', scope: Scope.REQUEST })
export class SaleController {
  constructor(private saleService: SaleService) { }

  @Get('')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAllSales(
    @Query('q') keyword?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('withSeller', new DefaultValuePipe(false)) withSeller?: boolean,
    @Query('withCustomer', new DefaultValuePipe(false)) withCustomer?: boolean,
    @Query('withInsurers', new DefaultValuePipe(false)) withInsurers?: boolean,
  ): Observable<Sale[]> {
    return this.saleService.findAll(keyword, skip, limit, withSeller, withCustomer, withInsurers);
  }

  @Get(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getSaleById(
    @Param('id', ParseObjectIdPipe) id: string,
    @Query('withSeller', new DefaultValuePipe(false)) withSeller?: boolean,
    @Query('withCustomer', new DefaultValuePipe(false)) withCustomer?: boolean,
    @Query('withInsurers', new DefaultValuePipe(false)) withInsurers?: boolean,
    ): Observable<Sale> {
    return this.saleService.findById(id, withSeller, withCustomer, withInsurers);
  }

  @Post('')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(RoleType.USER, RoleType.ADMIN)
  createSale(
    @Body() sale: CreateSaleDto
  ): Observable<Sale> {
    return from(this.saleService.save(sale));
  }

  @Put(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(RoleType.USER, RoleType.ADMIN)
  updateSale(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() sale: UpdateSaleDto,
    
  ): Observable<Sale> {
    return from(this.saleService.update(id, sale));
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(RoleType.ADMIN)
  deleteSaleById(
    @Param('id', ParseObjectIdPipe) id: string
  ): Observable<Sale> {
    return this.saleService.deleteById(id);
  }
}
