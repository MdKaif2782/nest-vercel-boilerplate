import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Res,
  HttpStatus
} from '@nestjs/common';
import { ChallanService } from './challan.service';
import {
  CreateChallanDto,
  UpdateChallanStatusDto,
  DispatchBPODto
} from './dto';
import { Response } from 'express';

@Controller('challans')
export class ChallanController {
  constructor(private readonly challanService: ChallanService) { }

  // ---------- STATIC ROUTES ----------
  @Get('pending-bpos')
  async getPendingBPOs() {
    return this.challanService.getPendingBPOs();
  }

  @Get('dispatch-summary')
  async getDispatchSummary() {
    return this.challanService.getDispatchSummary();
  }

  @Post('dispatch-bpo')
  async markAsDispatched(@Body() dto: DispatchBPODto) {
    return this.challanService.markAsDispatched(dto);
  }

  @Get('bpo/:bpoId/challans')
  async getChallansByBPO(@Param('bpoId') bpoId: string) {
    return this.challanService.getChallansByBPOId(bpoId);
  }

  // ---------- GENERIC ROUTES ----------
  @Get()
  async getAllChallans() {
    return this.challanService.getAllChallans();
  }

  @Post()
  async createChallan(@Body() dto: CreateChallanDto) {
    return this.challanService.createChallan(dto);
  }

  // ---------- DYNAMIC ROUTES (LAST) ----------
  @Get(':id')
  async getChallanById(@Param('id') id: string) {
    return this.challanService.getChallanById(id);
  }

  @Get(':id/pdf')
  async getPdf(@Param('id') id: string, @Res() res: Response) {
    try {
      const pdfBuffer = await this.challanService.generatePdf(id);

      // Set headers for PDF download
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quotation-${id}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      // Send PDF
      res.status(HttpStatus.OK).send(pdfBuffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to generate PDF',
        error: error.message,
      });
    }
  }

  @Put(':id/status')
  async updateChallanStatus(
    @Param('id') id: string,
    @Body() dto: UpdateChallanStatusDto,
  ) {
    return this.challanService.updateChallanStatus(id, dto);
  }
}
