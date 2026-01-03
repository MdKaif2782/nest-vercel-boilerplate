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
exports.QuotationController = void 0;
const common_1 = require("@nestjs/common");
const quotation_service_1 = require("./quotation.service");
const create_quotation_dto_1 = require("./dto/create-quotation.dto");
const update_quotation_dto_1 = require("./dto/update-quotation.dto");
let QuotationController = class QuotationController {
    constructor(quotationService) {
        this.quotationService = quotationService;
    }
    create(createQuotationDto) {
        return this.quotationService.create(createQuotationDto);
    }
    async getPdf(id, res) {
        try {
            const pdfBuffer = await this.quotationService.generatePdf(id);
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="quotation-${id}.pdf"`,
                'Content-Length': pdfBuffer.length,
            });
            res.status(common_1.HttpStatus.OK).send(pdfBuffer);
        }
        catch (error) {
            res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Failed to generate PDF',
                error: error.message,
            });
        }
    }
    findAll(searchDto) {
        return this.quotationService.findAll(searchDto);
    }
    getExpiredQuotations() {
        return this.quotationService.getExpiredQuotations();
    }
    findOne(id) {
        return this.quotationService.findOne(id);
    }
    update(id, updateQuotationDto) {
        return this.quotationService.update(id, updateQuotationDto);
    }
    acceptQuotation(id, acceptQuotationDto) {
        return this.quotationService.acceptQuotation(id, acceptQuotationDto);
    }
    updateStatus(id, status) {
        return this.quotationService.updateStatus(id, status);
    }
    remove(id) {
        return this.quotationService.remove(id);
    }
};
exports.QuotationController = QuotationController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_quotation_dto_1.CreateQuotationDto]),
    __metadata("design:returntype", void 0)
], QuotationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuotationController.prototype, "getPdf", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_quotation_dto_1.QuotationSearchDto]),
    __metadata("design:returntype", void 0)
], QuotationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('expired'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QuotationController.prototype, "getExpiredQuotations", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuotationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_quotation_dto_1.UpdateQuotationDto]),
    __metadata("design:returntype", void 0)
], QuotationController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/accept'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_quotation_dto_1.AcceptQuotationDto]),
    __metadata("design:returntype", void 0)
], QuotationController.prototype, "acceptQuotation", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], QuotationController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuotationController.prototype, "remove", null);
exports.QuotationController = QuotationController = __decorate([
    (0, common_1.Controller)('quotations'),
    __metadata("design:paramtypes", [quotation_service_1.QuotationService])
], QuotationController);
//# sourceMappingURL=quotation.controller.js.map