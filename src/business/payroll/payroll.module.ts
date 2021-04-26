import { Module } from '@nestjs/common';
import { DashboardController } from 'insurance/dashboard/dashboard.controller';
import { DatabaseModule } from '../../database/database.module';
import { PayrollDataInitializerService } from './payroll-data-initializer.service';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PayrollController],
  providers: [PayrollService, PayrollDataInitializerService],
})
export class PayrollModule{}

