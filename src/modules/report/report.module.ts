import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportPdfService } from './report-pdf.service';
import { ReportController } from './report.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ReportController],
  providers: [ReportService, ReportPdfService],
  exports: [ReportService, ReportPdfService]
})
export class ReportModule {}
