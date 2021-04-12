import { Module } from '@nestjs/common';
import { DashboardController } from 'insurance/dashboard/dashboard.controller';
import { DatabaseModule } from '../../database/database.module';
import { CompanyDataInitializerService } from './company-data-initializer.service';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CompanyController],
  providers: [CompanyService, CompanyDataInitializerService],
})
export class CompanyModule{}

