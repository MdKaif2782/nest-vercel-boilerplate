import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { addLetterhead, formatCurrency, formatDate } from '../pdf/letterhead.util';
import { ReportService } from './report.service';
import { DatabaseService } from '../database/database.service';
import { Response } from 'express';

@Injectable()
export class ReportPdfService {
  constructor(
    private readonly reportService: ReportService,
    private readonly prisma: DatabaseService,
  ) {}

  private getDateRange(year?: number, month?: number): { startDate: Date; endDate: Date; isMonthly: boolean } {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;
    
    let startDate: Date;
    let endDate: Date;
    let isMonthly = false;

    if (month) {
      // Monthly report
      isMonthly = true;
      startDate = new Date(targetYear, targetMonth - 1, 1);
      endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);
    } else if (year) {
      // Yearly report
      startDate = new Date(targetYear, 0, 1);
      endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);
    } else {
      // Latest month report
      isMonthly = true;
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    return { startDate, endDate, isMonthly };
  }

  private async createTable(doc: PDFKit.PDFDocument, data: {
    title?: string;
    headers: string[];
    rows: string[][];
    columnWidths?: number[];
    startY?: number;
  }): Promise<number> {
    const { title, headers, rows, columnWidths, startY = doc.y } = data;
    
    const tableWidth = 500;
    const defaultColWidth = tableWidth / headers.length;
    const colWidths = columnWidths || Array(headers.length).fill(defaultColWidth);
    
    let yPosition = startY;

    if (title) {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333').text(title);
      yPosition = doc.y + 5;
    }

    // Draw headers
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

    // Draw rows
    doc.fontSize(8).font('Helvetica').fillColor('#000000');
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      
      // Check for page break
      if (yPosition > 750) {
        doc.addPage();
        yPosition = 50;
        
        // Redraw headers
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

      // Alternate row colors
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

  private async fetchFinancialData(startDate: Date, endDate: Date) {
    try {
      const [bills, retailSales, expenses, payments, purchaseOrders, investorPayments] = await Promise.all([
        // Bills with necessary relations only
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
        
        // Retail sales with necessary relations only
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
        
        // Expenses with minimal data
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
        
        // Payments with necessary relations
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
        
        // Purchase orders with minimal data
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
        
        // Investor payments
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
    } catch (error) {
      console.error('Error fetching financial data:', error);
      throw error;
    }
  }

  async generateFinancialReport(year?: number, month?: number): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const { startDate, endDate, isMonthly } = this.getDateRange(year, month);
        const periodType = isMonthly ? 'Monthly' : 'Yearly';
        
        console.log(`Generating ${periodType} financial report from ${startDate} to ${endDate}`);
        
        const data = await this.fetchFinancialData(startDate, endDate);
        const {
          bills,
          retailSales,
          expenses,
          payments,
          purchaseOrders,
          investorPayments
        } = data;

        // Calculate all metrics
        const totalBillAmount = bills.reduce((sum, b) => sum + b.totalAmount, 0);
        const totalRetailAmount = retailSales.reduce((sum, s) => sum + s.totalAmount, 0);
        const totalRevenue = totalBillAmount + totalRetailAmount;
        const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalPurchaseOrderAmount = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
        const totalInvestorPayments = investorPayments.reduce((sum, ip) => sum + ip.amount, 0);

        // Calculate COGS
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

        // Calculate outstanding
        const totalOutstanding = bills.reduce((sum, b) => sum + b.dueAmount, 0);

        const grossProfit = totalRevenue - totalCOGS;
        const netProfit = grossProfit - totalExpenseAmount;
        const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
        const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        // Cash Flow
        const cashInflow = totalPayments + totalRetailAmount;
        const cashOutflow = totalExpenseAmount + totalPurchaseOrderAmount + totalInvestorPayments;
        const netCashFlow = cashInflow - cashOutflow;

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          console.log('PDF generation completed');
          resolve(Buffer.concat(chunks));
        });
        doc.on('error', (err) => {
          console.error('PDF generation error:', err);
          reject(err);
        });

        // Add letterhead
        addLetterhead({ doc, title: `${periodType} Financial Report` });

        // Period
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .text(`${periodType} Period: ${formatDate(startDate)} to ${formatDate(endDate)}`, { align: 'center' });
        doc.moveDown(1.5);

        // Executive Summary
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#2E86AB')
           .text('EXECUTIVE SUMMARY', { underline: true });
        doc.moveDown(0.8);

        await this.createTable(doc, {
          headers: ['Metric', 'Amount', 'Details'],
          rows: [
            ['Total Revenue', formatCurrency(totalRevenue), `${bills.length} bills, ${retailSales.length} retail sales`],
            ['Cost of Goods Sold', formatCurrency(totalCOGS), `${totalRevenue > 0 ? ((totalCOGS/totalRevenue)*100).toFixed(1) : 0}% of revenue`],
            ['Gross Profit', formatCurrency(grossProfit), `${grossMargin.toFixed(1)}% margin`],
            ['Operating Expenses', formatCurrency(totalExpenseAmount), `${expenses.length} expense entries`],
            ['Net Profit', formatCurrency(netProfit), `${netMargin.toFixed(1)}% net margin`],
            ['Cash Inflow', formatCurrency(cashInflow), `Payments: ${formatCurrency(totalPayments)}, Retail: ${formatCurrency(totalRetailAmount)}`],
            ['Cash Outflow', formatCurrency(cashOutflow), `Expenses: ${formatCurrency(totalExpenseAmount)}, Purchases: ${formatCurrency(totalPurchaseOrderAmount)}`],
            ['Net Cash Flow', formatCurrency(netCashFlow), netCashFlow >= 0 ? 'Positive' : 'Negative'],
            ['Outstanding', formatCurrency(totalOutstanding), `${bills.filter(b => b.dueAmount > 0).length} unpaid bills`],
            ['Investor Payments', formatCurrency(totalInvestorPayments), `${investorPayments.length} payments made`],
          ],
        });

        // Add detailed sections
        await this.addDetailedSections(doc, data, periodType);

        doc.end();
      } catch (error) {
        console.error('Error in generateFinancialReport:', error);
        reject(error);
      }
    });
  }

  private async addDetailedSections(doc: PDFKit.PDFDocument, data: any, periodType: string) {
    const {
      bills,
      retailSales,
      expenses,
      payments,
    } = data;

    // Sales Breakdown
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
      formatCurrency(data.total),
      formatCurrency(data.paid),
      formatCurrency(data.due),
      formatCurrency(data.total / data.count),
    ]);

    if (customerRows.length > 0) {
      await this.createTable(doc, {
        title: 'Corporate Sales by Customer',
        headers: ['Customer', 'Bills', 'Total Amount', 'Paid', 'Due', 'Avg Bill'],
        rows: customerRows,
      });
    }

    // Expense Analysis by Category
    if (expenses.length > 0) {
      const expensesByCategory = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {});

      doc.moveDown(1);
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      
      const expenseRows = Object.entries(expensesByCategory)
        .sort((a: any, b: any) => b[1] - a[1])
        .map(([category, amount]) => {
          const count = expenses.filter(e => e.category === category).length;
          return [
            category,
            formatCurrency(amount as number),
            `${(((amount as number) / totalExpenses) * 100).toFixed(1)}%`,
            count.toString(),
          ];
        });

      await this.createTable(doc, {
        title: 'Expense Analysis by Category',
        headers: ['Category', 'Amount', '% of Total', 'Transactions'],
        rows: expenseRows,
      });
    }

    // Payment Collection Performance
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
        formatCurrency(amount as number),
        `${totalPaymentAmount > 0 ? (((amount as number) / totalPaymentAmount) * 100).toFixed(1) : 0}%`,
        count.toString(),
      ];
    });

    await this.createTable(doc, {
      headers: ['Payment Method', 'Amount', '% of Total', 'Transactions'],
      rows: paymentRows,
    });
  }

  async generateInventoryReport(year?: number, month?: number): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const { startDate, endDate, isMonthly } = this.getDateRange(year, month);
        const periodType = isMonthly ? 'Monthly' : 'Yearly';

        console.log(`Generating ${periodType} inventory report`);

        // Fetch inventory with minimal relations
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

        // Fetch movement data for the period if monthly report
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

          // Combine movement data
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

        // Calculate metrics
        const totalInventoryValue = inventory.reduce((sum, item) => 
          sum + (item.quantity * item.purchasePrice), 0);
        const totalExpectedValue = inventory.reduce((sum, item) => 
          sum + (item.quantity * item.expectedSalePrice), 0);
        
        const lowStockItems = inventory.filter(item => 
          item.minStockLevel && item.quantity <= item.minStockLevel);
        const outOfStockItems = inventory.filter(item => item.quantity === 0);
        
        // Calculate movement
        let totalUnitsSold = 0;
        movementData.forEach(data => {
          totalUnitsSold += data.billQty + data.retailQty;
        });

        const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        addLetterhead({ doc, title: `${periodType} Inventory Report` });

        doc.fontSize(11)
           .font('Helvetica-Bold')
           .text(`Report Period: ${formatDate(startDate)} to ${formatDate(endDate)}`, { align: 'center' })
           .text(`Generated: ${formatDate(new Date())}`, { align: 'center' });
        doc.moveDown(1.5);

        // Summary Section
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
            ['Inventory Value (Cost)', formatCurrency(totalInventoryValue), 'At purchase price'],
            ['Potential Sale Value', formatCurrency(totalExpectedValue), 'At expected sale price'],
            ['Potential Profit', formatCurrency(totalExpectedValue - totalInventoryValue), 'If all sold'],
            ['Low Stock Items', lowStockItems.length.toString(), 'Need attention'],
            ['Out of Stock Items', outOfStockItems.length.toString(), 'Urgent restock needed'],
            ['Units Sold (Period)', totalUnitsSold.toString(), `${periodType} movement`],
            ['Stock Turnover Ratio', inventory.length > 0 ? (totalUnitsSold / inventory.length).toFixed(2) : '0.00', 'Units sold per SKU'],
          ],
        });

        // Complete Inventory Listing
        doc.addPage();
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#2E86AB')
           .text(`COMPLETE INVENTORY LISTING (${inventory.length} Items)`, { underline: true });
        doc.moveDown(0.8);

        const inventoryRows = inventory.map(item => {
          let status = 'OK';
          if (item.quantity === 0) status = 'OUT';
          else if (item.minStockLevel && item.quantity <= item.minStockLevel) status = 'LOW';
          else if (item.maxStockLevel && item.quantity > item.maxStockLevel) status = 'HIGH';

          const movement = movementData.get(item.id);
          const soldQty = movement ? movement.billQty + movement.retailQty : 0;

          return [
            item.productCode.substring(0, 8),
            item.productName.substring(0, 25),
            item.purchaseOrder?.vendorName?.substring(0, 15) || 'N/A',
            `${item.quantity}${soldQty > 0 ? ` (-${soldQty})` : ''}`,
            `${item.minStockLevel || 'N/A'}/${item.maxStockLevel || 'N/A'}`,
            formatCurrency(item.purchasePrice),
            formatCurrency(item.expectedSalePrice),
            formatCurrency(item.quantity * item.purchasePrice),
            status,
          ];
        });

        await this.createTable(doc, {
          headers: ['Code', 'Product Name', 'Supplier', 'Stock', 'Min/Max', 'Cost', 'Sale Price', 'Value', 'Status'],
          columnWidths: [60, 120, 80, 50, 60, 60, 60, 70, 50],
          rows: inventoryRows,
        });

        doc.end();
      } catch (error) {
        console.error('Error in generateInventoryReport:', error);
        reject(error);
      }
    });
  }

  async generateInvestorReport(year?: number, month?: number): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const { startDate, endDate, isMonthly } = this.getDateRange(year, month);
        const periodType = isMonthly ? 'Monthly' : 'Yearly';

        console.log(`Generating ${periodType} investor report`);

        // Fetch investors with their investments
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

        // Calculate investor summaries
        const investorSummaries = investors.map(investor => {
          const totalInvestment = investor.investments.reduce((sum, inv) => 
            sum + inv.investmentAmount, 0);
          
          // Filter period investments
          const periodInvestments = isMonthly ? 
            investor.investments.filter(inv => 
              inv.purchaseOrder.createdAt >= startDate && 
              inv.purchaseOrder.createdAt <= endDate
            ) : investor.investments;
          
          const periodInvestment = periodInvestments.reduce((sum, inv) => 
            sum + inv.investmentAmount, 0);
          
          const periodPayments = investor.investorPayments.reduce((sum, p) => 
            sum + p.amount, 0);
          
          // Calculate returns based on profit percentage
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

        const totalPeriodInvestment = investorSummaries.reduce((sum, inv) => 
          sum + inv.periodInvestment, 0);
        const totalPeriodReturns = investorSummaries.reduce((sum, inv) => 
          sum + inv.periodReturns, 0);
        const totalPeriodPayments = investorSummaries.reduce((sum, inv) => 
          sum + inv.periodPayments, 0);

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        addLetterhead({ doc, title: `${periodType} Investor Report` });

        doc.fontSize(11)
           .font('Helvetica-Bold')
           .text(`Period: ${formatDate(startDate)} to ${formatDate(endDate)}`, { align: 'center' })
           .text(`${investors.length} Active Investors | ${investors.reduce((sum, i) => sum + i.investments.length, 0)} Total Investments`, { align: 'center' });
        doc.moveDown(1.5);

        // Executive Summary
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#2E86AB')
           .text('INVESTOR PERFORMANCE SUMMARY', { underline: true });
        doc.moveDown(0.8);

        await this.createTable(doc, {
          headers: ['Metric', 'Amount', 'Details'],
          rows: [
            ['Total Active Investors', investors.length.toString(), `${investors.filter(i => i.isActive).length} active`],
            ['Period Investment', formatCurrency(totalPeriodInvestment), `${investors.reduce((sum, i) => sum + i.investments.length, 0)} investments`],
            ['Period Returns Generated', formatCurrency(totalPeriodReturns), 'From inventory sales'],
            ['Period Payments Made', formatCurrency(totalPeriodPayments), `${investors.reduce((sum, i) => sum + i.investorPayments.length, 0)} payments`],
            ['Total Investment to Date', formatCurrency(investorSummaries.reduce((sum, i) => sum + i.totalInvestment, 0)), 'All time'],
            ['Total Returns to Date', formatCurrency(investorSummaries.reduce((sum, i) => sum + i.totalReturns, 0)), 'All time'],
            ['Total Paid to Investors', formatCurrency(investorSummaries.reduce((sum, i) => sum + i.totalPaid, 0)), 'All time'],
            ['Total Due to Investors', formatCurrency(investorSummaries.reduce((sum, i) => sum + i.totalDue, 0)), 'Outstanding'],
            ['Average ROI (Period)', investorSummaries.length > 0 ? `${(investorSummaries.reduce((sum, i) => sum + i.periodROI, 0) / investorSummaries.length).toFixed(2)}%` : '0%', 'Weighted average'],
          ],
        });

        // Detailed Investor Breakdown
        doc.addPage();
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#2E86AB')
           .text(`INVESTOR DETAILS (${investorSummaries.length} Investors)`, { underline: true });
        doc.moveDown(0.8);

        const investorRows = investorSummaries.map(inv => [
          inv.investorName.substring(0, 15),
          formatCurrency(inv.totalInvestment),
          formatCurrency(inv.periodInvestment),
          formatCurrency(inv.totalReturns),
          formatCurrency(inv.periodReturns),
          formatCurrency(inv.totalPaid),
          formatCurrency(inv.totalDue),
          `${inv.overallROI.toFixed(1)}%`,
          inv.isActive ? 'Active' : 'Inactive'
        ]);

        await this.createTable(doc, {
          headers: ['Investor', 'Total Inv.', 'Period Inv.', 'Total Returns', 'Period Returns', 'Paid', 'Due', 'ROI%', 'Status'],
          columnWidths: [80, 60, 60, 60, 60, 50, 50, 40, 40],
          rows: investorRows,
        });

        doc.end();
      } catch (error) {
        console.error('Error in generateInvestorReport:', error);
        reject(error);
      }
    });
  }

  async generateSalesReport(year?: number, month?: number): Promise<Buffer> {
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

        // Calculate metrics
        const totalBillAmount = bills.reduce((sum, b) => sum + b.totalAmount, 0);
        const totalRetailAmount = retailSales.reduce((sum, s) => sum + s.totalAmount, 0);
        const totalRevenue = totalBillAmount + totalRetailAmount;
        const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalOutstanding = bills.reduce((sum, b) => sum + b.dueAmount, 0);
        
        // Calculate COGS and Profit
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

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        addLetterhead({ doc, title: `${periodType} Sales Performance Report` });

        doc.fontSize(11)
           .font('Helvetica-Bold')
           .text(`Period: ${formatDate(startDate)} to ${formatDate(endDate)}`, { align: 'center' });
        doc.moveDown(1.5);

        // Sales Performance Summary
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#2E86AB')
           .text('SALES PERFORMANCE SUMMARY', { underline: true });
        doc.moveDown(0.8);

        await this.createTable(doc, {
          headers: ['Metric', 'Corporate', 'Retail', 'Total', 'Performance'],
          rows: [
            ['Revenue', formatCurrency(totalBillAmount), formatCurrency(totalRetailAmount), formatCurrency(totalRevenue), `${bills.length} bills, ${retailSales.length} sales`],
            ['Cost of Sales', formatCurrency(totalCOGS * (totalBillAmount/totalRevenue || 0)), formatCurrency(totalCOGS * (totalRetailAmount/totalRevenue || 0)), formatCurrency(totalCOGS), `${grossMargin.toFixed(1)}% gross margin`],
            ['Gross Profit', formatCurrency(totalProfit * (totalBillAmount/totalRevenue || 0)), formatCurrency(totalProfit * (totalRetailAmount/totalRevenue || 0)), formatCurrency(totalProfit), `${totalRevenue > 0 ? ((totalProfit/totalRevenue)*100).toFixed(1) : 0}% margin`],
            ['Payments', formatCurrency(totalPayments), 'N/A', formatCurrency(totalPayments), `${collectionRate.toFixed(1)}% collection rate`],
            ['Outstanding', formatCurrency(totalOutstanding), 'N/A', formatCurrency(totalOutstanding), `${bills.filter(b => b.dueAmount > 0).length} unpaid bills`],
            ['Avg Bill/Sale', formatCurrency(bills.length ? totalBillAmount/bills.length : 0), formatCurrency(retailSales.length ? totalRetailAmount/retailSales.length : 0), formatCurrency((bills.length + retailSales.length) > 0 ? totalRevenue/(bills.length + retailSales.length) : 0), 'Average transaction value'],
          ],
        });

        doc.end();
      } catch (error) {
        console.error('Error in generateSalesReport:', error);
        reject(error);
      }
    });
  }

  async generateEmployeeReport(year?: number, month?: number): Promise<Buffer> {
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

        // Calculate metrics
        const totalEmployees = employees.length;
        const activeEmployees = employees.filter(e => e.isActive).length;
        const totalSalaryExpense = salaries.reduce((sum, s) => sum + s.netSalary, 0);
        const avgSalary = totalEmployees > 0 ? totalSalaryExpense / totalEmployees : 0;

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        addLetterhead({ doc, title: `${periodType} Employee Report` });

        doc.fontSize(11)
           .font('Helvetica-Bold')
           .text(`Period: ${formatDate(startDate)} to ${formatDate(endDate)}`, { align: 'center' });
        doc.moveDown(1.5);

        // Employee Summary
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#2E86AB')
           .text('EMPLOYEE SUMMARY', { underline: true });
        doc.moveDown(0.8);

        await this.createTable(doc, {
          headers: ['Metric', 'Value', 'Details'],
          rows: [
            ['Total Employees', totalEmployees.toString(), `${activeEmployees} active, ${totalEmployees - activeEmployees} inactive`],
            ['Total Salary Expense', formatCurrency(totalSalaryExpense), `${salaries.length} salary entries`],
            ['Average Salary', formatCurrency(avgSalary), 'Per employee'],
            ['Active User Accounts', employees.filter(e => e.userId).length.toString(), 'Linked to system users'],
          ],
        });

        // Employee Details
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
            formatCurrency(emp.baseSalary),
            formatCurrency(periodSalary),
            emp.isActive ? 'Active' : 'Inactive',
            formatDate(emp.joinDate),
          ];
        });

        await this.createTable(doc, {
          headers: ['Employee ID', 'Name', 'Designation', 'Base Salary', 'Total Cost', 'Status', 'Join Date'],
          columnWidths: [60, 80, 70, 60, 60, 40, 60],
          rows: employeeRows,
        });

        doc.end();
      } catch (error) {
        console.error('Error in generateEmployeeReport:', error);
        reject(error);
      }
    });
  }

  async generateExpenseReport(year?: number, month?: number): Promise<Buffer> {
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

        // Calculate metrics
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

        // Group by category
        const expensesByCategory = expenses.reduce((acc, exp) => {
          acc[exp.category] = acc[exp.category] || { total: 0, count: 0 };
          acc[exp.category].total += exp.amount;
          acc[exp.category].count++;
          return acc;
        }, {} as Record<string, any>);

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        addLetterhead({ doc, title: `${periodType} Expense Report` });

        doc.fontSize(11)
           .font('Helvetica-Bold')
           .text(`Period: ${formatDate(startDate)} to ${formatDate(endDate)}`, { align: 'center' });
        doc.moveDown(1.5);

        // Expense Summary
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#2E86AB')
           .text('EXPENSE SUMMARY', { underline: true });
        doc.moveDown(0.8);

        await this.createTable(doc, {
          headers: ['Metric', 'Amount', 'Details'],
          rows: [
            ['Total Expenses', formatCurrency(totalExpenses), `${expenses.length} transactions`],
            ['Average Expense', formatCurrency(expenses.length ? totalExpenses / expenses.length : 0), 'Per transaction'],
            ['Daily Average', formatCurrency(isMonthly ? totalExpenses / 30 : totalExpenses / 365), 'Per day estimate'],
          ],
        });

        // Expense Analysis by Category
        if (expenses.length > 0) {
          doc.addPage();
          doc.fontSize(14)
             .font('Helvetica-Bold')
             .fillColor('#2E86AB')
             .text('EXPENSE ANALYSIS BY CATEGORY', { underline: true });
          doc.moveDown(0.8);

          const expenseRows = Object.entries(expensesByCategory)
            .sort((a: any, b: any) => b[1].total - a[1].total)
            .map(([category, data]) => {
              const percentage = (data.total / totalExpenses) * 100;
              return [
                category,
                formatCurrency(data.total),
                `${percentage.toFixed(1)}%`,
                data.count.toString(),
                formatCurrency(data.total / data.count),
              ];
            });

          await this.createTable(doc, {
            headers: ['Category', 'Amount', '% of Total', 'Transactions', 'Avg Amount'],
            rows: expenseRows,
          });
        }

        doc.end();
      } catch (error) {
        console.error('Error in generateExpenseReport:', error);
        reject(error);
      }
    });
  }

  async generateAllReportsSummary(year?: number, month?: number): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const { startDate, endDate, isMonthly } = this.getDateRange(year, month);
        const periodType = isMonthly ? 'Monthly' : 'Yearly';

        console.log(`Generating ${periodType} summary report`);

        // Fetch only essential data
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

        // Calculate key metrics
        const totalRevenue = bills.reduce((s, b) => s + b.totalAmount, 0) + 
                           retailSales.reduce((s, rs) => s + rs.totalAmount, 0);
        const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
        const totalOutstanding = bills.reduce((s, b) => s + b.dueAmount, 0);
        const totalInventoryValue = inventory.reduce((s, i) => s + (i.quantity * i.purchasePrice), 0);
        
        const profit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        addLetterhead({ doc, title: `${periodType} Executive Summary` });

        doc.fontSize(11)
           .font('Helvetica-Bold')
           .text(`Comprehensive Business Report: ${formatDate(startDate)} to ${formatDate(endDate)}`, { align: 'center' })
           .text(`Generated: ${formatDate(new Date())}`, { align: 'center' });
        doc.moveDown(1.5);

        // KPI Dashboard
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#2E86AB')
           .text('KEY PERFORMANCE INDICATORS', { align: 'center', underline: true });
        doc.moveDown(1);

        await this.createTable(doc, {
          headers: ['Metric', 'Value', 'Status'],
          rows: [
            ['Total Revenue', formatCurrency(totalRevenue), totalRevenue > 0 ? 'Good' : 'No Revenue'],
            ['Total Expenses', formatCurrency(totalExpenses), totalExpenses < totalRevenue ? 'Controlled' : 'High'],
            ['Net Profit', formatCurrency(profit), profit > 0 ? 'Profitable' : 'Loss'],
            ['Profit Margin', `${profitMargin.toFixed(1)}%`, profitMargin > 15 ? 'Excellent' : profitMargin > 0 ? 'Moderate' : 'Poor'],
            ['Outstanding', formatCurrency(totalOutstanding), totalOutstanding > totalRevenue * 0.3 ? 'High Risk' : 'Manageable'],
            ['Inventory Value', formatCurrency(totalInventoryValue), 'Asset'],
            ['Active Employees', employees.length.toString(), 'Staffed'],
            ['Customer Bills', bills.length.toString(), 'Sales Activity'],
          ],
        });

        // Summary Statement
        doc.moveDown(2);
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor('#333333')
           .text('Executive Summary:', { underline: true });
        
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#666666')
           .text(`The business ${profit > 0 ? 'is profitable' : 'is operating at a loss'} with a ${profitMargin.toFixed(1)}% net margin. ` +
                 `Total revenue for the period is ${formatCurrency(totalRevenue)} with ${formatCurrency(totalOutstanding)} outstanding. ` +
                 `The company maintains ${inventory.length} inventory items valued at ${formatCurrency(totalInventoryValue)} and has ${employees.length} active employees.`,
                 { align: 'left', lineGap: 5 });

        doc.end();
      } catch (error) {
        console.error('Error in generateAllReportsSummary:', error);
        reject(error);
      }
    });
  }

  // Helper method to generate specific reports
  async generateReport(type: 'financial' | 'inventory' | 'investor' | 'sales' | 'employee' | 'expense' | 'summary', 
                      year?: number, month?: number): Promise<Buffer> {
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
}