import { Module } from '@nestjs/common';
import { DashboardController } from 'insurance/dashboard/dashboard.controller';
import { ReportService } from 'insurance/report/report.service';
import { SendgridModule } from 'sendgrid/sendgrid.module';
import { SendgridService } from 'sendgrid/sendgrid.service';
import { UserService } from 'user/user.service';
import { DatabaseModule } from '../../database/database.module';
import { PayrollDataInitializerService } from './payroll-data-initializer.service';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';

@Module({
  imports: [DatabaseModule,SendgridModule],
  controllers: [PayrollController],
  providers: [PayrollService, ReportService, SendgridService, UserService, PayrollDataInitializerService],
})
export class PayrollModule{}

