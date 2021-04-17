import { Module } from '@nestjs/common';
import { DashboardController } from 'insurance/dashboard/dashboard.controller';
import { DatabaseModule } from '../../database/database.module';
import { LocationDataInitializerService } from './location-data-initializer.service';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';

@Module({
  imports: [DatabaseModule],
  controllers: [LocationController],
  providers: [LocationService, LocationDataInitializerService],
})
export class LocationModule{}

