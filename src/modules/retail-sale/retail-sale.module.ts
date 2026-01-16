import { Module } from '@nestjs/common';
import { RetailSaleController } from './retail-sale.controller';
import { RetailSaleService } from './retail-sale.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RetailSaleController],
  providers: [RetailSaleService],
  exports: [RetailSaleService],
})
export class RetailSaleModule {}
