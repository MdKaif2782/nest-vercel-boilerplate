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
exports.ExpenseController = void 0;
const common_1 = require("@nestjs/common");
const expense_service_1 = require("./expense.service");
const create_expense_dto_1 = require("./dto/create-expense.dto");
const update_expense_dto_1 = require("./dto/update-expense.dto");
const auth_guard_1 = require("../auth/auth.guard");
let ExpenseController = class ExpenseController {
    constructor(expensesService) {
        this.expensesService = expensesService;
    }
    create(createExpenseDto, req) {
        const request = req;
        return this.expensesService.create(createExpenseDto, request.user.id);
    }
    async findAll(skip, take, search, category, startDate, endDate, status) {
        const params = {
            skip,
            take,
            search,
            category,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            status,
        };
        return this.expensesService.findAll(params);
    }
    getStatistics() {
        return this.expensesService.getStatistics();
    }
    getMonthlyTrend(months) {
        return this.expensesService.getMonthlyTrend(months);
    }
    getCategoryChart() {
        return this.expensesService.getCategorySummary();
    }
    getCategorySummary() {
        return this.expensesService.getCategorySummary();
    }
    findOne(id) {
        return this.expensesService.findOne(id);
    }
    update(id, updateExpenseDto) {
        return this.expensesService.update(id, updateExpenseDto);
    }
    remove(id) {
        return this.expensesService.remove(id);
    }
};
exports.ExpenseController = ExpenseController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guard_1.AccessTokenGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_expense_dto_1.CreateExpenseDto, Object]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('skip', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('take', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __param(6, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExpenseController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('charts/monthly'),
    __param(0, (0, common_1.Query)('months', new common_1.DefaultValuePipe(6), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ExpenseController.prototype, "getMonthlyTrend", null);
__decorate([
    (0, common_1.Get)('charts/category'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExpenseController.prototype, "getCategoryChart", null);
__decorate([
    (0, common_1.Get)('category-summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExpenseController.prototype, "getCategorySummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_expense_dto_1.UpdateExpenseDto]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "remove", null);
exports.ExpenseController = ExpenseController = __decorate([
    (0, common_1.Controller)('expenses'),
    __metadata("design:paramtypes", [expense_service_1.ExpenseService])
], ExpenseController);
//# sourceMappingURL=expense.controller.js.map