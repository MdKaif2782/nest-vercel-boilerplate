export declare class FinancialSummaryDto {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    grossProfit: number;
    profitMargin: number;
    revenueGrowth: number;
    expenseGrowth: number;
}
export declare class SalesAnalyticsDto {
    monthlySales: PeriodicSalesDataDto[];
    byChannel: SalesChannelDto[];
    topProducts: TopProductDto[];
    salesTrend: 'up' | 'down' | 'stable';
}
export declare class PeriodicSalesDataDto {
    period: string;
    corporateSales: number;
    retailSales: number;
    totalSales: number;
    growth: number;
}
export declare class SalesChannelDto {
    channel: string;
    amount: number;
    percentage: number;
    color: string;
}
export declare class TopProductDto {
    productName: string;
    sales: number;
    quantity: number;
    growth: number;
}
export declare class InventoryOverviewDto {
    totalValue: number;
    totalItems: number;
    lowStockCount: number;
    outOfStockCount: number;
    byCategory: InventoryCategoryDto[];
    turnoverRate: number;
}
export declare class InventoryCategoryDto {
    category: string;
    value: number;
    percentage: number;
    color: string;
}
export declare class ReceivablesSummaryDto {
    totalReceivable: number;
    collectedThisMonth: number;
    overdueAmount: number;
    collectionRate: number;
    agingBuckets: AgingBucketDto[];
}
export declare class AgingBucketDto {
    bucket: string;
    amount: number;
    count: number;
    percentage: number;
    color: string;
}
export declare class InvestorMetricsDto {
    totalInvestment: number;
    activeInvestors: number;
    totalPayouts: number;
    averageROI: number;
    topPerformers: InvestorPerformanceDto[];
}
export declare class InvestorPerformanceDto {
    investorName: string;
    investment: number;
    returns: number;
    roi: number;
    color: string;
}
export declare class ExpenseBreakdownDto {
    totalExpenses: number;
    byCategory: ExpenseCategoryDto[];
    monthlyTrend: MonthlyExpenseDto[];
}
export declare class ExpenseCategoryDto {
    category: string;
    amount: number;
    percentage: number;
    color: string;
}
export declare class MonthlyExpenseDto {
    month: string;
    amount: number;
    growth: number;
}
export declare class EmployeeStatsDto {
    totalEmployees: number;
    activeEmployees: number;
    monthlySalary: number;
    averageSalary: number;
    totalAdvanceOutstanding: number;
    totalSalaryPaidThisYear: number;
    byDesignation: DesignationStatsDto[];
}
export declare class DesignationStatsDto {
    designation: string;
    count: number;
    avgSalary: number;
    color: string;
}
export declare class DepartmentStatsDto {
    department: string;
    count: number;
    avgSalary: number;
    color: string;
}
export declare class BusinessHealthDto {
    profitabilityIndex: number;
    operatingMargin: number;
    inventoryTurnover: number;
    currentRatio: number;
    quickRatio: number;
    cashFlow: number;
    healthScore: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
}
export declare class ActivityLogDto {
    id: string;
    type: 'sale' | 'purchase' | 'payment' | 'investment' | 'expense' | 'inventory';
    description: string;
    amount?: number;
    timestamp: Date;
    user: string;
    icon: string;
    color: string;
}
export declare class QuickStatsDto {
    todaySales: number;
    weekSales: number;
    monthSales: number;
    pendingOrders: number;
    unpaidBills: number;
    lowStockAlerts: number;
    activeInvestments: number;
}
export declare class DateRangeDto {
    startDate?: string;
    endDate?: string;
}
export declare class ChartDataDto {
    labels: string[];
    datasets: ChartDatasetDto[];
}
export declare class ChartDatasetDto {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
}
export declare class DashboardStatsDto {
    financialSummary: FinancialSummaryDto;
    salesAnalytics: SalesAnalyticsDto;
    inventoryOverview: InventoryOverviewDto;
    receivablesSummary: ReceivablesSummaryDto;
    investorMetrics: InvestorMetricsDto;
    expenseBreakdown: ExpenseBreakdownDto;
    employeeStats: EmployeeStatsDto;
    businessHealth: BusinessHealthDto;
    recentActivities: ActivityLogDto[];
    quickStats: QuickStatsDto;
}
