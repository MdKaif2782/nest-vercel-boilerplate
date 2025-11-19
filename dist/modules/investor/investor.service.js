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
                                                    include: { payments: true },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                }
            },
        });
        if (!investor)
            throw new common_1.NotFoundException('Investor not found');
        let totalProfitEarned = 0;
        let payableNow = 0;
        const poBreakdown = [];
        for (const inv of investor.investments) {
            const po = inv.purchaseOrder;
            const profitPercent = inv.profitPercentage / 100;
            let poRevenue = 0;
            let poCollected = 0;
            for (const inventory of po.inventory) {
                for (const billItem of inventory.billItems) {
                    const bill = billItem.bill;
                    poRevenue += billItem.totalPrice;
                    for (const p of bill.payments) {
                        poCollected += p.amount;
                    }
                }
            }
            const poProfit = poRevenue * profitPercent;
            const poPayableNow = poCollected * profitPercent;
            totalProfitEarned += poProfit;
            payableNow += poPayableNow;
            poBreakdown.push({
                poId: po.id,
                poNumber: po.poNumber,
                poRevenue,
                poCollected,
                profitPercentage: inv.profitPercentage,
                profitEarned: poProfit,
                payableNow: poPayableNow,
            });
        }
        const investorPayments = await this.prisma.investorPayment.findMany({
            where: { investorId },
        });
        const totalPaid = investorPayments.reduce((s, p) => s + p.amount, 0);
        const due = totalProfitEarned - totalPaid;
        payableNow = payableNow - totalPaid;
        if (payableNow < 0)
            payableNow = 0;
        return {
            investorId,
            totalProfitEarned,
            totalPaid,
            totalDue: due,
            payableNow,
            poBreakdown,
        };
    }
    async payInvestor(investorId, amount, description) {
        if (amount <= 0)
            throw new common_1.BadRequestException('Invalid amount');
        const summary = await this.getDueSummary(investorId);
        if (amount > summary.payableNow) {
            throw new common_1.BadRequestException(`You can only pay up to ${summary.payableNow} BDT right now.`);
        }
        return this.prisma.investorPayment.create({
            data: {
                investorId,
                amount,
                description,
            },
        });
    }
};
exports.InvestorService = InvestorService;
exports.InvestorService = InvestorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], InvestorService);
//# sourceMappingURL=investor.service.js.map