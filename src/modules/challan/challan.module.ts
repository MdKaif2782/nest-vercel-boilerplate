import { Module } from '@nestjs/common';
import { ChallanService } from './challan.service';
import { ChallanController } from './challan.controller';

@Module({
  controllers: [ChallanController],
  providers: [ChallanService],
})
export class ChallanModule {}
