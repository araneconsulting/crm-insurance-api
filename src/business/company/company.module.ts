import { Module } from '@nestjs/common';
import { LocationService } from 'business/location/location.service';
import { CustomerModule } from 'insurance/customer/customer.module';
import { CustomerService } from 'insurance/customer/customer.service';
import { InsurerService } from 'insurance/insurer/insurer.service';
import { SendgridModule } from 'sendgrid/sendgrid.module';
import { SendgridService } from 'sendgrid/sendgrid.service';
import { UserModule } from 'user/user.module';
import { UserService } from 'user/user.service';
import { DatabaseModule } from '../../database/database.module';
import { CompanyDataInitializerService } from './company-data-initializer.service';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

@Module({
  imports: [DatabaseModule, SendgridModule, UserModule],
  controllers: [CompanyController],
  providers: [
    SendgridService,
    CompanyService,
    UserService,
    LocationService,
    CustomerService,
    InsurerService,
    CompanyDataInitializerService,
  ],
})
export class CompanyModule {}
