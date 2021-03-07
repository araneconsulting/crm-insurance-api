import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { SaleController } from './sale.controller';
import { SaleDataInitializerService } from './sale-data-initializer.service';
import { SaleService } from './sale.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SaleController],
  providers: [SaleService, SaleDataInitializerService],
})
export class SaleModule{}
