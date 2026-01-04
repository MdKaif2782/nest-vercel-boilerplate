// src/bill/bill.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { BillService } from './bill.service';
import { BillSearchDto, AddPaymentDto, CreateBillDto } from './dto';
import { Request, Response } from 'express';
import { AccessTokenGuard } from '../auth/auth.guard';

@Controller('bills')
export class BillController {
  constructor(private readonly billService: BillService) { }

  @Post()
  @UseGuards(AccessTokenGuard)
  async create(
    @Req() req: Request,
    @Body(ValidationPipe) createBillDto: CreateBillDto) {
    const request = req as any as { user: { id: string } };
    return await this.billService.create(createBillDto, request.user.id);
  }

  @Get()
  async findAll(@Query(ValidationPipe) searchDto: BillSearchDto) {
    return await this.billService.findAll(searchDto);
  }

  @Get('stats')
  getStats() {
    return this.billService.getStats();
  }

  @Get('recent')
  getRecentBills(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.billService.getRecentBills(limit);
  }

  @Get('available-pos')
  getAvailableBuyerPOs() {
    return this.billService.getAvailableBuyerPOs();
  }

  @Get('by-buyer-po/:buyerPOId')
  getBillsByBuyerPO(@Param('buyerPOId') buyerPOId: string) {
    return this.billService.getBillsByBuyerPO(buyerPOId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billService.findOne(id);
  }

  @Get(':id/pdf')
  async getPdf(@Param('id') id: string, @Res() res: Response) {
    try {
      const pdfBuffer = await this.billService.generatePdf(id);

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

  @Post(':id/payments')
  @HttpCode(HttpStatus.OK)
  addPayment(
    @Param('id') id: string,
    @Body(ValidationPipe) addPaymentDto: AddPaymentDto,
  ) {
    return this.billService.addPayment(id, addPaymentDto);
  }
}