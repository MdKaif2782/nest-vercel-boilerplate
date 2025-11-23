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
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let ReportService = class ReportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getInventorySummary() {
        const inventory = await this.prisma.inventory.findMany({
            include: {
                purchaseOrder: true,
            },
        });
        const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
        const totalInventoryValue = inventory.reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0);
        const totalExpectedSaleValue = inventory.reduce((sum, item) => sum + item.quantity * item.expectedSalePrice, 0);
        const lowStockItemsCount = inventory.filter((item) => item.minStockLevel && item.quantity < item.minStockLevel).length;
        return {
            totalItems,
            totalInventoryValue,
            totalExpectedSaleValue,
            averageStockValue: totalInventoryValue / inventory.length,
            lowStockItemsCount,
        };
    }
    async getCompanyWiseStock() {
        const inventory = await this.prisma.inventory.findMany({
            include: {
                purchaseOrder: true,
            },
        });
        const companyStock = inventory.reduce((acc, item) => {
            const company = item.purchaseOrder.vendorName;
            if (!acc[company]) {
                acc[company] = {
                    stockValue: 0,
                    itemCount: 0,
                };
            }
            acc[company].stockValue += item.quantity * item.purchasePrice;
            acc[company].itemCount += item.quantity;
            return acc;
        }, {});
        const totalValue = Object.values(companyStock).reduce((sum, company) => sum + company.stockValue, 0);
        return Object.entries(companyStock).map(([companyName, data]) => ({
            companyName,
            stockValue: data.stockValue,
            itemCount: data.itemCount,
            percentageOfTotal: totalValue > 0 ? (data.stockValue / totalValue) * 100 : 0,
        }));
    }
    async getLowStockReport() {
        const lowStockItems = await this.prisma.inventory.findMany({
            where: {
                OR: [
                    {
                        minStockLevel: {
                            not: null,
                        },
                        quantity: {
                            lt: this.prisma.inventory.fields.minStockLevel,
                        },
                    },
                    {
                        minStockLevel: null,
                        quantity: {
                            lte: 10,
                        },
                    },
                ],
            },
            include: {
                purchaseOrder: true,
            },
        });
        return lowStockItems.map((item) => ({
            id: item.id,
            productCode: item.productCode,
            productName: item.productName,
            currentQuantity: item.quantity,
            minStockLevel: item.minStockLevel,
            maxStockLevel: item.maxStockLevel,
            purchasePrice: item.purchasePrice,
            expectedSalePrice: item.expectedSalePrice,
        }));
    }
    async getCompanyReceivables() {
        const bills = await this.prisma.bill.findMany({
            include: {
                buyerPO: {
                    include: {
                        quotation: true,
                    },
                },
                payments: true,
                items: true,
            },
        });
        const companyData = bills.reduce((acc, bill) => {
            const company = bill.buyerPO.quotation.companyName;
            if (!acc[company]) {
                acc[company] = {
                    totalBilled: 0,
                    totalCollected: 0,
                    totalDue: 0,
                };
            }
            acc[company].totalBilled += bill.totalAmount;
            const collected = bill.payments.reduce((sum, payment) => sum + payment.amount, 0);
            acc[company].totalCollected += collected;
            acc[company].totalDue += bill.dueAmount;
            return acc;
        }, {});
        return Object.entries(companyData).map(([companyName, data]) => ({
            companyName,
            totalBilled: data.totalBilled,
            totalCollected: data.totalCollected,
            totalDue: data.totalDue,
            collectionRate: (data.totalCollected / data.totalBilled) * 100,
        }));
    }
    async getReceivableAging() {
        const bills = await this.prisma.bill.findMany({
            where: {
                dueAmount: {
                    gt: 0,
                },
            },
            include: {
                payments: true,
            },
        });
        const now = new Date();
        const agingBuckets = [
            { name: '0-30 days', maxDays: 30 },
            { name: '31-60 days', maxDays: 60 },
            { name: '61-90 days', maxDays: 90 },
            { name: '91+ days', maxDays: Infinity },
        ];
        const buckets = agingBuckets.map((bucket) => {
            const bucketBills = bills.filter((bill) => {
                const billDate = new Date(bill.billDate);
                const daysDiff = Math.floor((now.getTime() - billDate.getTime()) / (1000 * 60 * 60 * 24));
                return daysDiff <= bucket.maxDays && daysDiff > (bucket.maxDays - 30);
            });
            const amount = bucketBills.reduce((sum, bill) => sum + bill.dueAmount, 0);
            return {
                bucket: bucket.name,
                amount,
                count: bucketBills.length,
                percentage: 0,
            };
        });
        const totalReceivable = buckets.reduce((sum, bucket) => sum + bucket.amount, 0);
        buckets.forEach((bucket) => {
            bucket.percentage = totalReceivable > 0 ? (bucket.amount / totalReceivable) * 100 : 0;
        });
        return {
            totalReceivable,
            agingBuckets: buckets,
        };
    }
    async getBillingSummary() {
        const bills = await this.prisma.bill.findMany({
            include: {
                payments: true,
            },
        });
        const totalBilledAmount = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
        const totalCollected = bills.reduce((sum, bill) => sum + bill.payments.reduce((pSum, payment) => pSum + payment.amount, 0), 0);
        const totalDue = bills.reduce((sum, bill) => sum + bill.dueAmount, 0);
        const billsByStatus = {
            pending: bills.filter((bill) => bill.status === 'PENDING').length,
            partiallyPaid: bills.filter((bill) => bill.status === 'PARTIALLY_PAID').length,
            paid: bills.filter((bill) => bill.status === 'PAID').length,
            overdue: bills.filter((bill) => bill.status === 'OVERDUE').length,
        };
        return {
            totalBills: bills.length,
            totalBilledAmount,
            totalCollected,
            totalDue,
            collectionRate: (totalCollected / totalBilledAmount) * 100,
            billsByStatus,
        };
    }
    async getInvestorSummary() {
        const investors = await this.prisma.investor.findMany({
            include: {
                investments: {
                    include: {
                        purchaseOrder: {
                            include: {
                                items: true,
                                investments: true,
                                inventory: {
                                    include: {
                                        billItems: {
                                            include: {
                                                bill: {
                                                    include: {
                                                        payments: true,
                                                    },
                                                },
                                            },
                                        },
                                        retailItems: true,
                                    },
                                },
                            },
                        },
                    },
                },
                investorPayments: true,
            },
        });
        return investors.map((investor) => {
            let totalInvestment = 0;
            let totalRevenue = 0;
            let totalCollected = 0;
            let totalProfitEarned = 0;
            let payableNow = 0;
            let activeInvestments = 0;
            investor.investments.forEach((investment) => {
                totalInvestment += investment.investmentAmount;
                const po = investment.purchaseOrder;
                const billRevenue = po.inventory.reduce((sum, inv) => {
                    return sum + inv.billItems.reduce((bSum, item) => bSum + item.totalPrice, 0);
                }, 0);
                const retailRevenue = po.inventory.reduce((sum, inv) => {
                    return sum + inv.retailItems.reduce((rSum, item) => rSum + item.totalPrice, 0);
                }, 0);
                const poRevenue = billRevenue + retailRevenue;
                totalRevenue += poRevenue;
                const collected = po.inventory.reduce((sum, inv) => {
                    return sum + inv.billItems.reduce((bSum, item) => {
                        const bill = item.bill;
                        const totalBillAmount = bill.totalAmount;
                        const totalPayments = bill.payments.reduce((pSum, p) => pSum + p.amount, 0);
                        const itemShare = item.totalPrice / totalBillAmount;
                        return bSum + totalPayments * itemShare;
                    }, 0);
                }, 0);
                totalCollected += collected;
                const profit = poRevenue * (investment.profitPercentage / 100);
                totalProfitEarned += profit;
                payableNow += collected * (investment.profitPercentage / 100);
                if (po.status !== 'CANCELLED') {
                    activeInvestments++;
                }
            });
            const totalPaid = investor.investorPayments.reduce((sum, payment) => sum + payment.amount, 0);
            const totalDue = totalProfitEarned - totalPaid;
            const overallROI = totalInvestment > 0 ? (totalProfitEarned / totalInvestment) * 100 : 0;
            return {
                investorId: investor.id,
                investorName: investor.name,
                totalInvestment,
                totalRevenue,
                totalCollected,
                totalProfitEarned,
                totalPaid,
                totalDue,
                payableNow,
                overallROI,
                activeInvestments,
            };
        });
    }
    async getInvestmentBreakdown(investorId) {
        const investments = await this.prisma.purchaseOrderInvestment.findMany({
            where: { investorId },
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
                                            },
                                        },
                                    },
                                },
                                retailItems: true,
                            },
                        },
                    },
                },
            },
        });
        return investments.map((investment) => {
            const po = investment.purchaseOrder;
            const billRevenue = po.inventory.reduce((sum, inv) => {
                return sum + inv.billItems.reduce((bSum, item) => bSum + item.totalPrice, 0);
            }, 0);
            const retailRevenue = po.inventory.reduce((sum, inv) => {
                return sum + inv.retailItems.reduce((rSum, item) => rSum + item.totalPrice, 0);
            }, 0);
            const totalRevenue = billRevenue + retailRevenue;
            const collected = po.inventory.reduce((sum, inv) => {
                return sum + inv.billItems.reduce((bSum, item) => {
                    const bill = item.bill;
                    const totalBillAmount = bill.totalAmount;
                    const totalPayments = bill.payments.reduce((pSum, p) => pSum + p.amount, 0);
                    const itemShare = item.totalPrice / totalBillAmount;
                    return bSum + totalPayments * itemShare;
                }, 0);
            }, 0);
            const profitEarned = totalRevenue * (investment.profitPercentage / 100);
            const payableNow = collected * (investment.profitPercentage / 100);
            const roi = (profitEarned / investment.investmentAmount) * 100;
            return {
                investmentId: investment.id,
                poNumber: po.poNumber,
                vendorName: po.vendorName,
                investmentAmount: investment.investmentAmount,
                profitPercentage: investment.profitPercentage,
                totalRevenue,
                totalCollected: collected,
                profitEarned,
                payableNow,
                roi,
                status: po.status,
            };
        });
    }
    async getExpenseByCategory(query) {
        const where = {};
        if (query.startDate && query.endDate) {
            where.expenseDate = {
                gte: new Date(query.startDate),
                lte: new Date(query.endDate),
            };
        }
        const expenses = await this.prisma.expense.findMany({
            where,
        });
        const categoryData = expenses.reduce((acc, expense) => {
            const category = expense.category;
            if (!acc[category]) {
                acc[category] = {
                    totalAmount: 0,
                    count: 0,
                };
            }
            acc[category].totalAmount += expense.amount;
            acc[category].count++;
            return acc;
        }, {});
        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        return Object.entries(categoryData).map(([category, data]) => ({
            category,
            totalAmount: data.totalAmount,
            count: data.count,
            percentage: (data.totalAmount / totalAmount) * 100,
        }));
    }
    async getPeriodicExpenses(query) {
        const expenses = await this.prisma.expense.findMany({
            where: {
                expenseDate: {
                    gte: new Date('2023-01-01'),
                    lte: new Date(),
                },
            },
            orderBy: {
                expenseDate: 'asc',
            },
        });
        const monthlyData = expenses.reduce((acc, expense) => {
            const monthYear = expense.expenseDate.toISOString().substring(0, 7);
            if (!acc[monthYear]) {
                acc[monthYear] = [];
            }
            acc[monthYear].push(expense);
            return acc;
        }, {});
        return Object.entries(monthlyData).map(([period, periodExpenses]) => {
            const categorySummary = periodExpenses.reduce((acc, expense) => {
                const category = expense.category;
                if (!acc[category]) {
                    acc[category] = {
                        totalAmount: 0,
                        count: 0,
                    };
                }
                acc[category].totalAmount += expense.amount;
                acc[category].count++;
                return acc;
            }, {});
            const categories = Object.entries(categorySummary).map(([category, data]) => ({
                category,
                totalAmount: data.totalAmount,
                count: data.count,
                percentage: (data.totalAmount / periodExpenses.reduce((sum, e) => sum + e.amount, 0)) * 100,
            }));
            return {
                period,
                totalAmount: periodExpenses.reduce((sum, expense) => sum + expense.amount, 0),
                count: periodExpenses.length,
                categories,
            };
        });
    }
    async getSalesSummary(query) {
        const where = {};
        if (query.startDate && query.endDate) {
            where.billDate = {
                gte: new Date(query.startDate),
                lte: new Date(query.endDate),
            };
        }
        const bills = await this.prisma.bill.findMany({
            where,
            include: {
                items: {
                    include: {
                        inventory: true,
                    },
                },
            },
        });
        const retailSales = await this.prisma.retailSale.findMany({
            where: {
                saleDate: query.startDate && query.endDate ? {
                    gte: new Date(query.startDate),
                    lte: new Date(query.endDate),
                } : undefined,
            },
            include: {
                items: {
                    include: {
                        inventory: true,
                    },
                },
            },
        });
        const corporateSales = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
        const retailSalesAmount = retailSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalSales = corporateSales + retailSalesAmount;
        let cogs = 0;
        bills.forEach((bill) => {
            bill.items.forEach((item) => {
                const cost = item.inventory.purchasePrice * item.quantity;
                cogs += cost;
            });
        });
        retailSales.forEach((sale) => {
            sale.items.forEach((item) => {
                const cost = item.inventory.purchasePrice * item.quantity;
                cogs += cost;
            });
        });
        const grossProfit = totalSales - cogs;
        const expenseWhere = {};
        if (query.startDate && query.endDate) {
            expenseWhere.expenseDate = {
                gte: new Date(query.startDate),
                lte: new Date(query.endDate),
            };
        }
        const expenses = await this.prisma.expense.findMany({
            where: expenseWhere,
        });
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const netProfit = grossProfit - totalExpenses;
        return {
            totalSales,
            corporateSales,
            retailSales: retailSalesAmount,
            cogs,
            grossProfit,
            netProfit,
            grossMargin: (grossProfit / totalSales) * 100,
            netMargin: (netProfit / totalSales) * 100,
        };
    }
    async getSalarySummary() {
        const employees = await this.prisma.employee.findMany({
            where: {
                isActive: true,
            },
            include: {
                salaries: {
                    where: {
                        status: 'PAID',
                    },
                },
            },
        });
        const totalSalaryExpense = employees.reduce((sum, employee) => {
            const employeeTotal = employee.salaries.reduce((sSum, salary) => sSum + salary.netSalary, 0);
            return sum + employeeTotal;
        }, 0);
        const activeEmployees = employees.filter(emp => emp.isActive).length;
        return {
            totalSalaryExpense,
            totalEmployees: employees.length,
            activeEmployees,
            averageSalary: employees.length > 0 ? totalSalaryExpense / employees.length : 0,
        };
    }
    async getMonthlySalaries(query) {
        const where = {};
        if (query.year) {
            where.year = query.year;
        }
        if (query.month) {
            where.month = query.month;
        }
        const salaries = await this.prisma.salary.findMany({
            where: {
                ...where,
                status: 'PAID',
            },
            include: {
                employee: true,
            },
        });
        const monthlyData = salaries.reduce((acc, salary) => {
            const key = `${salary.year}-${salary.month.toString().padStart(2, '0')}`;
            if (!acc[key]) {
                acc[key] = {
                    salaries: [],
                    employees: new Set(),
                };
            }
            acc[key].salaries.push(salary);
            acc[key].employees.add(salary.employeeId);
            return acc;
        }, {});
        return Object.entries(monthlyData).map(([period, data]) => {
            const periodSalaries = data.salaries;
            const totalSalary = periodSalaries.reduce((sum, salary) => sum + salary.netSalary, 0);
            const allowances = periodSalaries.reduce((sum, salary) => sum + salary.allowances, 0);
            const overtime = periodSalaries.reduce((sum, salary) => sum + (salary.overtimeAmount || 0), 0);
            const bonuses = periodSalaries.reduce((sum, salary) => sum + (salary.bonus || 0), 0);
            return {
                month: period,
                year: parseInt(period.split('-')[0]),
                totalSalary,
                employeeCount: data.employees.size,
                allowances,
                overtime,
                bonuses,
            };
        });
    }
    async getBusinessHealth(query) {
        const salesSummary = await this.getSalesSummary(query);
        const inventorySummary = await this.getInventorySummary();
        const billingSummary = await this.getBillingSummary();
        const expenses = await this.prisma.expense.findMany({
            where: query.startDate && query.endDate ? {
                expenseDate: {
                    gte: new Date(query.startDate),
                    lte: new Date(query.endDate),
                },
            } : undefined,
        });
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const profitabilityIndex = totalExpenses > 0 ? salesSummary.netProfit / totalExpenses : 0;
        const operatingMargin = salesSummary.netMargin;
        const cogs = salesSummary.cogs;
        const averageInventoryValue = inventorySummary.totalInventoryValue;
        const inventoryTurnover = averageInventoryValue > 0 ? cogs / averageInventoryValue : 0;
        const investorPayments = await this.prisma.investorPayment.findMany({
            where: query.startDate && query.endDate ? {
                paymentDate: {
                    gte: new Date(query.startDate),
                    lte: new Date(query.endDate),
                },
            } : undefined,
        });
        const totalInvestorPayouts = investorPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const cashFlow = billingSummary.totalCollected - totalExpenses - totalInvestorPayouts;
        return {
            profitabilityIndex,
            operatingMargin,
            inventoryTurnover,
            cashFlow,
            currentRatio: 1.5,
            quickRatio: 1.2,
        };
    }
    async getCorporateSummary(query) {
        const dateRange = {
            startDate: '2023-01-01',
            endDate: new Date().toISOString().split('T')[0],
        };
        const [inventorySummary, billingSummary, investorSummary, expenseCategories, salesSummary, salarySummary, businessHealth,] = await Promise.all([
            this.getInventorySummary(),
            this.getBillingSummary(),
            this.getInvestorSummary(),
            this.getExpenseByCategory(dateRange),
            this.getSalesSummary(dateRange),
            this.getSalarySummary(),
            this.getBusinessHealth(dateRange),
        ]);
        const totalInvestment = investorSummary.reduce((sum, investor) => sum + investor.totalInvestment, 0);
        const totalDueToInvestors = investorSummary.reduce((sum, investor) => sum + investor.totalDue, 0);
        const totalExpenses = expenseCategories.reduce((sum, category) => sum + category.totalAmount, 0);
        return {
            period: query.period || 'all-time',
            financials: {
                totalRevenue: salesSummary.totalSales,
                totalExpenses,
                netProfit: salesSummary.netProfit,
                totalAssets: inventorySummary.totalInventoryValue + billingSummary.totalCollected,
                totalLiabilities: totalDueToInvestors + billingSummary.totalDue,
                equity: (inventorySummary.totalInventoryValue + billingSummary.totalCollected) -
                    (totalDueToInvestors + billingSummary.totalDue),
            },
            sales: salesSummary,
            inventory: inventorySummary,
            receivables: billingSummary,
            investors: {
                totalInvestment,
                totalDueToInvestors,
                investorCount: investorSummary.length,
            },
            expenses: {
                total: totalExpenses,
                byCategory: expenseCategories,
            },
            employees: salarySummary,
            health: businessHealth,
        };
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ReportService);
//# sourceMappingURL=report.service.js.map