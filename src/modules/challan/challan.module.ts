import { Module } from '@nestjs/common';
import { ChallanService } from './challan.service';
import { ChallanController } from './challan.controller';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [PdfModule],
  controllers: [ChallanController],
  providers: [ChallanService],
})
export class ChallanModule {}
