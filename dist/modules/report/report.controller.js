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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const common_1 = require("@nestjs/common");
const report_service_1 = require("./report.service");
const report_query_dto_1 = require("./dto/report-query.dto");
let ReportController = class ReportController {
    constructor(reportService) {
        this.reportService = reportService;
    }
    async getInventorySummary() {
        return this.reportService.getInventorySummary();
    }
    async getCompanyWiseStock() {
        return this.reportService.getCompanyWiseStock();
    }
    async getLowStockReport() {
        return this.reportService.getLowStockReport();
    }
    async getCompanyReceivables() {
        return this.reportService.getCompanyReceivables();
    }
    async getReceivableAging() {
        return this.reportService.getReceivableAging();
    }
    async getBillingSummary() {
        return this.reportService.getBillingSummary();
    }
    async getInvestorSummary() {
        return this.reportService.getInvestorSummary();
    }
    async getInvestmentBreakdown(investorId) {
        return this.reportService.getInvestmentBreakdown(investorId);
    }
    async getExpenseByCategory(query) {
        return this.reportService.getExpenseByCategory(query);
    }
    async getPeriodicExpenses(query) {
        return this.reportService.getPeriodicExpenses(query);
    }
    async getSalesSummary(query) {
        return this.reportService.getSalesSummary(query);
    }
    async getPeriodicSales(query) {
        return [];
    }
    async getSalarySummary() {
        return this.reportService.getSalarySummary();
    }
    async getMonthlySalaries(query) {
        return this.reportService.getMonthlySalaries(query);
    }
    async getBusinessHealth(query) {
        return this.reportService.getBusinessHealth(query);
    }
    async getCorporateSummary(query) {
        return this.reportService.getCorporateSummary(query);
    }
    async getQuickStats() {
        const [inventorySummary, billingSummary, salesSummary, salarySummary, investorSummary,] = await Promise.all([
            this.reportService.getInventorySummary(),
            this.reportService.getBillingSummary(),
            this.reportService.getSalesSummary({}),
            this.reportService.getSalarySummary(),
            this.reportService.getInvestorSummary(),
        ]);
        const totalDueToInvestors = investorSummary.reduce((sum, investor) => sum + investor.totalDue, 0);
        return {
            inventory: {
                totalItems: inventorySummary.totalItems,
                totalValue: inventorySummary.totalInventoryValue,
                lowStockItems: inventorySummary.lowStockItemsCount,
            },
            receivables: {
                totalDue: billingSummary.totalDue,
                collectionRate: billingSummary.collectionRate,
                totalBills: billingSummary.totalBills,
            },
            sales: {
                totalSales: salesSummary.totalSales,
                netProfit: salesSummary.netProfit,
                profitMargin: salesSummary.netMargin,
            },
            investors: {
                totalInvestment: investorSummary.reduce((sum, inv) => sum + inv.totalInvestment, 0),
                totalDue: totalDueToInvestors,
                activeInvestors: investorSummary.filter(inv => inv.activeInvestments > 0).length,
            },
            employees: {
                totalSalary: salarySummary.totalSalaryExpense,
                activeEmployees: salarySummary.activeEmployees,
            },
        };
    }
};
exports.ReportController = ReportController;
__decorate([
    (0, common_1.Get)('inventory/summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getInventorySummary", null);
__decorate([
    (0, common_1.Get)('inventory/company-stock'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getCompanyWiseStock", null);
__decorate([
    (0, common_1.Get)('inventory/low-stock'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getLowStockReport", null);
__decorate([
    (0, common_1.Get)('receivable/company-wise'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getCompanyReceivables", null);
__decorate([
    (0, common_1.Get)('receivable/aging'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getReceivableAging", null);
__decorate([
    (0, common_1.Get)('billing/summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getBillingSummary", null);
__decorate([
    (0, common_1.Get)('investors/summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getInvestorSummary", null);
__decorate([
    (0, common_1.Get)('investors/:id/breakdown'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getInvestmentBreakdown", null);
__decorate([
    (0, common_1.Get)('expenses/by-category'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.DateRangeDto]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getExpenseByCategory", null);
__decorate([
    (0, common_1.Get)('expenses/periodic'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.PeriodQueryDto]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getPeriodicExpenses", null);
__decorate([
    (0, common_1.Get)('sales/summary'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.DateRangeDto]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getSalesSummary", null);
__decorate([
    (0, common_1.Get)('sales/periodic'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.PeriodQueryDto]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getPeriodicSales", null);
__decorate([
    (0, common_1.Get)('employees/salary-summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getSalarySummary", null);
__decorate([
    (0, common_1.Get)('employees/monthly-salaries'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.PeriodQueryDto]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getMonthlySalaries", null);
__decorate([
    (0, common_1.Get)('business-health'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.DateRangeDto]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getBusinessHealth", null);
__decorate([
    (0, common_1.Get)('corporate-summary'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.PeriodQueryDto]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getCorporateSummary", null);
__decorate([
    (0, common_1.Get)('dashboard/quick-stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getQuickStats", null);
exports.ReportController = ReportController = __decorate([
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [report_service_1.ReportService])
], ReportController);
//# sourceMappingURL=report.controller.js.map