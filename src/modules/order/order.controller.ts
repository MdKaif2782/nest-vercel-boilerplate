import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UsePipes, 
  ValidationPipe,
  ParseIntPipe 
} from '@nestjs/common';
import { OrderService } from './order.service';
import { 
  CreateOrderDto, 
  UpdateOrderDto, 
  OrderSummaryDto,
  InvestorProfitSummaryDto,
  OrderProductDto,
  OrderTimelineEventDto 
} from './dto';

@Controller('orders')
@UsePipes(new ValidationPipe({ transform: true }))
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('status') status?: string
  ) {
    return this.orderService.findAll(page, limit, status);
  }

  @Get('statistics')
  async getStatistics() {
    return this.orderService.getOrderStatistics();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Get(':id/summary')
  async getSummary(@Param('id') id: string): Promise<OrderSummaryDto> {
    return this.orderService.getOrderSummary(id);
  }

  @Get(':id/profits')
  async getInvestorProfits(@Param('id') id: string): Promise<InvestorProfitSummaryDto[]> {
    return this.orderService.calculateInvestorProfits(id);
  }

  @Get(':id/products')
  async getProducts(@Param('id') id: string): Promise<OrderProductDto[]> {
    return this.orderService.getOrderProducts(id);
  }

  @Get(':id/timeline')
  async getTimeline(@Param('id') id: string): Promise<OrderTimelineEventDto[]> {
    return this.orderService.getOrderStatusTimeline(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.updateOrder(id, updateOrderDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.orderService.deleteOrder(id);
  }
}