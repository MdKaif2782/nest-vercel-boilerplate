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
exports.PurchaseOrderQueryDto = exports.MarkAsReceivedDto = exports.ReceivedItemDto = exports.UpdatePurchaseOrderDto = exports.CreatePurchaseOrderDto = exports.PurchaseOrderInvestmentDto = exports.PurchaseOrderItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class PurchaseOrderItemDto {
}
exports.PurchaseOrderItemDto = PurchaseOrderItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PurchaseOrderItemDto.prototype, "productName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Product description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PurchaseOrderItemDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity', minimum: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PurchaseOrderItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit price', minimum: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PurchaseOrderItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tax percentage', minimum: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PurchaseOrderItemDto.prototype, "taxPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total price', minimum: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PurchaseOrderItemDto.prototype, "totalPrice", void 0);
class PurchaseOrderInvestmentDto {
}
exports.PurchaseOrderInvestmentDto = PurchaseOrderInvestmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Investor ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PurchaseOrderInvestmentDto.prototype, "investorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Investment amount', minimum: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PurchaseOrderInvestmentDto.prototype, "investmentAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Profit percentage', minimum: 0, maximum: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PurchaseOrderInvestmentDto.prototype, "profitPercentage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is full investment', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PurchaseOrderInvestmentDto.prototype, "isFullInvestment", void 0);
class CreatePurchaseOrderDto {
}
exports.CreatePurchaseOrderDto = CreatePurchaseOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vendor name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "vendorName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vendor country' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "vendorCountry", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vendor address' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "vendorAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vendor contact' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "vendorContact", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.PaymentType, description: 'Payment type' }),
    (0, class_validator_1.IsEnum)(client_1.PaymentType),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "paymentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total amount', minimum: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePurchaseOrderDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tax amount', minimum: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePurchaseOrderDto.prototype, "taxAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Due amount', minimum: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePurchaseOrderDto.prototype, "dueAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PurchaseOrderItemDto], description: 'Purchase order items' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PurchaseOrderItemDto),
    __metadata("design:type", Array)
], CreatePurchaseOrderDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PurchaseOrderInvestmentDto], description: 'Investments' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PurchaseOrderInvestmentDto),
    __metadata("design:type", Array)
], CreatePurchaseOrderDto.prototype, "investments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID who created the PO' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "createdBy", void 0);
class UpdatePurchaseOrderDto {
}
exports.UpdatePurchaseOrderDto = UpdatePurchaseOrderDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Vendor name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePurchaseOrderDto.prototype, "vendorName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Vendor country' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePurchaseOrderDto.prototype, "vendorCountry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Vendor address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePurchaseOrderDto.prototype, "vendorAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Vendor contact' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePurchaseOrderDto.prototype, "vendorContact", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.PaymentType, description: 'Payment type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.PaymentType),
    __metadata("design:type", String)
], UpdatePurchaseOrderDto.prototype, "paymentType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Total amount', minimum: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdatePurchaseOrderDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tax amount', minimum: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdatePurchaseOrderDto.prototype, "taxAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Due amount', minimum: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdatePurchaseOrderDto.prototype, "dueAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePurchaseOrderDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.POStatus, description: 'PO status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.POStatus),
    __metadata("design:type", String)
], UpdatePurchaseOrderDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [PurchaseOrderItemDto], description: 'Purchase order items' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PurchaseOrderItemDto),
    __metadata("design:type", Array)
], UpdatePurchaseOrderDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [PurchaseOrderInvestmentDto], description: 'Investments' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PurchaseOrderInvestmentDto),
    __metadata("design:type", Array)
], UpdatePurchaseOrderDto.prototype, "investments", void 0);
class ReceivedItemDto {
}
exports.ReceivedItemDto = ReceivedItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Purchase order item ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceivedItemDto.prototype, "purchaseOrderItemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Received quantity', minimum: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ReceivedItemDto.prototype, "receivedQuantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expected sale price', minimum: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ReceivedItemDto.prototype, "expectedSalePrice", void 0);
class MarkAsReceivedDto {
}
exports.MarkAsReceivedDto = MarkAsReceivedDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ReceivedItemDto], description: 'Received items' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReceivedItemDto),
    __metadata("design:type", Array)
], MarkAsReceivedDto.prototype, "receivedItems", void 0);
class PurchaseOrderQueryDto {
}
exports.PurchaseOrderQueryDto = PurchaseOrderQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number', minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PurchaseOrderQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Items per page', minimum: 1, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PurchaseOrderQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=index.js.map