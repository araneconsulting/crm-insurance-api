import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { CustomerModule } from './insurance/customer/customer.module';
import { SendgridModule } from './sendgrid/sendgrid.module';
import { UserModule } from './user/user.module';
import { LoggerModule } from './logger/logger.module';
import { InsurerModule } from 'insurance/insurer/insurer.module';
import { SaleModule } from 'insurance/sale/sale.module';
import { ReportModule } from 'insurance/report/report.module';
import { DashboardModule } from 'insurance/dashboard/dashboard.module';
import { CompanyModule } from 'business-management/company/company.module';
import { LocationModule } from 'business-management/location/location.module';

@Module({
  imports: [
    ConfigModule.forRoot({cache: true,}),
    ReportModule,
    SaleModule,
    DatabaseModule,
    CustomerModule,
    InsurerModule,
    DashboardModule,
    AuthModule,
    CompanyModule,
    LocationModule,
    UserModule,
    SendgridModule,
    LoggerModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
  exports:[AppService]
})
export class AppModule { }
