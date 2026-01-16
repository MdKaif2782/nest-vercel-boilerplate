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
exports.RetailSaleController = void 0;
const common_1 = require("@nestjs/common");
const retail_sale_service_1 = require("./retail-sale.service");
const dto_1 = require("./dto");
let RetailSaleController = class RetailSaleController {
    constructor(retailSaleService) {
        this.retailSaleService = retailSaleService;
    }
    create(createRetailSaleDto) {
        return this.retailSaleService.createRetailSale(createRetailSaleDto);
    }
    findAll(page, limit, search, startDate, endDate, paymentMethod) {
        return this.retailSaleService.getAllRetailSales({
            page,
            limit,
            search,
            startDate,
            endDate,
            paymentMethod: paymentMethod,
        });
    }
    getAnalytics(startDate, endDate) {
        return this.retailSaleService.getRetailAnalytics(startDate, endDate);
    }
    findOne(id) {
        return this.retailSaleService.getRetailSaleById(id);
    }
    remove(id) {
        return this.retailSaleService.deleteRetailSale(id);
    }
};
exports.RetailSaleController = RetailSaleController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateRetailSaleDto]),
    __metadata("design:returntype", void 0)
], RetailSaleController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __param(5, (0, common_1.Query)('paymentMethod')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String]),
    __metadata("design:returntype", void 0)
], RetailSaleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RetailSaleController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RetailSaleController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RetailSaleController.prototype, "remove", null);
exports.RetailSaleController = RetailSaleController = __decorate([
    (0, common_1.Controller)('retail-sales'),
    __metadata("design:paramtypes", [retail_sale_service_1.RetailSaleService])
], RetailSaleController);
//# sourceMappingURL=retail-sale.controller.js.map