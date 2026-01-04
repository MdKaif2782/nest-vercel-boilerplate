import { Module } from '@nestjs/common';
import { BillService } from './bill.service';
import { BillController } from './bill.controller';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [PdfModule],
  controllers: [BillController],
  providers: [BillService],
})
export class BillModule {}
