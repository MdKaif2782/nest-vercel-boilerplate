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
    async getSystemUserId() {
        const admin = await this.database.user.findFirst({
            where: { role: 'ADMIN' },
            select: { id: true },
        });
        if (!admin) {
            const anyUser = await this.database.user.findFirst({ select: { id: true } });
            return anyUser?.id || 'system';
        }
        return admin.id;
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
        if (Math.abs(totalProfitPercentage - 100) < 0.01 && Math.abs(totalInvestmentAmount - totalAmount) < 0.01) {
            return { processedInvestments: investments };
        }
        if (totalProfitPercentage > 100) {
            throw new common_1.BadRequestException('Total profit percentage cannot exceed 100%');
        }
        if (totalInvestmentAmount > totalAmount) {
            throw new common_1.BadRequestException('Total investment amount cannot exceed purchase order total amount');
        }
        const remainingPercentage = 100 - totalProfitPercentage;
        const remainingAmount = totalAmount - totalInvestmentAmount;
        const selfInvestorId = await this.findOrCreateSelfInvestor();
        const selfInvestment = {
            investorId: selfInvestorId,
            investmentAmount: remainingAmount,
            profitPercentage: remainingPercentage,
            isFullInvestment: false
        };
        return {
            processedInvestments: [...investments, selfInvestment],
            selfInvestment
        };
    }
    async createPurchaseOrder(dto, createdBy) {
        const { items, investments, ...poData } = dto;
        const { processedInvestments } = await this.validateAndProcessInvestments(investments, poData.totalAmount);
        const purchaseOrder = await this.database.purchaseOrder.create({
            data: {
                createdBy: createdBy,
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
            await this.database.purchaseOrderInvestment.create({
                data: {
                    ...investment,
                    purchaseOrderId: purchaseOrder.id,
                }
            });
        }
        return await this.database.purchaseOrder.findUnique({
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
        const updatedPO = await this.database.purchaseOrder.update({
            where: { id },
            data: poData
        });
        if (items) {
            await this.database.purchaseOrderItem.deleteMany({
                where: { purchaseOrderId: id }
            });
            await this.database.purchaseOrderItem.createMany({
                data: items.map(item => ({
                    ...item,
                    purchaseOrderId: id,
                    taxPercentage: item.taxPercentage || 0,
                }))
            });
        }
        if (investments) {
            const { processedInvestments } = await this.validateAndProcessInvestments(investments, poData.totalAmount || existingPO.totalAmount);
            await this.database.purchaseOrderInvestment.deleteMany({
                where: { purchaseOrderId: id }
            });
            for (const investment of processedInvestments) {
                await this.database.purchaseOrderInvestment.create({
                    data: {
                        ...investment,
                        purchaseOrderId: id,
                    }
                });
            }
        }
        return await this.database.purchaseOrder.findUnique({
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
        const updatedPO = await this.database.purchaseOrder.update({
            where: { id },
            data: {
                status: client_1.POStatus.RECEIVED,
                receivedAt: new Date(),
            }
        });
        const createdInventoryItems = [];
        for (const receivedItem of receivedItems) {
            const poItem = purchaseOrder.items.find(item => item.id === receivedItem.purchaseOrderItemId);
            const productCode = poItem.productName
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '_')
                .substring(0, 20) + `_${Date.now()}`;
            const inventoryItem = await this.database.inventory.create({
                data: {
                    productCode,
                    productName: poItem.productName,
                    description: poItem.description,
                    quantity: receivedItem.receivedQuantity,
                    imageUrl: receivedItem.imageUrl,
                    purchasePrice: poItem.unitPrice,
                    expectedSalePrice: receivedItem.expectedSalePrice,
                    purchaseOrderId: id,
                }
            });
            createdInventoryItems.push(inventoryItem);
        }
        return {
            ...updatedPO,
            inventoryItems: createdInventoryItems
        };
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
    async addPayment(purchaseOrderId, createPaymentDto) {
        const purchaseOrder = await this.database.purchaseOrder.findUnique({
            where: { id: purchaseOrderId },
            include: { payments: true }
        });
        if (!purchaseOrder) {
            throw new common_1.NotFoundException(`Purchase order with ID ${purchaseOrderId} not found`);
        }
        if (purchaseOrder.status === client_1.POStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot add payment to cancelled purchase order');
        }
        const { amount, paymentMethod, reference, notes, paymentDate } = createPaymentDto;
        if (amount > purchaseOrder.dueAmount) {
            throw new common_1.BadRequestException(`Payment amount (${amount}) exceeds due amount (${purchaseOrder.dueAmount})`);
        }
        if (amount <= 0) {
            throw new common_1.BadRequestException('Payment amount must be greater than 0');
        }
        const payment = await this.database.purchaseOrderPayment.create({
            data: {
                amount,
                paymentMethod,
                reference,
                notes,
                paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
                purchaseOrderId,
            },
        });
        const updatedPO = await this.database.purchaseOrder.update({
            where: { id: purchaseOrderId },
            data: {
                dueAmount: {
                    decrement: amount,
                },
            },
            include: {
                payments: {
                    orderBy: { paymentDate: 'desc' }
                },
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
        try {
            const systemUserId = purchaseOrder.createdBy || await this.getSystemUserId();
            await this.database.expense.create({
                data: {
                    title: `PO Payment - ${purchaseOrder.poNumber}`,
                    description: `Payment for purchase order ${purchaseOrder.poNumber} (${purchaseOrder.vendorName})`,
                    amount,
                    category: client_1.ExpenseCategory.PURCHASE_ORDER_PAYMENT,
                    expenseDate: paymentDate ? new Date(paymentDate) : new Date(),
                    paymentMethod: paymentMethod,
                    status: client_1.ExpenseStatus.APPROVED,
                    isAutoGenerated: true,
                    purchaseOrderPaymentId: payment.id,
                    recordedBy: systemUserId,
                    notes: notes || undefined,
                },
            });
        }
        catch (_) {
        }
        return { payment, updatedPO };
    }
    async getPaymentSummary(purchaseOrderId) {
        const purchaseOrder = await this.database.purchaseOrder.findUnique({
            where: { id: purchaseOrderId },
            include: {
                payments: {
                    orderBy: { paymentDate: 'asc' }
                }
            }
        });
        if (!purchaseOrder) {
            throw new common_1.NotFoundException(`Purchase order with ID ${purchaseOrderId} not found`);
        }
        const totalPaid = purchaseOrder.payments.reduce((sum, payment) => sum + payment.amount, 0);
        const remainingDue = purchaseOrder.totalAmount - totalPaid;
        return {
            totalAmount: purchaseOrder.totalAmount,
            totalPaid,
            remainingDue,
            paymentCount: purchaseOrder.payments.length,
            payments: purchaseOrder.payments.map(payment => ({
                id: payment.id,
                amount: payment.amount,
                paymentDate: payment.paymentDate,
                paymentMethod: payment.paymentMethod,
                reference: payment.reference,
                notes: payment.notes,
                purchaseOrderId: payment.purchaseOrderId,
                createdAt: payment.paymentDate
            }))
        };
    }
    async getPayments(purchaseOrderId) {
        const payments = await this.database.purchaseOrderPayment.findMany({
            where: { purchaseOrderId },
            orderBy: { paymentDate: 'desc' },
            include: {
                purchaseOrder: {
                    select: {
                        poNumber: true,
                        vendorName: true,
                        totalAmount: true,
                    }
                }
            }
        });
        return payments;
    }
    async updatePayment(paymentId, updateData) {
        const payment = await this.database.purchaseOrderPayment.findUnique({
            where: { id: paymentId },
            include: { purchaseOrder: true }
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${paymentId} not found`);
        }
        if (updateData.amount !== undefined) {
            const amountDifference = updateData.amount - payment.amount;
            if (amountDifference + payment.purchaseOrder.dueAmount < 0) {
                throw new common_1.BadRequestException('Updated payment amount would make due amount negative');
            }
            const updatedPayment = await this.database.purchaseOrderPayment.update({
                where: { id: paymentId },
                data: updateData,
            });
            await this.database.purchaseOrder.update({
                where: { id: payment.purchaseOrderId },
                data: {
                    dueAmount: {
                        increment: -amountDifference,
                    }
                }
            });
            return updatedPayment;
        }
        return await this.database.purchaseOrderPayment.update({
            where: { id: paymentId },
            data: updateData,
        });
    }
    async deletePayment(paymentId) {
        const payment = await this.database.purchaseOrderPayment.findUnique({
            where: { id: paymentId },
            include: { purchaseOrder: true }
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${paymentId} not found`);
        }
        await this.database.purchaseOrderPayment.delete({
            where: { id: paymentId },
        });
        await this.database.purchaseOrder.update({
            where: { id: payment.purchaseOrderId },
            data: {
                dueAmount: {
                    increment: payment.amount,
                }
            }
        });
        return { message: 'Payment deleted successfully', revertedAmount: payment.amount };
    }
    async getDuePurchaseOrders(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [purchaseOrders, total] = await Promise.all([
            this.database.purchaseOrder.findMany({
                where: {
                    dueAmount: { gt: 0 },
                    status: { not: client_1.POStatus.CANCELLED }
                },
                include: {
                    payments: {
                        orderBy: { paymentDate: 'desc' }
                    },
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    },
                    _count: {
                        select: {
                            payments: true
                        }
                    }
                },
                orderBy: { dueAmount: 'desc' },
                skip,
                take: limit,
            }),
            this.database.purchaseOrder.count({
                where: {
                    dueAmount: { gt: 0 },
                    status: { not: client_1.POStatus.CANCELLED }
                }
            })
        ]);
        return {
            data: purchaseOrders,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        };
    }
};
exports.PurchaseOrderService = PurchaseOrderService;
exports.PurchaseOrderService = PurchaseOrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], PurchaseOrderService);
//# sourceMappingURL=po.service.js.map