import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RetailSaleService } from './retail-sale.service';
import { CreateRetailSaleDto } from './dto';
import { AccessTokenGuard } from '../auth/auth.guard';

@Controller('retail-sales')
export class RetailSaleController {
  constructor(private readonly retailSaleService: RetailSaleService) {}

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
}
