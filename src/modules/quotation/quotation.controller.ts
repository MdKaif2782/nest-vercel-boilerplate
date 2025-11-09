// src/quotation/quotation.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  ValidationPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { QuotationService } from './quotation.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { QuotationSearchDto } from './dto/update-quotation.dto';
import { AcceptQuotationDto } from './dto/update-quotation.dto';

@Controller('quotations')
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  @Post()
  create(@Body(ValidationPipe) createQuotationDto: CreateQuotationDto) {
    return this.quotationService.create(createQuotationDto);
  }

  @Get()
  findAll(@Query(ValidationPipe) searchDto: QuotationSearchDto) {
    return this.quotationService.findAll(searchDto);
  }

  @Get('expired')
  getExpiredQuotations() {
    return this.quotationService.getExpiredQuotations();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotationService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateQuotationDto: UpdateQuotationDto,
  ) {
    return this.quotationService.update(id, updateQuotationDto);
  }

  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  acceptQuotation(
    @Param('id') id: string,
    @Body(ValidationPipe) acceptQuotationDto: AcceptQuotationDto,
  ) {
    return this.quotationService.acceptQuotation(id, acceptQuotationDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED',
  ) {
    return this.quotationService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.quotationService.remove(id);
  }
}