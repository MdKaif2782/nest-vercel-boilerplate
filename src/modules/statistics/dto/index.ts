import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';



export class FinancialSummaryDto {
  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  totalExpenses: number;

  @ApiProperty()
  netProfit: number;

  @ApiProperty()
  grossProfit: number;

  @ApiProperty()
  profitMargin: number;

  @ApiProperty()
  revenueGrowth: number;

  @ApiProperty()
  expenseGrowth: number;
}

export class SalesAnalyticsDto {
  monthlySales: PeriodicSalesDataDto[];

  byChannel: SalesChannelDto[];

  topProducts: TopProductDto[];

  salesTrend: 'up' | 'down' | 'stable';
}

export class PeriodicSalesDataDto {
  @ApiProperty()
  period: string;

  @ApiProperty()
  corporateSales: number;

  @ApiProperty()
  retailSales: number;

  @ApiProperty()
  totalSales: number;

  @ApiProperty()
  growth: number;
}

export class SalesChannelDto {
  @ApiProperty()
  channel: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  percentage: number;

  @ApiProperty()
  color: string;
}

export class TopProductDto {
  @ApiProperty()
  productName: string;

  @ApiProperty()
  sales: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  growth: number;
}

export class InventoryOverviewDto {
  @ApiProperty()
  totalValue: number;

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  lowStockCount: number;

  @ApiProperty()
  outOfStockCount: number;

  byCategory: InventoryCategoryDto[];

  @ApiProperty()
  turnoverRate: number;
}

export class InventoryCategoryDto {
  @ApiProperty()
  category: string;

  @ApiProperty()
  value: number;

  @ApiProperty()
  percentage: number;

  @ApiProperty()
  color: string;
}

export class ReceivablesSummaryDto {
  @ApiProperty()
  totalReceivable: number;

  @ApiProperty()
  collectedThisMonth: number;

  @ApiProperty()
  overdueAmount: number;

  @ApiProperty()
  collectionRate: number;

  agingBuckets: AgingBucketDto[];
}

export class AgingBucketDto {
  @ApiProperty()
  bucket: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  count: number;

  @ApiProperty()
  percentage: number;

  @ApiProperty()
  color: string;
}

export class InvestorMetricsDto {
  @ApiProperty()
  totalInvestment: number;

  @ApiProperty()
  activeInvestors: number;

  @ApiProperty()
  totalPayouts: number;

  @ApiProperty()
  averageROI: number;

  topPerformers: InvestorPerformanceDto[];
}

export class InvestorPerformanceDto {
  @ApiProperty()
  investorName: string;

  @ApiProperty()
  investment: number;

  @ApiProperty()
  returns: number;

  @ApiProperty()
  roi: number;

  @ApiProperty()
  color: string;
}

export class ExpenseBreakdownDto {
  @ApiProperty()
  totalExpenses: number;


  byCategory: ExpenseCategoryDto[];


  monthlyTrend: MonthlyExpenseDto[];
}

export class ExpenseCategoryDto {
  @ApiProperty()
  category: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  percentage: number;

  @ApiProperty()
  color: string;
}

export class MonthlyExpenseDto {
  @ApiProperty()
  month: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  growth: number;
}

export class EmployeeStatsDto {
  @ApiProperty()
  totalEmployees: number;

  @ApiProperty()
  activeEmployees: number;

  @ApiProperty()
  monthlySalary: number;

  @ApiProperty()
  averageSalary: number;

  @ApiProperty()
  totalAdvanceOutstanding: number;

  @ApiProperty()
  totalSalaryPaidThisYear: number;

  byDesignation: DesignationStatsDto[];
}

export class DesignationStatsDto {
  @ApiProperty()
  designation: string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  avgSalary: number;

  @ApiProperty()
  color: string;
}

export class DepartmentStatsDto {
  @ApiProperty()
  department: string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  avgSalary: number;

  @ApiProperty()
  color: string;
}

export class BusinessHealthDto {
  @ApiProperty()
  profitabilityIndex: number;

  @ApiProperty()
  operatingMargin: number;

  @ApiProperty()
  inventoryTurnover: number;

  @ApiProperty()
  currentRatio: number;

  @ApiProperty()
  quickRatio: number;

  @ApiProperty()
  cashFlow: number;

  @ApiProperty()
  healthScore: number;

  @ApiProperty()
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

export class ActivityLogDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: 'sale' | 'purchase' | 'payment' | 'investment' | 'expense' | 'inventory';

  @ApiProperty()
  description: string;

  @ApiProperty()
  amount?: number;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  user: string;

  @ApiProperty()
  icon: string;

  @ApiProperty()
  color: string;
}

export class QuickStatsDto {
  @ApiProperty()
  todaySales: number;

  @ApiProperty()
  weekSales: number;

  @ApiProperty()
  monthSales: number;

  @ApiProperty()
  pendingOrders: number;

  @ApiProperty()
  unpaidBills: number;

  @ApiProperty()
  lowStockAlerts: number;

  @ApiProperty()
  activeInvestments: number;
}

export class DateRangeDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class ChartDataDto {
  @ApiProperty()
  labels: string[];

  @ApiProperty()
  datasets: ChartDatasetDto[];
}

export class ChartDatasetDto {
  @ApiProperty()
  label: string;

  @ApiProperty({ type: [Number] })
  data: number[];

  @ApiProperty()
  backgroundColor: string | string[];

  @ApiProperty()
  borderColor?: string | string[];

  @ApiProperty()
  borderWidth?: number;
}

export class DashboardStatsDto {
  @ApiProperty()
  financialSummary: FinancialSummaryDto;

  @ApiProperty()
  salesAnalytics: SalesAnalyticsDto;

  @ApiProperty()
  inventoryOverview: InventoryOverviewDto;

  @ApiProperty()
  receivablesSummary: ReceivablesSummaryDto;

  @ApiProperty()
  investorMetrics: InvestorMetricsDto;

  @ApiProperty()
  expenseBreakdown: ExpenseBreakdownDto;

  @ApiProperty()
  employeeStats: EmployeeStatsDto;

  @ApiProperty()
  businessHealth: BusinessHealthDto;

  recentActivities: ActivityLogDto[];

  @ApiProperty()
  quickStats: QuickStatsDto;
}