import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  Delete,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { RetailSaleService } from './retail-sale.service';
import { RetailSalePdfService } from './retail-sale-pdf.service';
import { CreateRetailSaleDto } from './dto';
import { AccessTokenGuard } from '../auth/auth.guard';

@Controller('retail-sales')
export class RetailSaleController {
  constructor(
    private readonly retailSaleService: RetailSaleService,
    private readonly retailSalePdfService: RetailSalePdfService,
  ) {}

  @Post()
  create(@Body() createRetailSaleDto: CreateRetailSaleDto) {
    return this.retailSaleService.createRetailSale(createRetailSaleDto);
  }

  @Get()
  
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('paymentMethod') paymentMethod?: string,
  ) {
    return this.retailSaleService.getAllRetailSales({
      page,
      limit,
      search,
      startDate,
      endDate,
      paymentMethod: paymentMethod as any,
    });
  }

  @Get('analytics')
  getAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.retailSaleService.getRetailAnalytics(startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.retailSaleService.getRetailSaleById(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.retailSaleService.deleteRetailSale(id);
  }

// In your controller
@Get('invoice/:id')
async generateInvoice(@Param('id') retailSaleId: string, @Res() res: Response) {
  const buffer = await this.retailSalePdfService.generateSalesInvoice(retailSaleId);
  
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="invoice-${retailSaleId}.pdf"`
  });
  
  res.send(buffer);
}

@Get('receipt/:id')
async generateReceipt(@Param('id') retailSaleId: string, @Res() res: Response) {
  const buffer = await this.retailSalePdfService.generateReceipt(retailSaleId);
  
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="receipt-${retailSaleId}.pdf"`
  });
  
  res.send(buffer);
}
}
