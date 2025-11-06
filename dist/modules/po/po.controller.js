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
        const result = await this.purchaseOrderService.createPurchaseOrder(createPurchaseOrderDto);
        const request = req;
        const id = request.user.id;
        console.log(id);
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
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
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
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
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
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
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
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
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
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
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
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
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
exports.PurchaseOrderController = PurchaseOrderController = __decorate([
    (0, swagger_1.ApiTags)('purchase-orders'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('purchase-orders'),
    __metadata("design:paramtypes", [po_service_1.PurchaseOrderService])
], PurchaseOrderController);
//# sourceMappingURL=po.controller.js.map