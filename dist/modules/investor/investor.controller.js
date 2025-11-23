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
exports.InvestorController = void 0;
const common_1 = require("@nestjs/common");
const investor_service_1 = require("./investor.service");
const dto_1 = require("./dto");
let InvestorController = class InvestorController {
    constructor(investorService) {
        this.investorService = investorService;
    }
    async createInvestor(createInvestorDto) {
        return this.investorService.createInvestor(createInvestorDto);
    }
    async getAllInvestors(page, limit, search) {
        return this.investorService.getAllInvestors(page, limit, search);
    }
    async getInvestorStatistics() {
        return this.investorService.getInvestorStatistics();
    }
    async getInvestorPerformanceReport() {
        return this.investorService.getInvestorPerformanceReport();
    }
    async getEquityDistribution() {
        return this.investorService.getEquityDistribution();
    }
    async getInvestorById(id) {
        return this.investorService.getInvestorById(id);
    }
    async getDueSummary(id) {
        return this.investorService.getDueSummary(id);
    }
    async payInvestor(id, body) {
        return this.investorService.payInvestor(id, body.amount, body.description, body.paymentMethod, body.reference);
    }
    async updateInvestor(id, updateInvestorDto) {
        return this.investorService.updateInvestor(id, updateInvestorDto);
    }
    async deleteInvestor(id) {
        return this.investorService.deleteInvestor(id);
    }
    async toggleInvestorStatus(id) {
        return this.investorService.toggleInvestorStatus(id);
    }
};
exports.InvestorController = InvestorController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateInvestorDto]),
    __metadata("design:returntype", Promise)
], InvestorController.prototype, "createInvestor", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], InvestorController.prototype, "getAllInvestors", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InvestorController.prototype, "getInvestorStatistics", null);
__decorate([
    (0, common_1.Get)('performance'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InvestorController.prototype, "getInvestorPerformanceReport", null);
__decorate([
    (0, common_1.Get)('equity-distribution'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InvestorController.prototype, "getEquityDistribution", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvestorController.prototype, "getInvestorById", null);
__decorate([
    (0, common_1.Get)(':id/due-summary'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvestorController.prototype, "getDueSummary", null);
__decorate([
    (0, common_1.Post)(':id/pay'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvestorController.prototype, "payInvestor", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateInvestorDto]),
    __metadata("design:returntype", Promise)
], InvestorController.prototype, "updateInvestor", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvestorController.prototype, "deleteInvestor", null);
__decorate([
    (0, common_1.Put)(':id/toggle-status'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvestorController.prototype, "toggleInvestorStatus", null);
exports.InvestorController = InvestorController = __decorate([
    (0, common_1.Controller)('investors'),
    __metadata("design:paramtypes", [investor_service_1.InvestorService])
], InvestorController);
//# sourceMappingURL=investor.controller.js.map