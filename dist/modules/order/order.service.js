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
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let OrderService = class OrderService {
    constructor(database) {
        this.database = database;
    }
    async generateOrderNumber() {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `ORDER-${timestamp}-${random}`;
    }
    async createOrder(createOrderDto) {
        const { quotationId, ...orderData } = createOrderDto;
        const quotation = await this.database.quotation.findUnique({
            where: { id: quotationId },
            include: { items: true }
        });
        if (!quotation) {
            throw new common_1.NotFoundException(`Quotation with ID ${quotationId} not found`);
        }
        if (quotation.status !== 'ACCEPTED') {
            throw new common_1.BadRequestException('Only accepted quotations can be converted to orders');
        }
        const existingOrder = await this.database.buyerPurchaseOrder.findUnique({
            where: { quotationId }
        });
        if (existingOrder) {
            throw new common_1.BadRequestException('Order already exists for this quotation');
        }
        const order = await this.database.buyerPurchaseOrder.create({
            data: {
                ...orderData,
                poNumber: await this.generateOrderNumber(),
                poDate: orderData.poDate || new Date(),
                quotationId,
            },
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
        });
        return order;
    }
    async findAll(page = 1, limit = 10, status) {
        const skip = (page - 1) * limit;
        const whereClause = {};
        if (status) {
            whereClause.quotation = {
                status: status
            };
        }
        const [orders, total] = await Promise.all([
            this.database.buyerPurchaseOrder.findMany({
                where: whereClause,
                skip,
                take: limit,
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
                            items: {
                                include: {
                                    inventory: true
                                }
                            }
                        }
                    },
                    bills: {
                        include: {
                            items: true,
                            payments: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.database.buyerPurchaseOrder.count({ where: whereClause })
        ]);
        return {
            data: orders,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        };
    }
    async findOne(id) {
        const order = await this.database.buyerPurchaseOrder.findUnique({
            where: { id },
            include: {
                quotation: {
                    include: {
                        items: {
                            include: {
                                inventory: {
                                    include: {
                                        purchaseOrder: {
                                            include: {
                                                investments: {
                                                    include: {
                                                        investor: true
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                challans: {
                    include: {
                        items: {
                            include: {
                                inventory: true
                            }
                        }
                    }
                },
                bills: {
                    include: {
                        items: {
                            include: {
                                inventory: true
                            }
                        },
                        payments: true
                    }
                }
            }
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        return order;
    }
    async updateOrder(id, updateOrderDto) {
        const order = await this.database.buyerPurchaseOrder.findUnique({
            where: { id }
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        const existingBills = await this.database.bill.count({
            where: { buyerPOId: id }
        });
        const existingChallans = await this.database.challan.count({
            where: { buyerPurchaseOrderId: id }
        });
        if ((existingBills > 0 || existingChallans > 0) && updateOrderDto.poDate) {
            throw new common_1.BadRequestException('Cannot update PO date when bills or challans exist');
        }
        return await this.database.buyerPurchaseOrder.update({
            where: { id },
            data: updateOrderDto,
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
        });
    }
    async deleteOrder(id) {
        const order = await this.database.buyerPurchaseOrder.findUnique({
            where: { id },
            include: {
                bills: true,
                challans: true
            }
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        if (order.bills.length > 0) {
            throw new common_1.BadRequestException('Cannot delete order with associated bills');
        }
        if (order.challans.length > 0) {
            throw new common_1.BadRequestException('Cannot delete order with associated challans');
        }
        return await this.database.buyerPurchaseOrder.delete({
            where: { id }
        });
    }
    async getOrderSummary(id) {
        const order = await this.findOne(id);
        const totalOrderedQuantity = order.quotation.items.reduce((sum, item) => sum + item.quantity, 0);
        const totalDeliveredQuantity = order.challans.reduce((sum, challan) => {
            return sum + challan.items.reduce((challanSum, item) => challanSum + item.quantity, 0);
        }, 0);
        const totalBilledAmount = order.bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
        const totalPaidAmount = order.bills.reduce((sum, bill) => {
            return sum + bill.payments.reduce((paymentSum, payment) => paymentSum + payment.amount, 0);
        }, 0);
        const totalProfitDistributed = 0;
        const completionPercentage = totalOrderedQuantity > 0
            ? (totalDeliveredQuantity / totalOrderedQuantity) * 100
            : 0;
        return {
            orderId: order.id,
            orderNumber: order.poNumber,
            quotationNumber: order.quotation.quotationNumber,
            companyName: order.quotation.companyName,
            totalOrderedQuantity,
            totalDeliveredQuantity,
            totalBilledAmount,
            totalPaidAmount,
            totalProfitDistributed,
            completionPercentage: Math.round(completionPercentage * 100) / 100,
            billCount: order.bills.length,
            challanCount: order.challans.length,
            status: order.quotation.status,
            createdAt: order.createdAt,
            lastUpdated: new Date()
        };
    }
    async calculateInvestorProfits(id) {
        const order = await this.findOne(id);
        const inventoryItems = order.quotation.items.map(item => item.inventory);
        const purchaseOrderInvestments = new Map();
        for (const inventoryItem of inventoryItems) {
            const purchaseOrder = inventoryItem.purchaseOrder;
            if (purchaseOrder && purchaseOrder.investments) {
                if (!purchaseOrderInvestments.has(purchaseOrder.id)) {
                    purchaseOrderInvestments.set(purchaseOrder.id, {
                        purchaseOrder,
                        totalAmount: purchaseOrder.totalAmount,
                        investments: purchaseOrder.investments
                    });
                }
            }
        }
        const totalSales = order.bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
        const totalCost = inventoryItems.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0);
        const totalProfit = totalSales - totalCost;
        const investorProfits = new Map();
        let totalInvestmentPercentage = 0;
        for (const [, poData] of purchaseOrderInvestments) {
            for (const investment of poData.investments) {
                const investorId = investment.investorId;
                const profitPercentage = investment.profitPercentage;
                if (!investorProfits.has(investorId)) {
                    investorProfits.set(investorId, {
                        investor: investment.investor,
                        totalProfitPercentage: 0,
                        totalInvestmentAmount: 0,
                        calculatedProfit: 0,
                        purchaseOrders: []
                    });
                }
                const investorData = investorProfits.get(investorId);
                investorData.totalProfitPercentage += profitPercentage;
                investorData.totalInvestmentAmount += investment.investmentAmount;
                investorData.purchaseOrders.push({
                    poNumber: poData.purchaseOrder.poNumber,
                    profitPercentage: profitPercentage,
                    investmentAmount: investment.investmentAmount
                });
                totalInvestmentPercentage += profitPercentage;
            }
        }
        const results = [];
        for (const [, investorData] of investorProfits) {
            const normalizedPercentage = totalInvestmentPercentage > 100
                ? (investorData.totalProfitPercentage / totalInvestmentPercentage) * 100
                : investorData.totalProfitPercentage;
            const calculatedProfit = (normalizedPercentage / 100) * totalProfit;
            results.push({
                investorId: investorData.investor.id,
                investorName: investorData.investor.name,
                totalProfitPercentage: Math.round(investorData.totalProfitPercentage * 100) / 100,
                totalInvestmentAmount: investorData.totalInvestmentAmount,
                calculatedProfit: Math.round(calculatedProfit * 100) / 100,
                actualDistributedProfit: 0,
                purchaseOrders: investorData.purchaseOrders
            });
        }
        const actualDistributions = new Map();
        for (const result of results) {
            result.actualDistributedProfit = Math.round((actualDistributions.get(result.investorId) || 0) * 100) / 100;
        }
        return results.sort((a, b) => b.calculatedProfit - a.calculatedProfit);
    }
    async getOrderStatusTimeline(id) {
        const order = await this.findOne(id);
        const timeline = [];
        timeline.push({
            event: 'QUOTATION_CREATED',
            date: order.quotation.createdAt,
            description: `Quotation ${order.quotation.quotationNumber} created`,
            status: order.quotation.status
        });
        timeline.push({
            event: 'ORDER_CREATED',
            date: order.createdAt,
            description: `Order ${order.poNumber} created from quotation`,
            status: 'ORDERED'
        });
        for (const challan of order.challans) {
            timeline.push({
                event: 'CHALLAN_CREATED',
                date: challan.createdAt,
                description: `Challan ${challan.challanNumber} created`,
                status: challan.status
            });
            if (challan.dispatchDate) {
                timeline.push({
                    event: 'CHALLAN_DISPATCHED',
                    date: challan.dispatchDate,
                    description: `Challan ${challan.challanNumber} dispatched`,
                    status: 'DISPATCHED'
                });
            }
            if (challan.deliveryDate) {
                timeline.push({
                    event: 'CHALLAN_DELIVERED',
                    date: challan.deliveryDate,
                    description: `Challan ${challan.challanNumber} delivered`,
                    status: 'DELIVERED'
                });
            }
        }
        for (const bill of order.bills) {
            timeline.push({
                event: 'BILL_CREATED',
                date: bill.billDate,
                description: `Bill ${bill.billNumber} created`,
                status: bill.status
            });
            for (const payment of bill.payments) {
                timeline.push({
                    event: 'PAYMENT_RECEIVED',
                    date: payment.paymentDate,
                    description: `Payment of ৳${payment.amount} received for bill ${bill.billNumber}`,
                    status: 'PAID'
                });
            }
        }
        return timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    async getOrderProducts(id) {
        const order = await this.database.buyerPurchaseOrder.findUnique({
            where: { id },
            include: {
                quotation: {
                    include: {
                        items: {
                            include: {
                                inventory: {
                                    include: {
                                        purchaseOrder: true
                                    }
                                }
                            }
                        }
                    }
                },
                challans: {
                    include: {
                        items: {
                            include: {
                                inventory: true
                            }
                        }
                    }
                }
            }
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        const products = order.quotation.items.map(quotationItem => {
            const inventory = quotationItem.inventory;
            const deliveredQuantity = order.challans.reduce((sum, challan) => {
                const challanItem = challan.items.find(item => item.inventoryId === inventory.id);
                return sum + (challanItem?.quantity || 0);
            }, 0);
            const remainingQuantity = quotationItem.quantity - deliveredQuantity;
            return {
                productId: inventory.id,
                productCode: inventory.productCode,
                productName: inventory.productName,
                description: inventory.description,
                orderedQuantity: quotationItem.quantity,
                deliveredQuantity,
                remainingQuantity,
                unitPrice: quotationItem.unitPrice,
                totalPrice: quotationItem.totalPrice,
                purchasePrice: inventory.purchasePrice,
                expectedProfit: (quotationItem.unitPrice - inventory.purchasePrice) * quotationItem.quantity,
                status: remainingQuantity === 0 ? 'DELIVERED' : remainingQuantity === quotationItem.quantity ? 'PENDING' : 'PARTIAL'
            };
        });
        return products;
    }
    async getOrderStatistics() {
        const totalOrders = await this.database.buyerPurchaseOrder.count();
        const ordersByStatus = await this.database.quotation.groupBy({
            by: ['status'],
            _count: {
                id: true
            },
            where: {
                buyerPO: {
                    isNot: null
                }
            }
        });
        const recentOrders = await this.database.buyerPurchaseOrder.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                quotation: {
                    select: {
                        companyName: true,
                        totalAmount: true,
                        status: true
                    }
                },
                bills: {
                    select: {
                        totalAmount: true,
                        status: true
                    }
                }
            }
        });
        const totalBilledAmount = await this.database.bill.aggregate({
            _sum: {
                totalAmount: true
            },
            where: {
                buyerPO: {
                    isNot: null
                }
            }
        });
        const totalPaidAmount = await this.database.payment.aggregate({
            _sum: {
                amount: true
            },
            where: {
                bill: {
                    buyerPO: {
                        isNot: null
                    }
                }
            }
        });
        return {
            totalOrders,
            statusBreakdown: ordersByStatus,
            totalBilledAmount: totalBilledAmount._sum.totalAmount || 0,
            totalPaidAmount: totalPaidAmount._sum.amount || 0,
            pendingAmount: (totalBilledAmount._sum.totalAmount || 0) - (totalPaidAmount._sum.amount || 0),
            recentOrders: recentOrders.map(order => ({
                id: order.id,
                poNumber: order.poNumber,
                companyName: order.quotation.companyName,
                totalAmount: order.quotation.totalAmount,
                status: order.quotation.status,
                billCount: order.bills.length,
                totalBilled: order.bills.reduce((sum, bill) => sum + bill.totalAmount, 0)
            }))
        };
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], OrderService);
//# sourceMappingURL=order.service.js.map