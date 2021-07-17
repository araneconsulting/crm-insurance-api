import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
  Response,
  Scope,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { Sale } from '../../database/sale.model';
import { SaleService } from './sale.service';
import { Request } from 'express';
import { MongoFilter } from 'shared/filter/mongo.filter';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { sanitizeSale } from './sale.utils';
import { SaleDto } from './dto/sale.dto';
@Controller({ path: 'sales', scope: Scope.REQUEST })
export class SaleController {
  constructor(private saleService: SaleService) {}

  @Get('')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters(MongoFilter)
  async findAll(
    @Req() req: Request,
    @Response() res,
  ): Promise<any> {
    return res.json(await this.saleService.findAll());
  }

  @Get(':code')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters(MongoFilter)
  async getSaleByCode(
    @Param('code') code: string,
    @Query('withSeller', new DefaultValuePipe(false)) withSeller?: boolean,
    @Query('withCustomer', new DefaultValuePipe(false)) withCustomer?: boolean,
    @Query('layout') layout?: string,
  ): Promise<any> {
    const result = await this.saleService.findByCode(
      code,
      withSeller,
      withCustomer,
      layout,
    );
    console.log(result);
    return result;
  }

  @Post('/search')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async searchUsers(@Body() query: any): Promise<any> {
    return await this.saleService.search(query.queryParams);
  }

  @Post('')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesGuard)
  //@UseFilters(MongoFilter)
  async createSale(@Req() req: Request, @Body() sale: any): Promise<Partial<SaleDto>> {
    sanitizeSale(sale);
    return await this.saleService.save(sale);
  }

  @Post(':code/renew')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters(MongoFilter)
  async renewSale(
    @Req() req: Request,
    @Param('code') code: string,
    @Body() sale: any,
  ): Promise<Partial<SaleDto>> {
    sanitizeSale(sale);
    return await this.saleService.renew(code, sale);
  }

  @Put(':code')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters(MongoFilter)
  async updateSale(
    @Req() req: Request,
    @Param('code') code: string,
    @Body() sale: UpdateSaleDto,
  ): Promise<Partial<SaleDto>> {
    sanitizeSale(sale);
    return await this.saleService.update(code, sale);
  }

  @Delete(':code')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteSale(@Param('code') code: string): Promise<Sale> {
    return await this.saleService.deleteByCode(code);
  }

  @Post('/delete')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters(MongoFilter)
  async deleteSales(@Req() req: Request, @Body() body: any): Promise<any> {
    let codes: string[] = body['codes'];
    return await this.saleService.batchDelete(codes);
  }
}
