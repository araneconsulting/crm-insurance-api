import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { InsurerController } from './insurer.controller';
import { InsurerDataInitializerService } from './insurer-data-initializer.service';
import { InsurerService } from './insurer.service';

@Module({
  imports: [DatabaseModule],
  controllers: [InsurerController],
  providers: [InsurerService, InsurerDataInitializerService],
})
export class InsurerModule{}
