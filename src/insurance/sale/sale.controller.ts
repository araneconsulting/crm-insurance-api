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
    @Query('start_date') startDate?: Date,
    @Query('end_date') endDate?: Date,
    @Query('type') type?: string,
  ): Promise<any> {
    return res.json(await this.saleService.findAll(startDate, endDate, type));
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
  ): Promise<Partial<Sale>> {
    return await this.saleService.findByCode(
      code,
      withSeller,
      withCustomer,
      layout,
    );
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
  async createSale(@Req() req: Request, @Body() sale: any): Promise<Sale> {
    sanitizeSale(sale);
    return await this.saleService.save(sale);
  }

  @Post(':code/endorse')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters(MongoFilter)
  async endorseSale(
    @Req() req: Request,
    @Param('code') code: string,
    @Body() sale: any,
  ): Promise<Sale> {
    sanitizeSale(sale);
    return await this.saleService.endorse(sale);
  }

  @Post(':code/renew')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters(MongoFilter)
  async renewSale(
    @Req() req: Request,
    @Param('code') code: string,
    @Body() sale: any,
  ): Promise<Sale> {
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
  ): Promise<Sale> {
    sanitizeSale(sale);
    return await this.saleService.update(code, sale);
  }

  @Delete(':code')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  deleteSale(@Param('code') code: string): Observable<Sale> {
    return this.saleService.deleteByCode(code);
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
