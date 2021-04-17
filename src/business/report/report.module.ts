import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule{}
