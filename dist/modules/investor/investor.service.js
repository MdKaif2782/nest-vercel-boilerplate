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
exports.InvestorService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let InvestorService = class InvestorService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createInvestor(createInvestorDto) {
        return this.prisma.investor.create({
            data: createInvestorDto,
        });
    }
    async getAllInvestors(page = 1, limit = 10, search = '') {
        const skip = (page - 1) * limit;
        const where = search ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ],
        } : {};
        const [investors, total] = await Promise.all([
            this.prisma.investor.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    investments: {
                        include: {
                            purchaseOrder: {
                                select: {
                                    status: true,
                                    totalAmount: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.investor.count({ where }),
        ]);
        return {
            investors,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getInvestorById(id) {
        const investor = await this.prisma.investor.findUnique({
            where: { id },
            include: {
                investments: {
                    include: {
                        purchaseOrder: {
                            select: {
                                poNumber: true,
                                status: true,
                                totalAmount: true,
                                vendorName: true,
                                createdAt: true,
                            },
                        },
                    },
                },
            },
        });
        if (!investor) {
            throw new common_1.NotFoundException(`Investor with ID ${id} not found`);
        }
        return investor;
    }
    async updateInvestor(id, updateInvestorDto) {
        await this.getInvestorById(id);
        return this.prisma.investor.update({
            where: { id },
            data: updateInvestorDto,
        });
    }
    async deleteInvestor(id) {
        await this.getInvestorById(id);
        const investments = await this.prisma.purchaseOrderInvestment.count({
            where: { investorId: id },
        });
        if (investments > 0) {
            throw new common_1.NotFoundException('Cannot delete investor with existing investments. Please deactivate instead.');
        }
        return this.prisma.investor.delete({
            where: { id },
        });
    }
    async toggleInvestorStatus(id) {
        const investor = await this.getInvestorById(id);
        return this.prisma.investor.update({
            where: { id },
            data: { isActive: !investor.isActive },
        });
    }
    async getInvestorStatistics() {
        const [totalInvestors, activeInvestors, totalInvestmentData, investorsWithInvestments,] = await Promise.all([
            this.prisma.investor.count(),
            this.prisma.investor.count({ where: { isActive: true } }),
            this.prisma.purchaseOrderInvestment.aggregate({
                _sum: { investmentAmount: true },
            }),
            this.prisma.investor.findMany({
                where: { isActive: true },
                include: {
                    investments: {
                        include: {
                            purchaseOrder: {
                                select: { status: true },
                            },
                        },
                    },
                },
            }),
        ]);
        const totalInvestment = totalInvestmentData._sum.investmentAmount || 0;
        const investorStats = investorsWithInvestments.map(investor => {
            const totalInvested = investor.investments.reduce((sum, inv) => sum + inv.investmentAmount, 0);
            const activeInvestments = investor.investments.filter(inv => inv.purchaseOrder.status !== 'CANCELLED').length;
            return {
                investorId: investor.id,
                investorName: investor.name,
                totalInvested,
                activeInvestments,
                sharePercentage: totalInvestment > 0 ? (totalInvested / totalInvestment) * 100 : 0,
            };
        });
        const equityDistribution = investorStats.map(stat => ({
            investorName: stat.investorName,
            sharePercentage: stat.sharePercentage,
            amount: stat.totalInvested,
        }));
        const averageShare = investorStats.length > 0
            ? investorStats.reduce((sum, stat) => sum + stat.sharePercentage, 0) / investorStats.length
            : 0;
        const averageInvestment = investorStats.length > 0
            ? investorStats.reduce((sum, stat) => sum + stat.totalInvested, 0) / investorStats.length
            : 0;
        return {
            summary: {
                totalInvestors,
                activeInvestors,
                inactiveInvestors: totalInvestors - activeInvestors,
                totalInvestment,
                combinedCapital: totalInvestment,
                averageInvestment,
                averageShare,
            },
            equityDistribution,
            investorDetails: investorStats,
        };
    }
    async getInvestorPerformanceReport() {
        const investors = await this.prisma.investor.findMany({
            where: { isActive: true },
            include: {
                investments: {
                    include: {
                        purchaseOrder: {
                            select: {
                                status: true,
                                totalAmount: true,
                                poNumber: true,
                                createdAt: true,
                            },
                        },
                    },
                },
            },
        });
        const report = investors.map(investor => {
            const totalInvested = investor.investments.reduce((sum, inv) => sum + inv.investmentAmount, 0);
            const totalProfit = 0;
            const activeInvestments = investor.investments.filter(inv => !['CANCELLED', 'RECEIVED'].includes(inv.purchaseOrder.status)).length;
            const completedInvestments = investor.investments.filter(inv => inv.purchaseOrder.status === 'RECEIVED').length;
            return {
                id: investor.id,
                name: investor.name,
                email: investor.email,
                totalInvested,
                totalProfit,
                activeInvestments,
                completedInvestments,
                totalInvestments: investor.investments.length,
                roi: totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0,
                lastInvestment: investor.investments.length > 0
                    ? investor.investments[investor.investments.length - 1].purchaseOrder.createdAt
                    : null,
            };
        });
        return report.sort((a, b) => b.totalInvested - a.totalInvested);
    }
    async getEquityDistribution() {
        const statistics = await this.getInvestorStatistics();
        return statistics.equityDistribution;
    }
    async getDueSummary(investorId) {
        const investor = await this.prisma.investor.findUnique({
            where: { id: investorId },
            include: {
                investments: {
                    include: {
                        purchaseOrder: {
                            include: {
                                items: true,
                                inventory: {
                                    include: {
                                        billItems: {
                                            include: {
                                                bill: {
                                                    include: {
                                                        payments: true,
                                                        buyerPO: {
                                                            include: {
                                                                quotation: {
                                                                    select: {
                                                                        companyName: true,
                                                                        companyContact: true
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                },
                                            },
                                        },
                                        retailItems: {
                                            include: {
                                                retailSale: true
                                            }
                                        }
                                    },
                                },
                            },
                        },
                    },
                },
                investorPayments: {
                    orderBy: { paymentDate: 'desc' },
                    include: {}
                }
            },
        });
        if (!investor)
            throw new common_1.NotFoundException('Investor not found');
        const investorInfo = {
            id: investor.id,
            name: investor.name,
            email: investor.email,
            phone: investor.phone,
            taxId: investor.taxId,
            bankAccount: investor.bankAccount,
            bankName: investor.bankName,
            joinDate: investor.createdAt,
            status: investor.isActive ? 'Active' : 'Inactive'
        };
        let totalInvestment = 0;
        let totalRevenue = 0;
        let totalCollected = 0;
        let totalProfitEarned = 0;
        let payableNow = 0;
        const investmentBreakdown = [];
        const productSales = [];
        for (const inv of investor.investments) {
            const po = inv.purchaseOrder;
            const profitPercent = inv.profitPercentage / 100;
            totalInvestment += inv.investmentAmount;
            let poRevenue = 0;
            let poCollected = 0;
            let poCost = 0;
            poCost = po.items.reduce((sum, item) => sum + item.totalPrice, 0);
            const poProducts = new Map();
            for (const inventory of po.inventory) {
                for (const billItem of inventory.billItems) {
                    const bill = billItem.bill;
                    poRevenue += billItem.totalPrice;
                    const productKey = `${inventory.productName}-${inventory.productCode}`;
                    if (!poProducts.has(productKey)) {
                        poProducts.set(productKey, {
                            productName: inventory.productName,
                            productCode: inventory.productCode,
                            purchasePrice: inventory.purchasePrice,
                            expectedSalePrice: inventory.expectedSalePrice,
                            totalSold: 0,
                            totalRevenue: 0,
                            customers: new Set()
                        });
                    }
                    const product = poProducts.get(productKey);
                    product.totalSold += billItem.quantity;
                    product.totalRevenue += billItem.totalPrice;
                    product.customers.add(bill.buyerPO?.quotation?.companyName || 'Unknown Customer');
                    const billCollected = bill.payments.reduce((sum, p) => sum + p.amount, 0);
                    poCollected += (billItem.totalPrice / bill.totalAmount) * billCollected;
                }
                for (const retailItem of inventory.retailItems) {
                    const retailSale = retailItem.retailSale;
                    poRevenue += retailItem.totalPrice;
                    poCollected += retailItem.totalPrice;
                    const productKey = `${inventory.productName}-${inventory.productCode}`;
                    if (!poProducts.has(productKey)) {
                        poProducts.set(productKey, {
                            productName: inventory.productName,
                            productCode: inventory.productCode,
                            purchasePrice: inventory.purchasePrice,
                            expectedSalePrice: inventory.expectedSalePrice,
                            totalSold: 0,
                            totalRevenue: 0,
                            customers: new Set()
                        });
                    }
                    const product = poProducts.get(productKey);
                    product.totalSold += retailItem.quantity;
                    product.totalRevenue += retailItem.totalPrice;
                    product.customers.add('Retail Customer');
                }
            }
            const poProfit = poRevenue * profitPercent;
            const poPayableNow = poCollected * profitPercent;
            totalRevenue += poRevenue;
            totalCollected += poCollected;
            totalProfitEarned += poProfit;
            payableNow += poPayableNow;
            poProducts.forEach(product => {
                productSales.push({
                    poId: po.id,
                    poNumber: po.poNumber,
                    ...product,
                    customers: Array.from(product.customers)
                });
            });
            investmentBreakdown.push({
                investmentId: inv.id,
                poId: po.id,
                poNumber: po.poNumber,
                vendorName: po.vendorName,
                investmentAmount: inv.investmentAmount,
                profitPercentage: inv.profitPercentage,
                poStatus: po.status,
                orderDate: po.createdAt,
                receivedDate: po.receivedAt,
                poCost,
                poRevenue,
                poCollected,
                poProfit,
                poPayableNow,
                roi: ((poRevenue - poCost) / poCost) * 100,
                profitEarned: poProfit,
                payableNow: poPayableNow,
                products: po.items.map(item => ({
                    productName: item.productName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice
                }))
            });
        }
        const paymentHistory = investor.investorPayments.map(payment => ({
            id: payment.id,
            amount: payment.amount,
            paymentDate: payment.paymentDate,
            description: payment.description,
            paymentMethod: payment.paymentMethod,
            reference: payment.reference
        }));
        const totalPaid = paymentHistory.reduce((sum, p) => sum + p.amount, 0);
        const totalDue = totalProfitEarned - totalPaid;
        payableNow = Math.max(0, payableNow - totalPaid);
        const overallROI = totalInvestment > 0 ? ((totalProfitEarned - totalInvestment) / totalInvestment) * 100 : 0;
        const collectionEfficiency = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0;
        return {
            investor: investorInfo,
            summary: {
                totalInvestment,
                totalRevenue,
                totalCollected,
                totalProfitEarned,
                totalPaid,
                totalDue,
                payableNow,
                overallROI: Number(overallROI.toFixed(2)),
                collectionEfficiency: Number(collectionEfficiency.toFixed(2)),
                activeInvestments: investor.investments.filter(inv => ['ORDERED', 'SHIPPED', 'RECEIVED'].includes(inv.purchaseOrder.status)).length
            },
            investmentBreakdown,
            productSales,
            paymentHistory,
            recentActivity: [
                ...investmentBreakdown
                    .filter(inv => inv.poStatus === 'RECEIVED')
                    .map(inv => ({
                    type: 'PO_RECEIVED',
                    date: inv.receivedDate,
                    description: `Purchase Order ${inv.poNumber} received from ${inv.vendorName}`,
                    amount: inv.investmentAmount
                })),
                ...paymentHistory.map(payment => ({
                    type: 'PAYMENT_RECEIVED',
                    date: payment.paymentDate,
                    description: `Payment received - ${payment.description || 'Investor Payment'}`,
                    amount: payment.amount,
                    method: payment.paymentMethod
                }))
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)
        };
    }
    async payInvestor(investorId, amount, description, paymentMethod, reference) {
        if (amount <= 0)
            throw new common_1.BadRequestException('Invalid amount');
        const investor = await this.prisma.investor.findUnique({
            where: { id: investorId }
        });
        if (!investor)
            throw new common_1.NotFoundException('Investor not found');
        const summary = await this.getDueSummary(investorId);
        if (amount > summary.summary.payableNow) {
            throw new common_1.BadRequestException(`You can only pay up to ${summary.summary.payableNow} BDT right now. Available from collected sales.`);
        }
        const payment = await this.prisma.investorPayment.create({
            data: {
                investorId,
                amount,
                description: description || `Payment for profits from sales`,
                paymentMethod,
                reference,
            },
        });
        return {
            success: true,
            payment,
            newBalance: {
                previousDue: summary.summary.totalDue,
                newDue: summary.summary.totalDue - amount,
                remainingPayable: summary.summary.payableNow - amount
            },
            investor: summary.investor
        };
    }
};
exports.InvestorService = InvestorService;
exports.InvestorService = InvestorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], InvestorService);
//# sourceMappingURL=investor.service.js.map