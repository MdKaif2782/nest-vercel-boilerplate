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
exports.BillController = void 0;
const common_1 = require("@nestjs/common");
const bill_service_1 = require("./bill.service");
const dto_1 = require("./dto");
const auth_guard_1 = require("../auth/auth.guard");
let BillController = class BillController {
    constructor(billService) {
        this.billService = billService;
    }
    async create(req, createBillDto) {
        const request = req;
        return await this.billService.create(createBillDto, request.user.id);
    }
    async findAll(searchDto) {
        return await this.billService.findAll(searchDto);
    }
    getStats() {
        return this.billService.getStats();
    }
    getRecentBills(limit) {
        return this.billService.getRecentBills(limit);
    }
    getAvailableBuyerPOs() {
        return this.billService.getAvailableBuyerPOs();
    }
    getBillsByBuyerPO(buyerPOId) {
        return this.billService.getBillsByBuyerPO(buyerPOId);
    }
    findOne(id) {
        return this.billService.findOne(id);
    }
    addPayment(id, addPaymentDto) {
        return this.billService.addPayment(id, addPaymentDto);
    }
};
exports.BillController = BillController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guard_1.AccessTokenGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateBillDto]),
    __metadata("design:returntype", Promise)
], BillController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.BillSearchDto]),
    __metadata("design:returntype", Promise)
], BillController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BillController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('recent'),
    __param(0, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], BillController.prototype, "getRecentBills", null);
__decorate([
    (0, common_1.Get)('available-pos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BillController.prototype, "getAvailableBuyerPOs", null);
__decorate([
    (0, common_1.Get)('by-buyer-po/:buyerPOId'),
    __param(0, (0, common_1.Param)('buyerPOId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillController.prototype, "getBillsByBuyerPO", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/payments'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AddPaymentDto]),
    __metadata("design:returntype", void 0)
], BillController.prototype, "addPayment", null);
exports.BillController = BillController = __decorate([
    (0, common_1.Controller)('bills'),
    __metadata("design:paramtypes", [bill_service_1.BillService])
], BillController);
//# sourceMappingURL=bill.controller.js.map