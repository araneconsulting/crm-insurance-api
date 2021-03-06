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
import { HasRoles } from '../../auth/guard/has-roles.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { ParseObjectIdPipe } from '../../shared/pipe/parse-object-id.pipe';
import { Sale } from '../../database/sale.model';
import { SaleService } from './sale.service';
import { UpdateSaleDto } from './update-sale.dto';
import { Request } from 'express';
import { User } from 'database/user.model';
import { BadRequestFilter } from 'shared/filter/bad-request.filter';
import { MongoFilter } from 'shared/filter/mongo.filter';

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
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('type') type?: string,
  ): Promise<any> {
    const user: Partial<User> = req.user;
    return res.json(
      await this.saleService.findAll(user, startDate, endDate, type),
    );
  }

  @Get(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters(MongoFilter)
  getSaleById(
    @Param('id', ParseObjectIdPipe) id: string,
    @Query('withSeller', new DefaultValuePipe(false)) withSeller?: boolean,
    @Query('withCustomer', new DefaultValuePipe(false)) withCustomer?: boolean,
    @Query('withInsurers', new DefaultValuePipe(false)) withInsurers?: boolean,
  ): Observable<Sale> {
    return this.saleService.findById(
      id,
      withSeller,
      withCustomer,
      withInsurers,
    );
  }

  @Post('')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters(MongoFilter)
  async createSale(@Req() req: Request, @Body() sale: any): Promise<Sale> {
    return await this.saleService.save(sale, req.user);
  }

  @Put(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters(MongoFilter)
  async updateSale(
    @Req() req: Request,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() sale: UpdateSaleDto,
  ): Promise<Sale> {
    return await this.saleService.update(id, sale, req.user);
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  deleteSaleById(@Param('id', ParseObjectIdPipe) id: string): Observable<Sale> {
    return this.saleService.deleteById(id);
  }
}
