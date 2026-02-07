import { DatabaseService } from '../database/database.service';
import { DashboardStatsDto, QuickStatsDto, ChartDataDto, DateRangeDto } from './dto';
export declare class StatisticsService {
    private prisma;
    constructor(prisma: DatabaseService);
    getDashboardStats(range?: DateRangeDto): Promise<DashboardStatsDto>;
    private getFinancialSummary;
    private getSalesAnalytics;
    private getMonthlySalesData;
    private getSalesByChannel;
    private getTopProducts;
    private getSalesTrend;
    private getInventoryOverview;
    private getReceivablesSummary;
    private getInvestorMetrics;
    private getExpenseBreakdown;
    private getMonthlyExpenseTrend;
    private getEmployeeStats;
    private getBusinessHealth;
    private getRecentActivities;
    getQuickStats(range?: DateRangeDto): Promise<QuickStatsDto>;
    private getSalesSummary;
    private getTotalExpenses;
    private getPreviousPeriod;
    private getMonthName;
    getSalesChartData(range?: DateRangeDto): Promise<ChartDataDto>;
    getExpenseChartData(range?: DateRangeDto): Promise<ChartDataDto>;
    getInventoryChartData(): Promise<ChartDataDto>;
}
