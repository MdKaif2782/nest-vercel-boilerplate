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
exports.ChallanService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let ChallanService = class ChallanService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    calculateTotalQuantity(quotation) {
        return quotation?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    }
    async getPendingBPOs() {
        const bpos = await this.prisma.buyerPurchaseOrder.findMany({
            include: {
                quotation: {
                    include: {
                        items: {
                            include: {
                                inventory: true
                            }
                        }
                    }
                },
                challans: {
                    include: {
                        items: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return bpos.map(bpo => {
            const totalQuantity = this.calculateTotalQuantity(bpo.quotation);
            const dispatchedQuantity = bpo.dispatchedQuantity;
            return {
                id: bpo.id,
                poNumber: bpo.poNumber,
                companyName: bpo.quotation.companyName,
                totalQuantity,
                dispatchedQuantity,
                remainingQuantity: totalQuantity - dispatchedQuantity,
                hasChallan: bpo.challans.length > 0,
                challanStatus: bpo.challans[0]?.status,
                items: bpo.quotation.items.map(item => ({
                    inventoryId: item.inventoryId,
                    productName: item.inventory.productName,
                    productCode: item.inventory.productCode,
                    orderedQuantity: item.quantity,
                    availableQuantity: item.inventory.quantity,
                    unitPrice: item.unitPrice
                }))
            };
        });
    }
    async createChallan(dto) {
        const bpo = await this.prisma.buyerPurchaseOrder.findUnique({
            where: { id: dto.buyerPurchaseOrderId },
            include: {
                quotation: {
                    include: {
                        items: {
                            include: {
                                inventory: true
                            }
                        }
                    }
                },
                challans: {
                    include: {
                        items: true
                    }
                }
            }
        });
        if (!bpo) {
            throw new common_1.NotFoundException('Buyer Purchase Order not found');
        }
        const totalOrdered = this.calculateTotalQuantity(bpo.quotation);
        const alreadyDispatched = bpo.dispatchedQuantity;
        const requestedDispatch = dto.items.reduce((sum, item) => sum + item.quantity, 0);
        if (alreadyDispatched + requestedDispatch > totalOrdered) {
            throw new common_1.BadRequestException(`Cannot dispatch ${requestedDispatch} items. Already dispatched ${alreadyDispatched} of ${totalOrdered}`);
        }
        const quotationItemMap = new Map(bpo.quotation.items.map(item => [item.inventoryId, item]));
        for (const item of dto.items) {
            const quotationItem = quotationItemMap.get(item.inventoryId);
            if (!quotationItem) {
                throw new common_1.BadRequestException(`Item ${item.inventoryId} not found in purchase order`);
            }
            const alreadyDispatchedForItem = bpo.challans.reduce((sum, challan) => {
                const challanItem = challan.items.find(ci => ci.inventoryId === item.inventoryId);
                return sum + (challanItem?.quantity || 0);
            }, 0);
            if (alreadyDispatchedForItem + item.quantity > quotationItem.quantity) {
                throw new common_1.BadRequestException(`Cannot dispatch ${item.quantity} of ${quotationItem.inventory.productName}. ` +
                    `Ordered: ${quotationItem.quantity}, Already dispatched: ${alreadyDispatchedForItem}`);
            }
            const inventory = quotationItem.inventory;
            if (inventory.quantity < item.quantity) {
                throw new common_1.BadRequestException(`Insufficient inventory for ${inventory.productName}. Available: ${inventory.quantity}, Requested: ${item.quantity}`);
            }
        }
        return await this.prisma.$transaction(async (prisma) => {
            for (const item of dto.items) {
                await prisma.inventory.update({
                    where: { id: item.inventoryId },
                    data: {
                        quantity: {
                            decrement: item.quantity
                        }
                    }
                });
            }
            await prisma.buyerPurchaseOrder.update({
                where: { id: bpo.id },
                data: {
                    dispatchedQuantity: {
                        increment: requestedDispatch
                    }
                }
            });
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const challanCount = await prisma.challan.count({
                where: {
                    createdAt: {
                        gte: new Date(`${year}-${month}-01`),
                        lt: new Date(`${year}-${month}-${day} 23:59:59`)
                    }
                }
            });
            const challanNumber = `CH${year}${month}${day}${String(challanCount + 1).padStart(3, '0')}`;
            const challan = await prisma.challan.create({
                data: {
                    challanNumber,
                    buyerPurchaseOrderId: bpo.id,
                    dispatchDate: dto.dispatchDate || new Date(),
                    deliveryDate: dto.deliveryDate,
                    status: dto.status || 'DRAFT',
                    items: {
                        create: dto.items.map(item => ({
                            inventoryId: item.inventoryId,
                            quantity: item.quantity
                        }))
                    }
                },
                include: {
                    items: {
                        include: {
                            inventory: true
                        }
                    },
                    buyerPurchaseOrder: {
                        include: {
                            quotation: true
                        }
                    }
                }
            });
            return challan;
        });
    }
    async markAsDispatched(dto) {
        const bpo = await this.prisma.buyerPurchaseOrder.findUnique({
            where: { id: dto.buyerPurchaseOrderId },
            include: {
                quotation: {
                    include: {
                        items: {
                            include: {
                                inventory: true
                            }
                        }
                    }
                },
                challans: {
                    include: {
                        items: true
                    }
                }
            }
        });
        if (!bpo) {
            throw new common_1.NotFoundException('Buyer Purchase Order not found');
        }
        const totalOrdered = this.calculateTotalQuantity(bpo.quotation);
        if (bpo.dispatchedQuantity >= totalOrdered) {
            throw new common_1.BadRequestException('Purchase order is already fully dispatched');
        }
        const remainingItems = bpo.quotation.items.map(item => {
            const alreadyDispatchedForItem = bpo.challans.reduce((sum, challan) => {
                const challanItem = challan.items.find(ci => ci.inventoryId === item.inventoryId);
                return sum + (challanItem?.quantity || 0);
            }, 0);
            const remainingToDispatch = item.quantity - alreadyDispatchedForItem;
            return {
                inventoryId: item.inventoryId,
                quantity: remainingToDispatch,
                inventory: item.inventory
            };
        });
        for (const item of remainingItems) {
            if (item.quantity > 0 && item.inventory.quantity < item.quantity) {
                throw new common_1.BadRequestException(`Insufficient inventory for ${item.inventory.productName}. ` +
                    `Available: ${item.inventory.quantity}, Required: ${item.quantity}`);
            }
        }
        const challanItems = remainingItems
            .filter(item => item.quantity > 0)
            .map(item => ({
            inventoryId: item.inventoryId,
            quantity: item.quantity
        }));
        if (challanItems.length === 0) {
            throw new common_1.BadRequestException('No items remaining to dispatch');
        }
        return await this.createChallan({
            buyerPurchaseOrderId: bpo.id,
            items: challanItems,
            dispatchDate: new Date(),
            status: dto.status || 'DISPATCHED'
        });
    }
    async updateChallanStatus(challanId, dto) {
        const challan = await this.prisma.challan.findUnique({
            where: { id: challanId },
            include: {
                items: true,
                buyerPurchaseOrder: true
            }
        });
        if (!challan) {
            throw new common_1.NotFoundException('Challan not found');
        }
        this.validateStatusTransition(challan.status, dto.status);
        if (dto.status === 'RETURNED' && challan.status !== 'RETURNED') {
            await this.prisma.$transaction(async (prisma) => {
                for (const item of challan.items) {
                    await prisma.inventory.update({
                        where: { id: item.inventoryId },
                        data: {
                            quantity: {
                                increment: item.quantity
                            }
                        }
                    });
                }
                const totalReturned = challan.items.reduce((sum, item) => sum + item.quantity, 0);
                await prisma.buyerPurchaseOrder.update({
                    where: { id: challan.buyerPurchaseOrderId },
                    data: {
                        dispatchedQuantity: {
                            decrement: totalReturned
                        }
                    }
                });
            });
        }
        let updateData = {
            status: dto.status
        };
        if (dto.status === 'DELIVERED') {
            updateData.deliveryDate = new Date();
        }
        else if (dto.status === 'DISPATCHED' && !challan.dispatchDate) {
            updateData.dispatchDate = new Date();
        }
        return await this.prisma.challan.update({
            where: { id: challanId },
            data: updateData,
            include: {
                items: {
                    include: {
                        inventory: true
                    }
                },
                buyerPurchaseOrder: {
                    include: {
                        quotation: true
                    }
                }
            }
        });
    }
    validateStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            'DRAFT': ['DISPATCHED', 'CANCELLED'],
            'DISPATCHED': ['DELIVERED', 'RETURNED', 'REJECTED'],
            'DELIVERED': ['RETURNED'],
            'RETURNED': [],
            'REJECTED': []
        };
        if (!validTransitions[currentStatus]?.includes(newStatus)) {
            throw new common_1.BadRequestException(`Cannot transition from ${currentStatus} to ${newStatus}`);
        }
    }
    async getDispatchSummary() {
        const bpos = await this.prisma.buyerPurchaseOrder.findMany({
            include: {
                quotation: {
                    include: {
                        items: true
                    }
                },
                challans: {
                    include: {
                        items: true
                    }
                }
            }
        });
        const summary = {
            totalBPOs: bpos.length,
            fullyDispatched: 0,
            partiallyDispatched: 0,
            notDispatched: 0,
            totalItemsOrdered: 0,
            totalItemsDispatched: 0,
            totalValueOrdered: 0,
            totalValueDispatched: 0,
            bpoDetails: []
        };
        for (const bpo of bpos) {
            const totalOrdered = this.calculateTotalQuantity(bpo.quotation);
            const dispatched = bpo.dispatchedQuantity;
            const remaining = totalOrdered - dispatched;
            const hasChallan = bpo.challans.length > 0;
            const orderedValue = bpo.quotation.totalAmount || 0;
            const dispatchedValue = orderedValue * (dispatched / totalOrdered) || 0;
            if (dispatched === 0) {
                summary.notDispatched++;
            }
            else if (dispatched < totalOrdered) {
                summary.partiallyDispatched++;
            }
            else {
                summary.fullyDispatched++;
            }
            summary.totalItemsOrdered += totalOrdered;
            summary.totalItemsDispatched += dispatched;
            summary.totalValueOrdered += orderedValue;
            summary.totalValueDispatched += dispatchedValue;
            summary.bpoDetails.push({
                id: bpo.id,
                poNumber: bpo.poNumber,
                companyName: bpo.quotation.companyName,
                totalQuantity: totalOrdered,
                dispatchedQuantity: dispatched,
                remainingQuantity: remaining,
                orderedValue,
                dispatchedValue,
                hasChallan,
                challanStatus: bpo.challans[0]?.status,
                createdAt: bpo.createdAt
            });
        }
        return summary;
    }
    async getAllChallans(status) {
        const where = {};
        if (status && status !== 'ALL') {
            where.status = status;
        }
        return await this.prisma.challan.findMany({
            where,
            include: {
                items: {
                    include: {
                        inventory: true
                    }
                },
                buyerPurchaseOrder: {
                    include: {
                        quotation: {
                            include: {
                                items: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async getChallanById(id) {
        const challan = await this.prisma.challan.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        inventory: true
                    }
                },
                buyerPurchaseOrder: {
                    include: {
                        quotation: {
                            include: {
                                items: {
                                    include: {
                                        inventory: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!challan) {
            throw new common_1.NotFoundException('Challan not found');
        }
        return challan;
    }
    async getChallansByBPOId(bpoId) {
        const bpo = await this.prisma.buyerPurchaseOrder.findUnique({
            where: { id: bpoId },
            include: {
                challans: {
                    include: {
                        items: {
                            include: {
                                inventory: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });
        if (!bpo) {
            throw new common_1.NotFoundException('Buyer Purchase Order not found');
        }
        return bpo.challans;
    }
};
exports.ChallanService = ChallanService;
exports.ChallanService = ChallanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ChallanService);
//# sourceMappingURL=challan.service.js.map