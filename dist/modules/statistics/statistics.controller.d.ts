import { StatisticsService } from './statistics.service';
import { DashboardStatsDto, DateRangeDto, ChartDataDto } from './dto';
export declare class StatisticsController {
    private readonly statisticsService;
    constructor(statisticsService: StatisticsService);
    getDashboardStats(query: DateRangeDto): Promise<DashboardStatsDto>;
    getSalesChartData(query: DateRangeDto): Promise<ChartDataDto>;
    getExpenseChartData(query: DateRangeDto): Promise<ChartDataDto>;
    getInventoryChartData(): Promise<ChartDataDto>;
    getQuickStats(query: DateRangeDto): Promise<import("./dto").QuickStatsDto>;
}
