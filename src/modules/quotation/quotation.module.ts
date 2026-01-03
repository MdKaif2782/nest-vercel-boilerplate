import { Module } from '@nestjs/common';
import { QuotationService } from './quotation.service';
import { QuotationController } from './quotation.controller';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports:[PdfModule],
  controllers: [QuotationController],
  providers: [QuotationService],
})
export class QuotationModule {}
