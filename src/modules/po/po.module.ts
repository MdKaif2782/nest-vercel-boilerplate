import { Module } from '@nestjs/common';
import { PurchaseOrderController } from './po.controller';
import { PurchaseOrderService } from './po.service';

@Module({
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService],
})
export class PoModule {}
