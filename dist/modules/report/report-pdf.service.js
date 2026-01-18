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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportPdfService = void 0;
const common_1 = require("@nestjs/common");
const pdfkit_1 = __importDefault(require("pdfkit"));
const letterhead_util_1 = require("../pdf/letterhead.util");
const report_service_1 = require("./report.service");
const database_service_1 = require("../database/database.service");
let ReportPdfService = class ReportPdfService {
    constructor(reportService, prisma) {
        this.reportService = reportService;
        this.prisma = prisma;
    }
    getDateRange(year, month) {
        const now = new Date();
        const targetYear = year || now.getFullYear();
        const targetMonth = month || now.getMonth() + 1;
        let startDate;
        let endDate;
        let isMonthly = false;
        if (month) {
            isMonthly = true;
            startDate = new Date(targetYear, targetMonth - 1, 1);
            endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);
        }
        else if (year) {
            startDate = new Date(targetYear, 0, 1);
            endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);
        }
        else {
            isMonthly = true;
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        }
        return { startDate, endDate, isMonthly };
    }
    async createTable(doc, data) {
        const { title, headers, rows, columnWidths, startY = doc.y } = data;
        const tableWidth = 500;
        const defaultColWidth = tableWidth / headers.length;
        const colWidths = columnWidths || Array(headers.length).fill(defaultColWidth);
        let yPosition = startY;
        if (title) {
            doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333').text(title);
            yPosition = doc.y + 5;
        }
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
        headers.forEach((header, i) => {
            const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
            doc.rect(x, yPosition, colWidths[i], 20).fillAndStroke('#2E86AB', '#2E86AB');
        });
        doc.fillColor('#FFFFFF');
        headers.forEach((header, i) => {
            const x = 55 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
            doc.text(header, x, yPosition + 5, {
                width: colWidths[i] - 10,
                align: 'left',
            });
        });
        yPosition += 20;
        doc.fontSize(8).font('Helvetica').fillColor('#000000');
        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex];
            if (yPosition > 750) {
                doc.addPage();
                yPosition = 50;
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
                headers.forEach((header, i) => {
                    const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
                    doc.rect(x, yPosition, colWidths[i], 20).fillAndStroke('#2E86AB', '#2E86AB');
                });
                doc.fillColor('#FFFFFF');
                headers.forEach((header, i) => {
                    const x = 55 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
                    doc.text(header, x, yPosition + 5, {
                        width: colWidths[i] - 10,
                        align: 'left',
                    });
                });
                yPosition += 20;
                doc.fontSize(8).font('Helvetica').fillColor('#000000');
            }
            const bgColor = rowIndex % 2 === 0 ? '#F8F9FA' : '#FFFFFF';
            doc.rect(50, yPosition, tableWidth, 18).fillAndStroke(bgColor, bgColor);
            row.forEach((cell, i) => {
                const x = 55 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
                doc.fillColor('#000000').text(String(cell), x, yPosition + 4, {
                    width: colWidths[i] - 10,
                    align: 'left',
                    ellipsis: true,
                });
            });
            yPosition += 18;
        }
        doc.y = yPosition + 10;
        return doc.y;
    }
    async fetchFinancialData(startDate, endDate) {
        try {
            const [bills, retailSales, expenses, payments, purchaseOrders, investorPayments] = await Promise.all([
                this.prisma.bill.findMany({
                    where: {
                        billDate: { gte: startDate, lte: endDate },
                    },
                    select: {
                        id: true,
                        billNumber: true,
                        billDate: true,
                        totalAmount: true,
                        dueAmount: true,
                        status: true,
                        buyerPO: {
                            select: {
                                quotation: {
                                    select: {
                                        companyName: true,
                                    },
                                },
                            },
                        },
                        items: {
                            select: {
                                quantity: true,
                                unitPrice: true,
                                totalPrice: true,
                                productDescription: true,
                                inventory: {
                                    select: {
                                        purchasePrice: true,
                                    },
                                },
                            },
                        },
                        payments: {
                            select: {
                                amount: true,
                            },
                        },
                    },
                    orderBy: { billDate: 'desc' },
                }),
                this.prisma.retailSale.findMany({
                    where: {
                        saleDate: { gte: startDate, lte: endDate },
                    },
                    select: {
                        id: true,
                        saleNumber: true,
                        saleDate: true,
                        customerName: true,
                        subtotal: true,
                        discount: true,
                        totalAmount: true,
                        paymentMethod: true,
                        items: {
                            select: {
                                quantity: true,
                                unitPrice: true,
                                totalPrice: true,
                                inventory: {
                                    select: {
                                        productName: true,
                                        purchasePrice: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: { saleDate: 'desc' },
                }),
                this.prisma.expense.findMany({
                    where: {
                        expenseDate: { gte: startDate, lte: endDate },
                    },
                    select: {
                        id: true,
                        title: true,
                        amount: true,
                        category: true,
                        expenseDate: true,
                        paymentMethod: true,
                        status: true,
                        user: {
                            select: {
                                name: true,
                            },
                        },
                    },
                    orderBy: { expenseDate: 'desc' },
                }),
                this.prisma.payment.findMany({
                    where: {
                        paymentDate: { gte: startDate, lte: endDate },
                    },
                    select: {
                        id: true,
                        amount: true,
                        paymentDate: true,
                        paymentMethod: true,
                        reference: true,
                        bill: {
                            select: {
                                billNumber: true,
                                buyerPO: {
                                    select: {
                                        quotation: {
                                            select: {
                                                companyName: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    orderBy: { paymentDate: 'desc' },
                }),
                this.prisma.purchaseOrder.findMany({
                    where: {
                        createdAt: { gte: startDate, lte: endDate },
                    },
                    select: {
                        id: true,
                        poNumber: true,
                        vendorName: true,
                        totalAmount: true,
                        items: {
                            select: {
                                quantity: true,
                                unitPrice: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                }),
                this.prisma.investorPayment.findMany({
                    where: {
                        paymentDate: { gte: startDate, lte: endDate },
                    },
                    select: {
                        id: true,
                        amount: true,
                        paymentDate: true,
                        description: true,
                        investor: {
                            select: {
                                name: true,
                            },
                        },
                    },
                    orderBy: { paymentDate: 'desc' },
                }),
            ]);
            return {
                bills,
                retailSales,
                expenses,
                payments,
                purchaseOrders,
                investorPayments
            };
        }
        catch (error) {
            console.error('Error fetching financial data:', error);
            throw error;
        }
    }
    async generateFinancialReport(year, month) {
        return new Promise(async (resolve, reject) => {
            try {
                const { startDate, endDate, isMonthly } = this.getDateRange(year, month);
                const periodType = isMonthly ? 'Monthly' : 'Yearly';
                console.log(`Generating ${periodType} financial report from ${startDate} to ${endDate}`);
                const data = await this.fetchFinancialData(startDate, endDate);
                const { bills, retailSales, expenses, payments, purchaseOrders, investorPayments } = data;
                const totalBillAmount = bills.reduce((sum, b) => sum + b.totalAmount, 0);
                const totalRetailAmount = retailSales.reduce((sum, s) => sum + s.totalAmount, 0);
                const totalRevenue = totalBillAmount + totalRetailAmount;
                const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
                const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
                const totalPurchaseOrderAmount = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
                const totalInvestorPayments = investorPayments.reduce((sum, ip) => sum + ip.amount, 0);
                let totalCOGS = 0;
                bills.forEach(bill => {
                    bill.items.forEach(item => {
                        totalCOGS += (item.inventory?.purchasePrice || 0) * item.quantity;
                    });
                });
                retailSales.forEach(sale => {
                    sale.items.forEach(item => {
                        totalCOGS += (item.inventory?.purchasePrice || 0) * item.quantity;
                    });
                });
                const totalOutstanding = bills.reduce((sum, b) => sum + b.dueAmount, 0);
                const grossProfit = totalRevenue - totalCOGS;
                const netProfit = grossProfit - totalExpenseAmount;
                const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
                const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
                const cashInflow = totalPayments + totalRetailAmount;
                const cashOutflow = totalExpenseAmount + totalPurchaseOrderAmount + totalInvestorPayments;
                const netCashFlow = cashInflow - cashOutflow;
                const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => {
                    console.log('PDF generation completed');
                    resolve(Buffer.concat(chunks));
                });
                doc.on('error', (err) => {
                    console.error('PDF generation error:', err);
                    reject(err);
                });
                (0, letterhead_util_1.addLetterhead)({ doc, title: `${periodType} Financial Report` });
                doc.fontSize(11)
                    .font('Helvetica-Bold')
                    .text(`${periodType} Period: ${(0, letterhead_util_1.formatDate)(startDate)} to ${(0, letterhead_util_1.formatDate)(endDate)}`, { align: 'center' });
                doc.moveDown(1.5);
                doc.fontSize(14)
                    .font('Helvetica-Bold')
                    .fillColor('#2E86AB')
                    .text('EXECUTIVE SUMMARY', { underline: true });
                doc.moveDown(0.8);
                await this.createTable(doc, {
                    headers: ['Metric', 'Amount', 'Details'],
                    rows: [
                        ['Total Revenue', (0, letterhead_util_1.formatCurrency)(totalRevenue), `${bills.length} bills, ${retailSales.length} retail sales`],
                        ['Cost of Goods Sold', (0, letterhead_util_1.formatCurrency)(totalCOGS), `${totalRevenue > 0 ? ((totalCOGS / totalRevenue) * 100).toFixed(1) : 0}% of revenue`],
                        ['Gross Profit', (0, letterhead_util_1.formatCurrency)(grossProfit), `${grossMargin.toFixed(1)}% margin`],
                        ['Operating Expenses', (0, letterhead_util_1.formatCurrency)(totalExpenseAmount), `${expenses.length} expense entries`],
                        ['Net Profit', (0, letterhead_util_1.formatCurrency)(netProfit), `${netMargin.toFixed(1)}% net margin`],
                        ['Cash Inflow', (0, letterhead_util_1.formatCurrency)(cashInflow), `Payments: ${(0, letterhead_util_1.formatCurrency)(totalPayments)}, Retail: ${(0, letterhead_util_1.formatCurrency)(totalRetailAmount)}`],
                        ['Cash Outflow', (0, letterhead_util_1.formatCurrency)(cashOutflow), `Expenses: ${(0, letterhead_util_1.formatCurrency)(totalExpenseAmount)}, Purchases: ${(0, letterhead_util_1.formatCurrency)(totalPurchaseOrderAmount)}`],
                        ['Net Cash Flow', (0, letterhead_util_1.formatCurrency)(netCashFlow), netCashFlow >= 0 ? 'Positive' : 'Negative'],
                        ['Outstanding', (0, letterhead_util_1.formatCurrency)(totalOutstanding), `${bills.filter(b => b.dueAmount > 0).length} unpaid bills`],
                        ['Investor Payments', (0, letterhead_util_1.formatCurrency)(totalInvestorPayments), `${investorPayments.length} payments made`],
                    ],
                });
                await this.addDetailedSections(doc, data, periodType);
                doc.end();
            }
            catch (error) {
                console.error('Error in generateFinancialReport:', error);
                reject(error);
            }
        });
    }
    async addDetailedSections(doc, data, periodType) {
        const { bills, retailSales, expenses, payments, } = data;
        doc.addPage();
        doc.fontSize(14)
            .font('Helvetica-Bold')
            .fillColor('#2E86AB')
            .text('SALES BREAKDOWN', { underline: true });
        doc.moveDown(0.8);
        const customerMap = new Map();
        bills.forEach(bill => {
            const customer = bill.buyerPO?.quotation?.companyName || 'Unknown';
            if (!customerMap.has(customer)) {
                customerMap.set(customer, { count: 0, total: 0, paid: 0, due: 0 });
            }
            const cust = customerMap.get(customer);
            cust.count++;
            cust.total += bill.totalAmount;
            const paid = bill.totalAmount - bill.dueAmount;
            cust.paid += paid;
            cust.due += bill.dueAmount;
        });
        const customerRows = Array.from(customerMap.entries()).map(([customer, data]) => [
            customer.substring(0, 20),
            data.count.toString(),
            (0, letterhead_util_1.formatCurrency)(data.total),
            (0, letterhead_util_1.formatCurrency)(data.paid),
            (0, letterhead_util_1.formatCurrency)(data.due),
            (0, letterhead_util_1.formatCurrency)(data.total / data.count),
        ]);
        if (customerRows.length > 0) {
            await this.createTable(doc, {
                title: 'Corporate Sales by Customer',
                headers: ['Customer', 'Bills', 'Total Amount', 'Paid', 'Due', 'Avg Bill'],
                rows: customerRows,
            });
        }
        if (expenses.length > 0) {
            const expensesByCategory = expenses.reduce((acc, exp) => {
                acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
                return acc;
            }, {});
            doc.moveDown(1);
            const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
            const expenseRows = Object.entries(expensesByCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([category, amount]) => {
                const count = expenses.filter(e => e.category === category).length;
                return [
                    category,
                    (0, letterhead_util_1.formatCurrency)(amount),
                    `${((amount / totalExpenses) * 100).toFixed(1)}%`,
                    count.toString(),
                ];
            });
            await this.createTable(doc, {
                title: 'Expense Analysis by Category',
                headers: ['Category', 'Amount', '% of Total', 'Transactions'],
                rows: expenseRows,
            });
        }
        doc.addPage();
        doc.fontSize(14)
            .font('Helvetica-Bold')
            .fillColor('#2E86AB')
            .text('PAYMENT COLLECTION PERFORMANCE', { underline: true });
        doc.moveDown(0.8);
        const paymentMethods = payments.reduce((acc, p) => {
            acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.amount;
            return acc;
        }, {});
        const totalPaymentAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        const paymentRows = Object.entries(paymentMethods).map(([method, amount]) => {
            const count = payments.filter(p => p.paymentMethod === method).length;
            return [
                method,
                (0, letterhead_util_1.formatCurrency)(amount),
                `${totalPaymentAmount > 0 ? ((amount / totalPaymentAmount) * 100).toFixed(1) : 0}%`,
                count.toString(),
            ];
        });
        await this.createTable(doc, {
            headers: ['Payment Method', 'Amount', '% of Total', 'Transactions'],
            rows: paymentRows,
        });
    }
    async generateInventoryReport(year, month) {
        return new Promise(async (resolve, reject) => {
            try {
                const { startDate, endDate, isMonthly } = this.getDateRange(year, month);
                const periodType = isMonthly ? 'Monthly' : 'Yearly';
                console.log(`Generating ${periodType} inventory report`);
                const inventory = await this.prisma.inventory.findMany({
                    select: {
                        id: true,
                        productCode: true,
                        productName: true,
                        quantity: true,
                        purchasePrice: true,
                        expectedSalePrice: true,
                        minStockLevel: true,
                        maxStockLevel: true,
                        purchaseOrder: {
                            select: {
                                vendorName: true,
                            },
                        },
                    },
                    orderBy: { productName: 'asc' },
                });
                let movementData = new Map();
                if (month) {
                    const [billItems, retailItems] = await Promise.all([
                        this.prisma.billItem.findMany({
                            where: {
                                bill: {
                                    billDate: { gte: startDate, lte: endDate },
                                },
                            },
                            select: {
                                inventoryId: true,
                                quantity: true,
                                unitPrice: true,
                            },
                        }),
                        this.prisma.retailSaleItem.findMany({
                            where: {
                                retailSale: {
                                    saleDate: { gte: startDate, lte: endDate },
                                },
                            },
                            select: {
                                inventoryId: true,
                                quantity: true,
                                unitPrice: true,
                            },
                        }),
                    ]);
                    billItems.forEach(item => {
                        if (!movementData.has(item.inventoryId)) {
                            movementData.set(item.inventoryId, { billQty: 0, retailQty: 0 });
                        }
                        const data = movementData.get(item.inventoryId);
                        data.billQty += item.quantity;
                    });
                    retailItems.forEach(item => {
                        if (!movementData.has(item.inventoryId)) {
                            movementData.set(item.inventoryId, { billQty: 0, retailQty: 0 });
                        }
                        const data = movementData.get(item.inventoryId);
                        data.retailQty += item.quantity;
                    });
                }
                const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
                const totalExpectedValue = inventory.reduce((sum, item) => sum + (item.quantity * item.expectedSalePrice), 0);
                const lowStockItems = inventory.filter(item => item.minStockLevel && item.quantity <= item.minStockLevel);
                const outOfStockItems = inventory.filter(item => item.quantity === 0);
                let totalUnitsSold = 0;
                movementData.forEach(data => {
                    totalUnitsSold += data.billQty + data.retailQty;
                });
                const doc = new pdfkit_1.default({ margin: 50, size: 'A4', layout: 'landscape' });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);
                (0, letterhead_util_1.addLetterhead)({ doc, title: `${periodType} Inventory Report` });
                doc.fontSize(11)
                    .font('Helvetica-Bold')
                    .text(`Report Period: ${(0, letterhead_util_1.formatDate)(startDate)} to ${(0, letterhead_util_1.formatDate)(endDate)}`, { align: 'center' })
                    .text(`Generated: ${(0, letterhead_util_1.formatDate)(new Date())}`, { align: 'center' });
                doc.moveDown(1.5);
                doc.fontSize(14)
                    .font('Helvetica-Bold')
                    .fillColor('#2E86AB')
                    .text('INVENTORY SUMMARY', { underline: true });
                doc.moveDown(0.8);
                await this.createTable(doc, {
                    headers: ['Metric', 'Value', 'Details'],
                    rows: [
                        ['Total SKUs', inventory.length.toString(), 'All products'],
                        ['Total Units in Stock', inventory.reduce((sum, i) => sum + i.quantity, 0).toString(), 'All products'],
                        ['Inventory Value (Cost)', (0, letterhead_util_1.formatCurrency)(totalInventoryValue), 'At purchase price'],
                        ['Potential Sale Value', (0, letterhead_util_1.formatCurrency)(totalExpectedValue), 'At expected sale price'],
                        ['Potential Profit', (0, letterhead_util_1.formatCurrency)(totalExpectedValue - totalInventoryValue), 'If all sold'],
                        ['Low Stock Items', lowStockItems.length.toString(), 'Need attention'],
                        ['Out of Stock Items', outOfStockItems.length.toString(), 'Urgent restock needed'],
                        ['Units Sold (Period)', totalUnitsSold.toString(), `${periodType} movement`],
                        ['Stock Turnover Ratio', inventory.length > 0 ? (totalUnitsSold / inventory.length).toFixed(2) : '0.00', 'Units sold per SKU'],
                    ],
                });
                doc.addPage();
                doc.fontSize(14)
                    .font('Helvetica-Bold')
                    .fillColor('#2E86AB')
                    .text(`COMPLETE INVENTORY LISTING (${inventory.length} Items)`, { underline: true });
                doc.moveDown(0.8);
                const inventoryRows = inventory.map(item => {
                    let status = 'OK';
                    if (item.quantity === 0)
                        status = 'OUT';
                    else if (item.minStockLevel && item.quantity <= item.minStockLevel)
                        status = 'LOW';
                    else if (item.maxStockLevel && item.quantity > item.maxStockLevel)
                        status = 'HIGH';
                    const movement = movementData.get(item.id);
                    const soldQty = movement ? movement.billQty + movement.retailQty : 0;
                    return [
                        item.productCode.substring(0, 8),
                        item.productName.substring(0, 25),
                        item.purchaseOrder?.vendorName?.substring(0, 15) || 'N/A',
                        `${item.quantity}${soldQty > 0 ? ` (-${soldQty})` : ''}`,
                        `${item.minStockLevel || 'N/A'}/${item.maxStockLevel || 'N/A'}`,
                        (0, letterhead_util_1.formatCurrency)(item.purchasePrice),
                        (0, letterhead_util_1.formatCurrency)(item.expectedSalePrice),
                        (0, letterhead_util_1.formatCurrency)(item.quantity * item.purchasePrice),
                        status,
                    ];
                });
                await this.createTable(doc, {
                    headers: ['Code', 'Product Name', 'Supplier', 'Stock', 'Min/Max', 'Cost', 'Sale Price', 'Value', 'Status'],
                    columnWidths: [60, 120, 80, 50, 60, 60, 60, 70, 50],
                    rows: inventoryRows,
                });
                doc.end();
            }
            catch (error) {
                console.error('Error in generateInventoryReport:', error);
                reject(error);
            }
        });
    }
    async generateInvestorReport(year, month) {
        return new Promise(async (resolve, reject) => {
            try {
                const { startDate, endDate, isMonthly } = this.getDateRange(year, month);
                const periodType = isMonthly ? 'Monthly' : 'Yearly';
                console.log(`Generating ${periodType} investor report`);
                const investors = await this.prisma.investor.findMany({
                    where: { isActive: true },
                    select: {
                        id: true,
                        name: true,
                        isActive: true,
                        investments: {
                            select: {
                                investmentAmount: true,
                                profitPercentage: true,
                                purchaseOrder: {
                                    select: {
                                        createdAt: true,
                                    },
                                },
                            },
                        },
                        investorPayments: {
                            where: {
                                paymentDate: { gte: startDate, lte: endDate },
                            },
                            select: {
                                amount: true,
                            },
                        },
                    },
                });
                const investorSummaries = investors.map(investor => {
                    const totalInvestment = investor.investments.reduce((sum, inv) => sum + inv.investmentAmount, 0);
                    const periodInvestments = isMonthly ?
                        investor.investments.filter(inv => inv.purchaseOrder.createdAt >= startDate &&
                            inv.purchaseOrder.createdAt <= endDate) : investor.investments;
                    const periodInvestment = periodInvestments.reduce((sum, inv) => sum + inv.investmentAmount, 0);
                    const periodPayments = investor.investorPayments.reduce((sum, p) => sum + p.amount, 0);
                    const totalReturns = investor.investments.reduce((sum, inv) => {
                        const profit = inv.investmentAmount * (inv.profitPercentage / 100);
                        return sum + profit;
                    }, 0);
                    const periodReturns = periodInvestments.reduce((sum, inv) => {
                        const profit = inv.investmentAmount * (inv.profitPercentage / 100);
                        return sum + profit;
                    }, 0);
                    const totalDue = totalReturns - periodPayments;
                    const overallROI = totalInvestment > 0 ? (totalReturns / totalInvestment) * 100 : 0;
                    const periodROI = periodInvestment > 0 ? (periodReturns / periodInvestment) * 100 : 0;
                    return {
                        investorName: investor.name,
                        totalInvestment,
                        periodInvestment,
                        totalReturns,
                        periodReturns,
                        totalPaid: periodPayments,
                        periodPayments,
                        totalDue,
                        periodDue: periodReturns - periodPayments,
                        overallROI,
                        periodROI,
                        activeInvestments: investor.investments.length,
                        isActive: investor.isActive
                    };
                });
                const totalPeriodInvestment = investorSummaries.reduce((sum, inv) => sum + inv.periodInvestment, 0);
                const totalPeriodReturns = investorSummaries.reduce((sum, inv) => sum + inv.periodReturns, 0);
                const totalPeriodPayments = investorSummaries.reduce((sum, inv) => sum + inv.periodPayments, 0);
                const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);
                (0, letterhead_util_1.addLetterhead)({ doc, title: `${periodType} Investor Report` });
                doc.fontSize(11)
                    .font('Helvetica-Bold')
                    .text(`Period: ${(0, letterhead_util_1.formatDate)(startDate)} to ${(0, letterhead_util_1.formatDate)(endDate)}`, { align: 'center' })
                    .text(`${investors.length} Active Investors | ${investors.reduce((sum, i) => sum + i.investments.length, 0)} Total Investments`, { align: 'center' });
                doc.moveDown(1.5);
                doc.fontSize(14)
                    .font('Helvetica-Bold')
                    .fillColor('#2E86AB')
                    .text('INVESTOR PERFORMANCE SUMMARY', { underline: true });
                doc.moveDown(0.8);
                await this.createTable(doc, {
                    headers: ['Metric', 'Amount', 'Details'],
                    rows: [
                        ['Total Active Investors', investors.length.toString(), `${investors.filter(i => i.isActive).length} active`],
                        ['Period Investment', (0, letterhead_util_1.formatCurrency)(totalPeriodInvestment), `${investors.reduce((sum, i) => sum + i.investments.length, 0)} investments`],
                        ['Period Returns Generated', (0, letterhead_util_1.formatCurrency)(totalPeriodReturns), 'From inventory sales'],
                        ['Period Payments Made', (0, letterhead_util_1.formatCurrency)(totalPeriodPayments), `${investors.reduce((sum, i) => sum + i.investorPayments.length, 0)} payments`],
                        ['Total Investment to Date', (0, letterhead_util_1.formatCurrency)(investorSummaries.reduce((sum, i) => sum + i.totalInvestment, 0)), 'All time'],
                        ['Total Returns to Date', (0, letterhead_util_1.formatCurrency)(investorSummaries.reduce((sum, i) => sum + i.totalReturns, 0)), 'All time'],
                        ['Total Paid to Investors', (0, letterhead_util_1.formatCurrency)(investorSummaries.reduce((sum, i) => sum + i.totalPaid, 0)), 'All time'],
                        ['Total Due to Investors', (0, letterhead_util_1.formatCurrency)(investorSummaries.reduce((sum, i) => sum + i.totalDue, 0)), 'Outstanding'],
                        ['Average ROI (Period)', investorSummaries.length > 0 ? `${(investorSummaries.reduce((sum, i) => sum + i.periodROI, 0) / investorSummaries.length).toFixed(2)}%` : '0%', 'Weighted average'],
                    ],
                });
                doc.addPage();
                doc.fontSize(14)
                    .font('Helvetica-Bold')
                    .fillColor('#2E86AB')
                    .text(`INVESTOR DETAILS (${investorSummaries.length} Investors)`, { underline: true });
                doc.moveDown(0.8);
                const investorRows = investorSummaries.map(inv => [
                    inv.investorName.substring(0, 15),
                    (0, letterhead_util_1.formatCurrency)(inv.totalInvestment),
                    (0, letterhead_util_1.formatCurrency)(inv.periodInvestment),
                    (0, letterhead_util_1.formatCurrency)(inv.totalReturns),
                    (0, letterhead_util_1.formatCurrency)(inv.periodReturns),
                    (0, letterhead_util_1.formatCurrency)(inv.totalPaid),
                    (0, letterhead_util_1.formatCurrency)(inv.totalDue),
                    `${inv.overallROI.toFixed(1)}%`,
                    inv.isActive ? 'Active' : 'Inactive'
                ]);
                await this.createTable(doc, {
                    headers: ['Investor', 'Total Inv.', 'Period Inv.', 'Total Returns', 'Period Returns', 'Paid', 'Due', 'ROI%', 'Status'],
                    columnWidths: [80, 60, 60, 60, 60, 50, 50, 40, 40],
                    rows: investorRows,
                });
                doc.end();
            }
            catch (error) {
                console.error('Error in generateInvestorReport:', error);
                reject(error);
            }
        });
    }
    async generateSalesReport(year, month) {
        return new Promise(async (resolve, reject) => {
            try {
                const { startDate, endDate, isMonthly } = this.getDateRange(year, month);
                const periodType = isMonthly ? 'Monthly' : 'Yearly';
                console.log(`Generating ${periodType} sales report`);
                const [bills, retailSales, payments] = await Promise.all([
                    this.prisma.bill.findMany({
                        where: {
                            billDate: { gte: startDate, lte: endDate },
                        },
                        select: {
                            id: true,
                            billNumber: true,
                            billDate: true,
                            totalAmount: true,
                            dueAmount: true,
                            createdBy: true,
                            buyerPO: {
                                select: {
                                    quotation: {
                                        select: {
                                            companyName: true,
                                        },
                                    },
                                },
                            },
                            items: {
                                select: {
                                    quantity: true,
                                    unitPrice: true,
                                    totalPrice: true,
                                    productDescription: true,
                                    inventory: {
                                        select: {
                                            purchasePrice: true,
                                        },
                                    },
                                },
                            },
                        },
                        orderBy: { billDate: 'desc' },
                    }),
                    this.prisma.retailSale.findMany({
                        where: {
                            saleDate: { gte: startDate, lte: endDate },
                        },
                        select: {
                            id: true,
                            saleNumber: true,
                            saleDate: true,
                            customerName: true,
                            totalAmount: true,
                            items: {
                                select: {
                                    quantity: true,
                                    unitPrice: true,
                                    totalPrice: true,
                                    inventory: {
                                        select: {
                                            productName: true,
                                            purchasePrice: true,
                                        },
                                    },
                                },
                            },
                        },
                        orderBy: { saleDate: 'desc' },
                    }),
                    this.prisma.payment.findMany({
                        where: {
                            paymentDate: { gte: startDate, lte: endDate },
                        },
                        select: {
                            amount: true,
                        },
                    }),
                ]);
                const totalBillAmount = bills.reduce((sum, b) => sum + b.totalAmount, 0);
                const totalRetailAmount = retailSales.reduce((sum, s) => sum + s.totalAmount, 0);
                const totalRevenue = totalBillAmount + totalRetailAmount;
                const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
                const totalOutstanding = bills.reduce((sum, b) => sum + b.dueAmount, 0);
                let totalCOGS = 0;
                let totalProfit = 0;
                bills.forEach(bill => {
                    bill.items.forEach(item => {
                        const cost = (item.inventory?.purchasePrice || 0) * item.quantity;
                        totalCOGS += cost;
                        totalProfit += item.totalPrice - cost;
                    });
                });
                retailSales.forEach(sale => {
                    sale.items.forEach(item => {
                        const cost = (item.inventory?.purchasePrice || 0) * item.quantity;
                        totalCOGS += cost;
                        totalProfit += item.totalPrice - cost;
                    });
                });
                const grossMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
                const collectionRate = totalBillAmount > 0 ? (totalPayments / totalBillAmount) * 100 : 0;
                const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);
                (0, letterhead_util_1.addLetterhead)({ doc, title: `${periodType} Sales Performance Report` });
                doc.fontSize(11)
                    .font('Helvetica-Bold')
                    .text(`Period: ${(0, letterhead_util_1.formatDate)(startDate)} to ${(0, letterhead_util_1.formatDate)(endDate)}`, { align: 'center' });
                doc.moveDown(1.5);
                doc.fontSize(14)
                    .font('Helvetica-Bold')
                    .fillColor('#2E86AB')
                    .text('SALES PERFORMANCE SUMMARY', { underline: true });
                doc.moveDown(0.8);
                await this.createTable(doc, {
                    headers: ['Metric', 'Corporate', 'Retail', 'Total', 'Performance'],
                    rows: [
                        ['Revenue', (0, letterhead_util_1.formatCurrency)(totalBillAmount), (0, letterhead_util_1.formatCurrency)(totalRetailAmount), (0, letterhead_util_1.formatCurrency)(totalRevenue), `${bills.length} bills, ${retailSales.length} sales`],
                        ['Cost of Sales', (0, letterhead_util_1.formatCurrency)(totalCOGS * (totalBillAmount / totalRevenue || 0)), (0, letterhead_util_1.formatCurrency)(totalCOGS * (totalRetailAmount / totalRevenue || 0)), (0, letterhead_util_1.formatCurrency)(totalCOGS), `${grossMargin.toFixed(1)}% gross margin`],
                        ['Gross Profit', (0, letterhead_util_1.formatCurrency)(totalProfit * (totalBillAmount / totalRevenue || 0)), (0, letterhead_util_1.formatCurrency)(totalProfit * (totalRetailAmount / totalRevenue || 0)), (0, letterhead_util_1.formatCurrency)(totalProfit), `${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}% margin`],
                        ['Payments', (0, letterhead_util_1.formatCurrency)(totalPayments), 'N/A', (0, letterhead_util_1.formatCurrency)(totalPayments), `${collectionRate.toFixed(1)}% collection rate`],
                        ['Outstanding', (0, letterhead_util_1.formatCurrency)(totalOutstanding), 'N/A', (0, letterhead_util_1.formatCurrency)(totalOutstanding), `${bills.filter(b => b.dueAmount > 0).length} unpaid bills`],
                        ['Avg Bill/Sale', (0, letterhead_util_1.formatCurrency)(bills.length ? totalBillAmount / bills.length : 0), (0, letterhead_util_1.formatCurrency)(retailSales.length ? totalRetailAmount / retailSales.length : 0), (0, letterhead_util_1.formatCurrency)((bills.length + retailSales.length) > 0 ? totalRevenue / (bills.length + retailSales.length) : 0), 'Average transaction value'],
                    ],
                });
                doc.end();
            }
            catch (error) {
                console.error('Error in generateSalesReport:', error);
                reject(error);
            }
        });
    }
    async generateEmployeeReport(year, month) {
        return new Promise(async (resolve, reject) => {
            try {
                const { startDate, endDate, isMonthly } = this.getDateRange(year, month);
                const periodType = isMonthly ? 'Monthly' : 'Yearly';
                console.log(`Generating ${periodType} employee report`);
                const [employees, salaries] = await Promise.all([
                    this.prisma.employee.findMany({
                        select: {
                            id: true,
                            employeeId: true,
                            name: true,
                            designation: true,
                            baseSalary: true,
                            isActive: true,
                            joinDate: true,
                            userId: true,
                        },
                        orderBy: { name: 'asc' },
                    }),
                    this.prisma.salary.findMany({
                        where: {
                            AND: [
                                { year: year || new Date().getFullYear() },
                                month ? { month: month } : {},
                            ].filter(Boolean),
                        },
                        select: {
                            employeeId: true,
                            netSalary: true,
                            status: true,
                        },
                    }),
                ]);
                const totalEmployees = employees.length;
                const activeEmployees = employees.filter(e => e.isActive).length;
                const totalSalaryExpense = salaries.reduce((sum, s) => sum + s.netSalary, 0);
                const avgSalary = totalEmployees > 0 ? totalSalaryExpense / totalEmployees : 0;
                const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);
                (0, letterhead_util_1.addLetterhead)({ doc, title: `${periodType} Employee Report` });
                doc.fontSize(11)
                    .font('Helvetica-Bold')
                    .text(`Period: ${(0, letterhead_util_1.formatDate)(startDate)} to ${(0, letterhead_util_1.formatDate)(endDate)}`, { align: 'center' });
                doc.moveDown(1.5);
                doc.fontSize(14)
                    .font('Helvetica-Bold')
                    .fillColor('#2E86AB')
                    .text('EMPLOYEE SUMMARY', { underline: true });
                doc.moveDown(0.8);
                await this.createTable(doc, {
                    headers: ['Metric', 'Value', 'Details'],
                    rows: [
                        ['Total Employees', totalEmployees.toString(), `${activeEmployees} active, ${totalEmployees - activeEmployees} inactive`],
                        ['Total Salary Expense', (0, letterhead_util_1.formatCurrency)(totalSalaryExpense), `${salaries.length} salary entries`],
                        ['Average Salary', (0, letterhead_util_1.formatCurrency)(avgSalary), 'Per employee'],
                        ['Active User Accounts', employees.filter(e => e.userId).length.toString(), 'Linked to system users'],
                    ],
                });
                doc.addPage();
                doc.fontSize(14)
                    .font('Helvetica-Bold')
                    .fillColor('#2E86AB')
                    .text(`EMPLOYEE DETAILS (${employees.length} Employees)`, { underline: true });
                doc.moveDown(0.8);
                const employeeRows = employees.map(emp => {
                    const empSalaries = salaries.filter(s => s.employeeId === emp.id);
                    const periodSalary = empSalaries.reduce((sum, s) => sum + s.netSalary, 0);
                    return [
                        emp.employeeId.substring(0, 8),
                        emp.name.substring(0, 15),
                        emp.designation.substring(0, 12),
                        (0, letterhead_util_1.formatCurrency)(emp.baseSalary),
                        (0, letterhead_util_1.formatCurrency)(periodSalary),
                        emp.isActive ? 'Active' : 'Inactive',
                        (0, letterhead_util_1.formatDate)(emp.joinDate),
                    ];
                });
                await this.createTable(doc, {
                    headers: ['Employee ID', 'Name', 'Designation', 'Base Salary', 'Total Cost', 'Status', 'Join Date'],
                    columnWidths: [60, 80, 70, 60, 60, 40, 60],
                    rows: employeeRows,
                });
                doc.end();
            }
            catch (error) {
                console.error('Error in generateEmployeeReport:', error);
                reject(error);
            }
        });
    }
    async generateExpenseReport(year, month) {
        return new Promise(async (resolve, reject) => {
            try {
                const { startDate, endDate, isMonthly } = this.getDateRange(year, month);
                const periodType = isMonthly ? 'Monthly' : 'Yearly';
                console.log(`Generating ${periodType} expense report`);
                const expenses = await this.prisma.expense.findMany({
                    where: {
                        expenseDate: { gte: startDate, lte: endDate },
                    },
                    select: {
                        id: true,
                        title: true,
                        amount: true,
                        category: true,
                        expenseDate: true,
                        paymentMethod: true,
                        status: true,
                        user: {
                            select: {
                                name: true,
                            },
                        },
                    },
                    orderBy: { expenseDate: 'desc' },
                });
                const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
                const expensesByCategory = expenses.reduce((acc, exp) => {
                    acc[exp.category] = acc[exp.category] || { total: 0, count: 0 };
                    acc[exp.category].total += exp.amount;
                    acc[exp.category].count++;
                    return acc;
                }, {});
                const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);
                (0, letterhead_util_1.addLetterhead)({ doc, title: `${periodType} Expense Report` });
                doc.fontSize(11)
                    .font('Helvetica-Bold')
                    .text(`Period: ${(0, letterhead_util_1.formatDate)(startDate)} to ${(0, letterhead_util_1.formatDate)(endDate)}`, { align: 'center' });
                doc.moveDown(1.5);
                doc.fontSize(14)
                    .font('Helvetica-Bold')
                    .fillColor('#2E86AB')
                    .text('EXPENSE SUMMARY', { underline: true });
                doc.moveDown(0.8);
                await this.createTable(doc, {
                    headers: ['Metric', 'Amount', 'Details'],
                    rows: [
                        ['Total Expenses', (0, letterhead_util_1.formatCurrency)(totalExpenses), `${expenses.length} transactions`],
                        ['Average Expense', (0, letterhead_util_1.formatCurrency)(expenses.length ? totalExpenses / expenses.length : 0), 'Per transaction'],
                        ['Daily Average', (0, letterhead_util_1.formatCurrency)(isMonthly ? totalExpenses / 30 : totalExpenses / 365), 'Per day estimate'],
                    ],
                });
                if (expenses.length > 0) {
                    doc.addPage();
                    doc.fontSize(14)
                        .font('Helvetica-Bold')
                        .fillColor('#2E86AB')
                        .text('EXPENSE ANALYSIS BY CATEGORY', { underline: true });
                    doc.moveDown(0.8);
                    const expenseRows = Object.entries(expensesByCategory)
                        .sort((a, b) => b[1].total - a[1].total)
                        .map(([category, data]) => {
                        const percentage = (data.total / totalExpenses) * 100;
                        return [
                            category,
                            (0, letterhead_util_1.formatCurrency)(data.total),
                            `${percentage.toFixed(1)}%`,
                            data.count.toString(),
                            (0, letterhead_util_1.formatCurrency)(data.total / data.count),
                        ];
                    });
                    await this.createTable(doc, {
                        headers: ['Category', 'Amount', '% of Total', 'Transactions', 'Avg Amount'],
                        rows: expenseRows,
                    });
                }
                doc.end();
            }
            catch (error) {
                console.error('Error in generateExpenseReport:', error);
                reject(error);
            }
        });
    }
    async generateAllReportsSummary(year, month) {
        return new Promise(async (resolve, reject) => {
            try {
                const { startDate, endDate, isMonthly } = this.getDateRange(year, month);
                const periodType = isMonthly ? 'Monthly' : 'Yearly';
                console.log(`Generating ${periodType} summary report`);
                const [bills, retailSales, expenses, inventory, employees] = await Promise.all([
                    this.prisma.bill.findMany({
                        where: { billDate: { gte: startDate, lte: endDate } },
                        select: { totalAmount: true, dueAmount: true },
                    }),
                    this.prisma.retailSale.findMany({
                        where: { saleDate: { gte: startDate, lte: endDate } },
                        select: { totalAmount: true },
                    }),
                    this.prisma.expense.findMany({
                        where: { expenseDate: { gte: startDate, lte: endDate } },
                        select: { amount: true },
                    }),
                    this.prisma.inventory.findMany({
                        select: { quantity: true, purchasePrice: true },
                    }),
                    this.prisma.employee.findMany({
                        where: { isActive: true },
                        select: { id: true },
                    }),
                ]);
                const totalRevenue = bills.reduce((s, b) => s + b.totalAmount, 0) +
                    retailSales.reduce((s, rs) => s + rs.totalAmount, 0);
                const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
                const totalOutstanding = bills.reduce((s, b) => s + b.dueAmount, 0);
                const totalInventoryValue = inventory.reduce((s, i) => s + (i.quantity * i.purchasePrice), 0);
                const profit = totalRevenue - totalExpenses;
                const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
                const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);
                (0, letterhead_util_1.addLetterhead)({ doc, title: `${periodType} Executive Summary` });
                doc.fontSize(11)
                    .font('Helvetica-Bold')
                    .text(`Comprehensive Business Report: ${(0, letterhead_util_1.formatDate)(startDate)} to ${(0, letterhead_util_1.formatDate)(endDate)}`, { align: 'center' })
                    .text(`Generated: ${(0, letterhead_util_1.formatDate)(new Date())}`, { align: 'center' });
                doc.moveDown(1.5);
                doc.fontSize(14)
                    .font('Helvetica-Bold')
                    .fillColor('#2E86AB')
                    .text('KEY PERFORMANCE INDICATORS', { align: 'center', underline: true });
                doc.moveDown(1);
                await this.createTable(doc, {
                    headers: ['Metric', 'Value', 'Status'],
                    rows: [
                        ['Total Revenue', (0, letterhead_util_1.formatCurrency)(totalRevenue), totalRevenue > 0 ? 'Good' : 'No Revenue'],
                        ['Total Expenses', (0, letterhead_util_1.formatCurrency)(totalExpenses), totalExpenses < totalRevenue ? 'Controlled' : 'High'],
                        ['Net Profit', (0, letterhead_util_1.formatCurrency)(profit), profit > 0 ? 'Profitable' : 'Loss'],
                        ['Profit Margin', `${profitMargin.toFixed(1)}%`, profitMargin > 15 ? 'Excellent' : profitMargin > 0 ? 'Moderate' : 'Poor'],
                        ['Outstanding', (0, letterhead_util_1.formatCurrency)(totalOutstanding), totalOutstanding > totalRevenue * 0.3 ? 'High Risk' : 'Manageable'],
                        ['Inventory Value', (0, letterhead_util_1.formatCurrency)(totalInventoryValue), 'Asset'],
                        ['Active Employees', employees.length.toString(), 'Staffed'],
                        ['Customer Bills', bills.length.toString(), 'Sales Activity'],
                    ],
                });
                doc.moveDown(2);
                doc.fontSize(11)
                    .font('Helvetica-Bold')
                    .fillColor('#333333')
                    .text('Executive Summary:', { underline: true });
                doc.fontSize(10)
                    .font('Helvetica')
                    .fillColor('#666666')
                    .text(`The business ${profit > 0 ? 'is profitable' : 'is operating at a loss'} with a ${profitMargin.toFixed(1)}% net margin. ` +
                    `Total revenue for the period is ${(0, letterhead_util_1.formatCurrency)(totalRevenue)} with ${(0, letterhead_util_1.formatCurrency)(totalOutstanding)} outstanding. ` +
                    `The company maintains ${inventory.length} inventory items valued at ${(0, letterhead_util_1.formatCurrency)(totalInventoryValue)} and has ${employees.length} active employees.`, { align: 'left', lineGap: 5 });
                doc.end();
            }
            catch (error) {
                console.error('Error in generateAllReportsSummary:', error);
                reject(error);
            }
        });
    }
    async generateReport(type, year, month) {
        switch (type) {
            case 'financial':
                return this.generateFinancialReport(year, month);
            case 'inventory':
                return this.generateInventoryReport(year, month);
            case 'investor':
                return this.generateInvestorReport(year, month);
            case 'sales':
                return this.generateSalesReport(year, month);
            case 'employee':
                return this.generateEmployeeReport(year, month);
            case 'expense':
                return this.generateExpenseReport(year, month);
            case 'summary':
                return this.generateAllReportsSummary(year, month);
            default:
                throw new Error(`Unknown report type: ${type}`);
        }
    }
};
exports.ReportPdfService = ReportPdfService;
exports.ReportPdfService = ReportPdfService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [report_service_1.ReportService,
        database_service_1.DatabaseService])
], ReportPdfService);
//# sourceMappingURL=report-pdf.service.js.map