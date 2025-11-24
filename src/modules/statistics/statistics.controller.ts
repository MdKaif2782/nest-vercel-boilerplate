import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import {
  DashboardStatsDto,
  DateRangeDto,
  ChartDataDto,
} from './dto';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get comprehensive dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully', type: DashboardStatsDto })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getDashboardStats(@Query() query: DateRangeDto): Promise<DashboardStatsDto> {
    return this.statisticsService.getDashboardStats(query);
  }

  @Get('sales-chart')
  @ApiOperation({ summary: 'Get sales data for charts' })
  @ApiResponse({ status: 200, description: 'Sales chart data retrieved successfully', type: ChartDataDto })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getSalesChartData(@Query() query: DateRangeDto): Promise<ChartDataDto> {
    return this.statisticsService.getSalesChartData(query);
  }

  @Get('expense-chart')
  @ApiOperation({ summary: 'Get expense data for charts' })
  @ApiResponse({ status: 200, description: 'Expense chart data retrieved successfully', type: ChartDataDto })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getExpenseChartData(@Query() query: DateRangeDto): Promise<ChartDataDto> {
    return this.statisticsService.getExpenseChartData(query);
  }

  @Get('inventory-chart')
  @ApiOperation({ summary: 'Get inventory data for charts' })
  @ApiResponse({ status: 200, description: 'Inventory chart data retrieved successfully', type: ChartDataDto })
  async getInventoryChartData(): Promise<ChartDataDto> {
    return this.statisticsService.getInventoryChartData();
  }

  @Get('quick-stats')
  @ApiOperation({ summary: 'Get quick stats for dashboard cards' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getQuickStats(@Query() query: DateRangeDto) {
    return this.statisticsService.getQuickStats(query);
  }
}