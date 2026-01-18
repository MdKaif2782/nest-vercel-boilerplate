import { Module } from '@nestjs/common';
import { RetailSaleController } from './retail-sale.controller';
import { RetailSaleService } from './retail-sale.service';
import { RetailSalePdfService } from './retail-sale-pdf.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RetailSaleController],
  providers: [RetailSaleService, RetailSalePdfService],
  exports: [RetailSaleService, RetailSalePdfService],
})
export class RetailSaleModule {}
