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
exports.PurchaseOrderController = void 0;
const common_1 = require("@nestjs/common");
const po_service_1 = require("./po.service");
const dto_1 = require("./dto");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
let PurchaseOrderController = class PurchaseOrderController {
    constructor(purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }
    async create(req, createPurchaseOrderDto) {
        const request = req;
        const id = request.user.id;
        console.log(id);
        const result = await this.purchaseOrderService.createPurchaseOrder(createPurchaseOrderDto, id);
        return {
            statusCode: common_1.HttpStatus.CREATED,
            message: 'Purchase order created successfully',
            data: result,
        };
    }
    async findAll(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const result = await this.purchaseOrderService.findAll(skip, limit);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Purchase orders retrieved successfully',
            data: result.data,
            meta: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(result.total / limit),
            },
        };
    }
    async findOne(id) {
        const result = await this.purchaseOrderService.findOne(id);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Purchase order retrieved successfully',
            data: result,
        };
    }
    async update(id, updatePurchaseOrderDto) {
        const result = await this.purchaseOrderService.updatePurchaseOrder(id, updatePurchaseOrderDto);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Purchase order updated successfully',
            data: result,
        };
    }
    async markAsReceived(id, markAsReceivedDto) {
        console.log(id);
        const result = await this.purchaseOrderService.markAsReceived(id, markAsReceivedDto);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Purchase order marked as received and inventory updated',
            data: result,
        };
    }
    async remove(id) {
        await this.purchaseOrderService.delete(id);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Purchase order deleted successfully',
        };
    }
    async updateStatus(id, status) {
        const validStatuses = ['PENDING', 'ORDERED', 'SHIPPED', 'RECEIVED', 'CANCELLED'];
        if (!validStatuses.includes(status.toUpperCase())) {
            return {
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: 'Invalid status',
            };
        }
        const result = await this.purchaseOrderService.updatePurchaseOrder(id, {
            status: status,
        });
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Purchase order status updated successfully',
            data: result,
        };
    }
    async findByStatus(status, query) {
        const validStatuses = ['PENDING', 'ORDERED', 'SHIPPED', 'RECEIVED', 'CANCELLED'];
        if (!validStatuses.includes(status.toUpperCase())) {
            return {
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: 'Invalid status',
            };
        }
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const allPOs = await this.purchaseOrderService.findAll(skip, limit);
        const filteredData = allPOs.data.filter(po => po.status === status.toUpperCase());
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Purchase orders retrieved successfully',
            data: filteredData,
            meta: {
                page,
                limit,
                total: filteredData.length,
                totalPages: Math.ceil(filteredData.length / limit),
            },
        };
    }
    async addPayment(id, createPaymentDto) {
        const result = await this.purchaseOrderService.addPayment(id, createPaymentDto);
        return {
            statusCode: common_1.HttpStatus.CREATED,
            message: 'Payment added successfully',
            data: {
                payment: result.payment,
                purchaseOrder: result.updatedPO,
            },
        };
    }
    async getPaymentSummary(id) {
        const paymentSummary = await this.purchaseOrderService.getPaymentSummary(id);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Payment summary retrieved successfully',
            data: paymentSummary,
        };
    }
    async getPayments(id) {
        const payments = await this.purchaseOrderService.getPayments(id);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Payments retrieved successfully',
            data: payments,
        };
    }
    async updatePayment(paymentId, updateData) {
        const payment = await this.purchaseOrderService.updatePayment(paymentId, updateData);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Payment updated successfully',
            data: payment,
        };
    }
    async deletePayment(paymentId) {
        const result = await this.purchaseOrderService.deletePayment(paymentId);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: result.message,
            data: {
                revertedAmount: result.revertedAmount,
            },
        };
    }
    async getDuePurchaseOrders(page, limit) {
        const result = await this.purchaseOrderService.getDuePurchaseOrders(page || 1, limit || 10);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Due purchase orders retrieved successfully',
            data: result.data,
            meta: result.meta,
        };
    }
};
exports.PurchaseOrderController = PurchaseOrderController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new purchase order' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Purchase order created successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid investment percentage or amount',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseGuards)(auth_guard_1.AccessTokenGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreatePurchaseOrderDto]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all purchase orders with pagination' }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (starts from 1)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items per page',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Purchase orders retrieved successfully',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.PurchaseOrderQueryDto]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a purchase order by ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Purchase order retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Purchase order not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a purchase order' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Purchase order updated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Purchase order not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Cannot modify received purchase order',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdatePurchaseOrderDto]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/receive'),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark purchase order as received and update inventory',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Purchase order marked as received and inventory updated',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Purchase order not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Purchase order is already received or invalid items',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.MarkAsReceivedDto]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "markAsReceived", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a purchase order' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Purchase order deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Purchase order not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Cannot delete purchase order with associated inventory',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/status/:status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update purchase order status' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Purchase order status updated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Purchase order not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)('status/:status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get purchase orders by status' }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (starts from 1)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items per page',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Purchase orders retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('status')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.PurchaseOrderQueryDto]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "findByStatus", null);
__decorate([
    (0, common_1.Post)(':id/payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Add payment to purchase order' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Payment added successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Purchase order not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Payment amount exceeds due amount',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreatePurchaseOrderPaymentDto]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "addPayment", null);
__decorate([
    (0, common_1.Get)(':id/payments/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment summary for purchase order' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Payment summary retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Purchase order not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "getPaymentSummary", null);
__decorate([
    (0, common_1.Get)(':id/payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all payments for purchase order' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Payments retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Purchase order not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Patch)('payments/:paymentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a payment' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Payment updated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Payment not found',
    }),
    __param(0, (0, common_1.Param)('paymentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "updatePayment", null);
__decorate([
    (0, common_1.Delete)('payments/:paymentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a payment' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Payment deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Payment not found',
    }),
    __param(0, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "deletePayment", null);
__decorate([
    (0, common_1.Get)('due/list'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all purchase orders with due payments' }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (starts from 1)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items per page',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Due purchase orders retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "getDuePurchaseOrders", null);
exports.PurchaseOrderController = PurchaseOrderController = __decorate([
    (0, swagger_1.ApiTags)('purchase-orders'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('purchase-orders'),
    __metadata("design:paramtypes", [po_service_1.PurchaseOrderService])
], PurchaseOrderController);
//# sourceMappingURL=po.controller.js.map