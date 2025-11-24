"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardStatsDto = exports.ChartDatasetDto = exports.ChartDataDto = exports.DateRangeDto = exports.QuickStatsDto = exports.ActivityLogDto = exports.BusinessHealthDto = exports.DepartmentStatsDto = exports.EmployeeStatsDto = exports.MonthlyExpenseDto = exports.ExpenseCategoryDto = exports.ExpenseBreakdownDto = exports.InvestorPerformanceDto = exports.InvestorMetricsDto = exports.AgingBucketDto = exports.ReceivablesSummaryDto = exports.InventoryCategoryDto = exports.InventoryOverviewDto = exports.TopProductDto = exports.SalesChannelDto = exports.PeriodicSalesDataDto = exports.SalesAnalyticsDto = exports.FinancialSummaryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class FinancialSummaryDto {
}
exports.FinancialSummaryDto = FinancialSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], FinancialSummaryDto.prototype, "totalRevenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], FinancialSummaryDto.prototype, "totalExpenses", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], FinancialSummaryDto.prototype, "netProfit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], FinancialSummaryDto.prototype, "grossProfit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], FinancialSummaryDto.prototype, "profitMargin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], FinancialSummaryDto.prototype, "revenueGrowth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], FinancialSummaryDto.prototype, "expenseGrowth", void 0);
class SalesAnalyticsDto {
}
exports.SalesAnalyticsDto = SalesAnalyticsDto;
class PeriodicSalesDataDto {
}
exports.PeriodicSalesDataDto = PeriodicSalesDataDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PeriodicSalesDataDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PeriodicSalesDataDto.prototype, "corporateSales", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PeriodicSalesDataDto.prototype, "retailSales", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PeriodicSalesDataDto.prototype, "totalSales", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PeriodicSalesDataDto.prototype, "growth", void 0);
class SalesChannelDto {
}
exports.SalesChannelDto = SalesChannelDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SalesChannelDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SalesChannelDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SalesChannelDto.prototype, "percentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SalesChannelDto.prototype, "color", void 0);
class TopProductDto {
}
exports.TopProductDto = TopProductDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TopProductDto.prototype, "productName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TopProductDto.prototype, "sales", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TopProductDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TopProductDto.prototype, "growth", void 0);
class InventoryOverviewDto {
}
exports.InventoryOverviewDto = InventoryOverviewDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InventoryOverviewDto.prototype, "totalValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InventoryOverviewDto.prototype, "totalItems", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InventoryOverviewDto.prototype, "lowStockCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InventoryOverviewDto.prototype, "outOfStockCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InventoryOverviewDto.prototype, "turnoverRate", void 0);
class InventoryCategoryDto {
}
exports.InventoryCategoryDto = InventoryCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InventoryCategoryDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InventoryCategoryDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InventoryCategoryDto.prototype, "percentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InventoryCategoryDto.prototype, "color", void 0);
class ReceivablesSummaryDto {
}
exports.ReceivablesSummaryDto = ReceivablesSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ReceivablesSummaryDto.prototype, "totalReceivable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ReceivablesSummaryDto.prototype, "collectedThisMonth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ReceivablesSummaryDto.prototype, "overdueAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ReceivablesSummaryDto.prototype, "collectionRate", void 0);
class AgingBucketDto {
}
exports.AgingBucketDto = AgingBucketDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AgingBucketDto.prototype, "bucket", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AgingBucketDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AgingBucketDto.prototype, "count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AgingBucketDto.prototype, "percentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AgingBucketDto.prototype, "color", void 0);
class InvestorMetricsDto {
}
exports.InvestorMetricsDto = InvestorMetricsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InvestorMetricsDto.prototype, "totalInvestment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InvestorMetricsDto.prototype, "activeInvestors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InvestorMetricsDto.prototype, "totalPayouts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InvestorMetricsDto.prototype, "averageROI", void 0);
class InvestorPerformanceDto {
}
exports.InvestorPerformanceDto = InvestorPerformanceDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InvestorPerformanceDto.prototype, "investorName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InvestorPerformanceDto.prototype, "investment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InvestorPerformanceDto.prototype, "returns", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InvestorPerformanceDto.prototype, "roi", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InvestorPerformanceDto.prototype, "color", void 0);
class ExpenseBreakdownDto {
}
exports.ExpenseBreakdownDto = ExpenseBreakdownDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ExpenseBreakdownDto.prototype, "totalExpenses", void 0);
class ExpenseCategoryDto {
}
exports.ExpenseCategoryDto = ExpenseCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ExpenseCategoryDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ExpenseCategoryDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ExpenseCategoryDto.prototype, "percentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ExpenseCategoryDto.prototype, "color", void 0);
class MonthlyExpenseDto {
}
exports.MonthlyExpenseDto = MonthlyExpenseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MonthlyExpenseDto.prototype, "month", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MonthlyExpenseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MonthlyExpenseDto.prototype, "growth", void 0);
class EmployeeStatsDto {
}
exports.EmployeeStatsDto = EmployeeStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], EmployeeStatsDto.prototype, "totalEmployees", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], EmployeeStatsDto.prototype, "activeEmployees", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], EmployeeStatsDto.prototype, "monthlySalary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], EmployeeStatsDto.prototype, "averageSalary", void 0);
class DepartmentStatsDto {
}
exports.DepartmentStatsDto = DepartmentStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DepartmentStatsDto.prototype, "department", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DepartmentStatsDto.prototype, "count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DepartmentStatsDto.prototype, "avgSalary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DepartmentStatsDto.prototype, "color", void 0);
class BusinessHealthDto {
}
exports.BusinessHealthDto = BusinessHealthDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BusinessHealthDto.prototype, "profitabilityIndex", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BusinessHealthDto.prototype, "operatingMargin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BusinessHealthDto.prototype, "inventoryTurnover", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BusinessHealthDto.prototype, "currentRatio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BusinessHealthDto.prototype, "quickRatio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BusinessHealthDto.prototype, "cashFlow", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BusinessHealthDto.prototype, "healthScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessHealthDto.prototype, "status", void 0);
class ActivityLogDto {
}
exports.ActivityLogDto = ActivityLogDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ActivityLogDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ActivityLogDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ActivityLogDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ActivityLogDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ActivityLogDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ActivityLogDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ActivityLogDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ActivityLogDto.prototype, "color", void 0);
class QuickStatsDto {
}
exports.QuickStatsDto = QuickStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], QuickStatsDto.prototype, "todaySales", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], QuickStatsDto.prototype, "weekSales", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], QuickStatsDto.prototype, "monthSales", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], QuickStatsDto.prototype, "pendingOrders", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], QuickStatsDto.prototype, "unpaidBills", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], QuickStatsDto.prototype, "lowStockAlerts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], QuickStatsDto.prototype, "activeInvestments", void 0);
class DateRangeDto {
}
exports.DateRangeDto = DateRangeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DateRangeDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DateRangeDto.prototype, "endDate", void 0);
class ChartDataDto {
}
exports.ChartDataDto = ChartDataDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], ChartDataDto.prototype, "labels", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], ChartDataDto.prototype, "datasets", void 0);
class ChartDatasetDto {
}
exports.ChartDatasetDto = ChartDatasetDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ChartDatasetDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Number] }),
    __metadata("design:type", Array)
], ChartDatasetDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], ChartDatasetDto.prototype, "backgroundColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], ChartDatasetDto.prototype, "borderColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ChartDatasetDto.prototype, "borderWidth", void 0);
class DashboardStatsDto {
}
exports.DashboardStatsDto = DashboardStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", FinancialSummaryDto)
], DashboardStatsDto.prototype, "financialSummary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", SalesAnalyticsDto)
], DashboardStatsDto.prototype, "salesAnalytics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", InventoryOverviewDto)
], DashboardStatsDto.prototype, "inventoryOverview", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", ReceivablesSummaryDto)
], DashboardStatsDto.prototype, "receivablesSummary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", InvestorMetricsDto)
], DashboardStatsDto.prototype, "investorMetrics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", ExpenseBreakdownDto)
], DashboardStatsDto.prototype, "expenseBreakdown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", EmployeeStatsDto)
], DashboardStatsDto.prototype, "employeeStats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", BusinessHealthDto)
], DashboardStatsDto.prototype, "businessHealth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", QuickStatsDto)
], DashboardStatsDto.prototype, "quickStats", void 0);
//# sourceMappingURL=index.js.map