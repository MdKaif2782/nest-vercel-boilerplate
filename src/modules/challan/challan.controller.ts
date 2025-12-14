import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Param, 
  Query,
  ParseUUIDPipe 
} from '@nestjs/common';
import { ChallanService } from './challan.service';
import { 
  CreateChallanDto, 
  UpdateChallanStatusDto, 
  DispatchBPODto 
} from './dto';

@Controller('challans')
export class ChallanController {
  constructor(private readonly challanService: ChallanService) {}

  @Get('pending-bpos')
  async getPendingBPOs() {
    return this.challanService.getPendingBPOs();
  }

  @Get('dispatch-summary')
  async getDispatchSummary() {
    return this.challanService.getDispatchSummary();
  }

  @Get()
  async getAllChallans() {
    return this.challanService.getAllChallans();
  }

  @Get(':id')
  async getChallanById(@Param('id', ParseUUIDPipe) id: string) {
    return this.challanService.getChallanById(id);
  }

  @Post()
  async createChallan(@Body() dto: CreateChallanDto) {
    return this.challanService.createChallan(dto);
  }

  @Post('dispatch-bpo')
  async markAsDispatched(@Body() dto: DispatchBPODto) {
    return this.challanService.markAsDispatched(dto);
  }

  @Put(':id/status')
  async updateChallanStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateChallanStatusDto
  ) {
    return this.challanService.updateChallanStatus(id, dto);
  }

  @Get('bpo/:bpoId/challans')
  async getChallansByBPO(@Param('bpoId', ParseUUIDPipe) bpoId: string) {
    // This would be implemented in service
    return this.challanService.getAllChallans(); // Filter by BPO in actual implementation
  }
}