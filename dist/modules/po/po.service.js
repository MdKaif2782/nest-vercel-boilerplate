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
exports.PurchaseOrderService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const database_service_1 = require("../database/database.service");
let PurchaseOrderService = class PurchaseOrderService {
    constructor(database) {
        this.database = database;
    }
    async generatePONumber() {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `PO-${timestamp}-${random}`;
    }
    async findOrCreateSelfInvestor() {
        const selfInvestor = await this.database.investor.findFirst({
            where: { name: 'Self' }
        });
        if (selfInvestor) {
            return selfInvestor.id;
        }
        const newSelfInvestor = await this.database.investor.create({
            data: {
                name: 'Self',
                email: `self-${Date.now()}@company.com`,
                isActive: true,
            }
        });
        return newSelfInvestor.id;
    }
    async validateAndProcessInvestments(investments, totalAmount) {
        const totalProfitPercentage = investments.reduce((sum, inv) => sum + inv.profitPercentage, 0);
        const totalInvestmentAmount = investments.reduce((sum, inv) => sum + inv.investmentAmount, 0);
        if (Math.abs(totalInvestmentAmount - totalAmount) > 0.01) {
            throw new common_1.BadRequestException('Total investment amount must match purchase order total amount');
        }
        if (Math.abs(totalProfitPercentage - 100) < 0.01) {
            return { processedInvestments: investments };
        }
        if (totalProfitPercentage > 100) {
            throw new common_1.BadRequestException('Total profit percentage cannot exceed 100%');
        }
        const remainingPercentage = 100 - totalProfitPercentage;
        const selfInvestmentAmount = totalAmount - totalInvestmentAmount;
        const selfInvestorId = await this.findOrCreateSelfInvestor();
        const selfInvestment = {
            investorId: selfInvestorId,
            investmentAmount: selfInvestmentAmount,
            profitPercentage: remainingPercentage,
            isFullInvestment: false
        };
        return {
            processedInvestments: [...investments, selfInvestment],
            selfInvestment
        };
    }
    async createPurchaseOrder(dto) {
        const { items, investments, ...poData } = dto;
        const { processedInvestments } = await this.validateAndProcessInvestments(investments, poData.totalAmount);
        return await this.database.$transaction(async (prisma) => {
            const purchaseOrder = await prisma.purchaseOrder.create({
                data: {
                    ...poData,
                    poNumber: await this.generatePONumber(),
                    status: client_1.POStatus.PENDING,
                    items: {
                        create: items.map(item => ({
                            ...item,
                            taxPercentage: item.taxPercentage || 0,
                        }))
                    }
                },
                include: { items: true }
            });
            for (const investment of processedInvestments) {
                await prisma.purchaseOrderInvestment.create({
                    data: {
                        ...investment,
                        purchaseOrderId: purchaseOrder.id,
                    }
                });
            }
            return await prisma.purchaseOrder.findUnique({
                where: { id: purchaseOrder.id },
                include: {
                    items: true,
                    investments: {
                        include: {
                            investor: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });
        });
    }
    async updatePurchaseOrder(id, dto) {
        const { items, investments, ...poData } = dto;
        const existingPO = await this.database.purchaseOrder.findUnique({
            where: { id },
            include: { items: true, investments: true }
        });
        if (!existingPO) {
            throw new common_1.NotFoundException(`Purchase order with ID ${id} not found`);
        }
        if (existingPO.status === client_1.POStatus.RECEIVED) {
            throw new common_1.BadRequestException('Cannot modify a received purchase order');
        }
        return await this.database.$transaction(async (prisma) => {
            const updatedPO = await prisma.purchaseOrder.update({
                where: { id },
                data: poData
            });
            if (items) {
                await prisma.purchaseOrderItem.deleteMany({
                    where: { purchaseOrderId: id }
                });
                await prisma.purchaseOrderItem.createMany({
                    data: items.map(item => ({
                        ...item,
                        purchaseOrderId: id,
                        taxPercentage: item.taxPercentage || 0,
                    }))
                });
            }
            if (investments) {
                const { processedInvestments } = await this.validateAndProcessInvestments(investments, poData.totalAmount || existingPO.totalAmount);
                await prisma.purchaseOrderInvestment.deleteMany({
                    where: { purchaseOrderId: id }
                });
                for (const investment of processedInvestments) {
                    await prisma.purchaseOrderInvestment.create({
                        data: {
                            ...investment,
                            purchaseOrderId: id,
                        }
                    });
                }
            }
            return await prisma.purchaseOrder.findUnique({
                where: { id },
                include: {
                    items: true,
                    investments: {
                        include: {
                            investor: true
                        }
                    }
                }
            });
        });
    }
    async markAsReceived(id, dto) {
        const { receivedItems } = dto;
        const purchaseOrder = await this.database.purchaseOrder.findUnique({
            where: { id },
            include: { items: true }
        });
        if (!purchaseOrder) {
            throw new common_1.NotFoundException(`Purchase order with ID ${id} not found`);
        }
        if (purchaseOrder.status === client_1.POStatus.RECEIVED) {
            throw new common_1.BadRequestException('Purchase order is already marked as received');
        }
        for (const receivedItem of receivedItems) {
            const poItem = purchaseOrder.items.find(item => item.id === receivedItem.purchaseOrderItemId);
            if (!poItem) {
                throw new common_1.BadRequestException(`Purchase order item with ID ${receivedItem.purchaseOrderItemId} not found`);
            }
        }
        return await this.database.$transaction(async (prisma) => {
            const updatedPO = await prisma.purchaseOrder.update({
                where: { id },
                data: {
                    status: client_1.POStatus.RECEIVED,
                    receivedAt: new Date(),
                }
            });
            for (const receivedItem of receivedItems) {
                const poItem = purchaseOrder.items.find(item => item.id === receivedItem.purchaseOrderItemId);
                const productCode = poItem.productName
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, '_')
                    .substring(0, 20) + `_${Date.now()}`;
                await prisma.inventory.create({
                    data: {
                        productCode,
                        productName: poItem.productName,
                        description: poItem.description,
                        quantity: receivedItem.receivedQuantity,
                        purchasePrice: poItem.unitPrice,
                        expectedSalePrice: receivedItem.expectedSalePrice,
                        purchaseOrderId: id,
                    }
                });
            }
            return {
                ...updatedPO,
                inventoryItems: receivedItems.map(ri => ({
                    productName: purchaseOrder.items.find(item => item.id === ri.purchaseOrderItemId)?.productName,
                    receivedQuantity: ri.receivedQuantity,
                    expectedSalePrice: ri.expectedSalePrice
                }))
            };
        });
    }
    async findOne(id) {
        const purchaseOrder = await this.database.purchaseOrder.findUnique({
            where: { id },
            include: {
                items: true,
                investments: {
                    include: {
                        investor: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                inventory: true
            }
        });
        if (!purchaseOrder) {
            throw new common_1.NotFoundException(`Purchase order with ID ${id} not found`);
        }
        return purchaseOrder;
    }
    async findAll(skip, take) {
        const [data, total] = await Promise.all([
            this.database.purchaseOrder.findMany({
                skip,
                take,
                include: {
                    items: true,
                    investments: {
                        include: {
                            investor: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.database.purchaseOrder.count()
        ]);
        return { data, total };
    }
    async delete(id) {
        const purchaseOrder = await this.database.purchaseOrder.findUnique({
            where: { id },
            include: { inventory: true }
        });
        if (!purchaseOrder) {
            throw new common_1.NotFoundException(`Purchase order with ID ${id} not found`);
        }
        if (purchaseOrder.inventory.length > 0) {
            throw new common_1.BadRequestException('Cannot delete purchase order with associated inventory items');
        }
        return await this.database.purchaseOrder.delete({
            where: { id }
        });
    }
};
exports.PurchaseOrderService = PurchaseOrderService;
exports.PurchaseOrderService = PurchaseOrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], PurchaseOrderService);
//# sourceMappingURL=po.service.js.map