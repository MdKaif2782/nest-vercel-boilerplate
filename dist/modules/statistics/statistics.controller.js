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
exports.StatisticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const statistics_service_1 = require("./statistics.service");
const dto_1 = require("./dto");
let StatisticsController = class StatisticsController {
    constructor(statisticsService) {
        this.statisticsService = statisticsService;
    }
    async getDashboardStats(query) {
        return this.statisticsService.getDashboardStats(query);
    }
    async getSalesChartData(query) {
        return this.statisticsService.getSalesChartData(query);
    }
    async getExpenseChartData(query) {
        return this.statisticsService.getExpenseChartData(query);
    }
    async getInventoryChartData() {
        return this.statisticsService.getInventoryChartData();
    }
    async getQuickStats(query) {
        return this.statisticsService.getQuickStats(query);
    }
};
exports.StatisticsController = StatisticsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get comprehensive dashboard statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard stats retrieved successfully', type: dto_1.DashboardStatsDto }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.DateRangeDto]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('sales-chart'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sales data for charts' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sales chart data retrieved successfully', type: dto_1.ChartDataDto }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.DateRangeDto]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getSalesChartData", null);
__decorate([
    (0, common_1.Get)('expense-chart'),
    (0, swagger_1.ApiOperation)({ summary: 'Get expense data for charts' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Expense chart data retrieved successfully', type: dto_1.ChartDataDto }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.DateRangeDto]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getExpenseChartData", null);
__decorate([
    (0, common_1.Get)('inventory-chart'),
    (0, swagger_1.ApiOperation)({ summary: 'Get inventory data for charts' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inventory chart data retrieved successfully', type: dto_1.ChartDataDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getInventoryChartData", null);
__decorate([
    (0, common_1.Get)('quick-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get quick stats for dashboard cards' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.DateRangeDto]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getQuickStats", null);
exports.StatisticsController = StatisticsController = __decorate([
    (0, swagger_1.ApiTags)('Statistics'),
    (0, common_1.Controller)('statistics'),
    __metadata("design:paramtypes", [statistics_service_1.StatisticsService])
], StatisticsController);
//# sourceMappingURL=statistics.controller.js.map