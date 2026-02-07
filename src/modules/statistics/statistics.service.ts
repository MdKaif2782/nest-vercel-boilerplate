import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  DashboardStatsDto,
  FinancialSummaryDto,
  SalesAnalyticsDto,
  InventoryOverviewDto,
  ReceivablesSummaryDto,
  InvestorMetricsDto,
  ExpenseBreakdownDto,
  EmployeeStatsDto,
  BusinessHealthDto,
  ActivityLogDto,
  QuickStatsDto,
  PeriodicSalesDataDto,
  SalesChannelDto,
  TopProductDto,
  InventoryCategoryDto,
  AgingBucketDto,
  InvestorPerformanceDto,
  ExpenseCategoryDto,
  MonthlyExpenseDto,
  DesignationStatsDto,
  ChartDataDto,
  DateRangeDto,
} from './dto';
import { ReportService } from '../report/report.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: DatabaseService) {}

  // ==================== DASHBOARD STATISTICS ====================

  async getDashboardStats(range?: DateRangeDto): Promise<DashboardStatsDto> {
    const [
      financialSummary,
      salesAnalytics,
      inventoryOverview,
      receivablesSummary,
      investorMetrics,
      expenseBreakdown,
      employeeStats,
      businessHealth,
      recentActivities,
      quickStats,
    ] = await Promise.all([
      this.getFinancialSummary(range),
      this.getSalesAnalytics(range),
      this.getInventoryOverview(),
      this.getReceivablesSummary(),
      this.getInvestorMetrics(),
      this.getExpenseBreakdown(range),
      this.getEmployeeStats(),
      this.getBusinessHealth(range),
      this.getRecentActivities(),
      this.getQuickStats(range),
    ]);

    return {
      financialSummary,
      salesAnalytics,
      inventoryOverview,
      receivablesSummary,
      investorMetrics,
      expenseBreakdown,
      employeeStats,
      businessHealth,
      recentActivities,
      quickStats,
    };
  }

  // ==================== FINANCIAL SUMMARY ====================

  private async getFinancialSummary(range?: DateRangeDto): Promise<FinancialSummaryDto> {
    const currentSales = await this.getSalesSummary(range);
    const previousRange = this.getPreviousPeriod(range);
    const previousSales = await this.getSalesSummary(previousRange);

    const currentExpenses = await this.getTotalExpenses(range);
    const previousExpenses = await this.getTotalExpenses(previousRange);

    const revenueGrowth = previousSales.totalSales > 0
      ? ((currentSales.totalSales - previousSales.totalSales) / previousSales.totalSales) * 100
      : 0;

    const expenseGrowth = previousExpenses > 0
      ? ((currentExpenses - previousExpenses) / previousExpenses) * 100
      : 0;

    return {
      totalRevenue: currentSales.totalSales,
      totalExpenses: currentExpenses,
      netProfit: currentSales.netProfit,
      grossProfit: currentSales.grossProfit,
      profitMargin: currentSales.netMargin,
      revenueGrowth,
      expenseGrowth,
    };
  }

  // ==================== SALES ANALYTICS ====================

  private async getSalesAnalytics(range?: DateRangeDto): Promise<SalesAnalyticsDto> {
    const monthlySales = await this.getMonthlySalesData(range);
    const byChannel = await this.getSalesByChannel(range);
    const topProducts = await this.getTopProducts(range);
    const salesTrend = await this.getSalesTrend();

    return {
      monthlySales,
      byChannel,
      topProducts,
      salesTrend,
    };
  }

  private async getMonthlySalesData(range?: DateRangeDto): Promise<PeriodicSalesDataDto[]> {
    const months = 6;
    const monthlyData: PeriodicSalesDataDto[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthRange: DateRangeDto = {
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0],
      };

      const sales = await this.getSalesSummary(monthRange);
      const previousMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
      const previousEnd = new Date(date.getFullYear(), date.getMonth(), 0);

      const previousRange: DateRangeDto = {
        startDate: previousMonth.toISOString().split('T')[0],
        endDate: previousEnd.toISOString().split('T')[0],
      };

      const previousSales = await this.getSalesSummary(previousRange);
      const growth = previousSales.totalSales > 0
        ? ((sales.totalSales - previousSales.totalSales) / previousSales.totalSales) * 100
        : 0;

      monthlyData.push({
        period: startOfMonth.toLocaleString('default', { month: 'short', year: 'numeric' }),
        corporateSales: sales.corporateSales,
        retailSales: sales.retailSales,
        totalSales: sales.totalSales,
        growth,
      });
    }

    return monthlyData;
  }

  private async getSalesByChannel(range?: DateRangeDto): Promise<SalesChannelDto[]> {
    const sales = await this.getSalesSummary(range);
    const total = sales.totalSales;

    return [
      {
        channel: 'Corporate',
        amount: sales.corporateSales,
        percentage: total > 0 ? (sales.corporateSales / total) * 100 : 0,
        color: '#4f46e5',
      },
      {
        channel: 'Retail',
        amount: sales.retailSales,
        percentage: total > 0 ? (sales.retailSales / total) * 100 : 0,
        color: '#10b981',
      },
    ];
  }

  private async getTopProducts(range?: DateRangeDto): Promise<TopProductDto[]> {
    const where: any = {};
    if (range?.startDate && range?.endDate) {
      where.billDate = {
        gte: new Date(range.startDate),
        lte: new Date(range.endDate),
      };
    }

    // Current period data
    const billItems = await this.prisma.billItem.findMany({
      where: { bill: where },
      include: { inventory: true, bill: true },
    });

    const retailItems = await this.prisma.retailSaleItem.findMany({
      where: {
        retailSale: range?.startDate && range?.endDate ? {
          saleDate: {
            gte: new Date(range.startDate),
            lte: new Date(range.endDate),
          },
        } : undefined,
      },
      include: { inventory: true },
    });

    // Previous period data for real growth calculation
    const prevRange = this.getPreviousPeriod(range);
    const prevWhere: any = {};
    if (prevRange?.startDate && prevRange?.endDate) {
      prevWhere.billDate = {
        gte: new Date(prevRange.startDate),
        lte: new Date(prevRange.endDate),
      };
    }

    const prevBillItems = await this.prisma.billItem.findMany({
      where: { bill: prevWhere },
      include: { inventory: true },
    });

    const prevRetailItems = await this.prisma.retailSaleItem.findMany({
      where: {
        retailSale: prevRange?.startDate && prevRange?.endDate ? {
          saleDate: {
            gte: new Date(prevRange.startDate),
            lte: new Date(prevRange.endDate),
          },
        } : undefined,
      },
      include: { inventory: true },
    });

    // Build previous period sales map
    const prevProductSales = new Map<string, number>();
    prevBillItems.forEach(item => {
      const name = item.inventory.productName;
      prevProductSales.set(name, (prevProductSales.get(name) || 0) + item.totalPrice);
    });
    prevRetailItems.forEach(item => {
      const name = item.inventory.productName;
      prevProductSales.set(name, (prevProductSales.get(name) || 0) + item.totalPrice);
    });

    // Build current period sales map
    const productSales = new Map<string, { sales: number; quantity: number }>();

    billItems.forEach(item => {
      const productName = item.inventory.productName;
      if (!productSales.has(productName)) {
        productSales.set(productName, { sales: 0, quantity: 0 });
      }
      const current = productSales.get(productName)!;
      productSales.set(productName, {
        sales: current.sales + item.totalPrice,
        quantity: current.quantity + item.quantity,
      });
    });

    retailItems.forEach(item => {
      const productName = item.inventory.productName;
      if (!productSales.has(productName)) {
        productSales.set(productName, { sales: 0, quantity: 0 });
      }
      const current = productSales.get(productName)!;
      productSales.set(productName, {
        sales: current.sales + item.totalPrice,
        quantity: current.quantity + item.quantity,
      });
    });

    return Array.from(productSales.entries())
      .sort((a, b) => b[1].sales - a[1].sales)
      .slice(0, 5)
      .map(([productName, data]) => {
        const prevSales = prevProductSales.get(productName) || 0;
        const growth = prevSales > 0 ? ((data.sales - prevSales) / prevSales) * 100 : 0;
        return {
          productName,
          sales: data.sales,
          quantity: data.quantity,
          growth: Number(growth.toFixed(1)),
        };
      });
  }

  private async getSalesTrend(): Promise<'up' | 'down' | 'stable'> {
    const currentMonth = new Date();
    const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);

    const currentRange: DateRangeDto = {
      startDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0],
    };

    const previousRange: DateRangeDto = {
      startDate: new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0).toISOString().split('T')[0],
    };

    const currentSales = await this.getSalesSummary(currentRange);
    const previousSales = await this.getSalesSummary(previousRange);

    const difference = currentSales.totalSales - previousSales.totalSales;
    const percentageChange = previousSales.totalSales > 0 ? (difference / previousSales.totalSales) * 100 : 0;

    if (percentageChange > 5) return 'up';
    if (percentageChange < -5) return 'down';
    return 'stable';
  }

  // ==================== INVENTORY OVERVIEW ====================

  private async getInventoryOverview(): Promise<InventoryOverviewDto> {
    const inventory = await this.prisma.inventory.findMany({
      include: {
        purchaseOrder: {
          select: { vendorName: true },
        },
      },
    });

    const outOfStockItems = inventory.filter(item => item.quantity === 0);
    const lowStockItems = inventory.filter(item => {
      if (item.minStockLevel !== null) return item.quantity > 0 && item.quantity < item.minStockLevel;
      return item.quantity > 0 && item.quantity <= 10;
    });

    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
    const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

    // Group by vendor (real data instead of hardcoded categories)
    const vendorMap = new Map<string, number>();
    inventory.forEach(item => {
      const vendor = item.purchaseOrder?.vendorName || 'Unknown';
      vendorMap.set(vendor, (vendorMap.get(vendor) || 0) + (item.quantity * item.purchasePrice));
    });

    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];
    let colorIndex = 0;

    const byCategory: InventoryCategoryDto[] = Array.from(vendorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([vendor, value]) => ({
        category: vendor,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
        color: colors[colorIndex++ % colors.length],
      }));

    // Calculate real turnover rate: COGS / average inventory value
    const currentYear = new Date().getFullYear();
    const billItems = await this.prisma.billItem.findMany({
      where: {
        bill: {
          billDate: {
            gte: new Date(currentYear, 0, 1),
            lte: new Date(currentYear, 11, 31),
          },
        },
      },
      include: { inventory: true },
    });
    const retailItems = await this.prisma.retailSaleItem.findMany({
      where: {
        retailSale: {
          saleDate: {
            gte: new Date(currentYear, 0, 1),
            lte: new Date(currentYear, 11, 31),
          },
        },
      },
      include: { inventory: true },
    });

    const cogs = billItems.reduce((sum, item) => sum + (item.quantity * item.inventory.purchasePrice), 0)
               + retailItems.reduce((sum, item) => sum + (item.quantity * item.inventory.purchasePrice), 0);
    const turnoverRate = totalValue > 0 ? Number((cogs / totalValue).toFixed(2)) : 0;

    return {
      totalValue,
      totalItems,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      byCategory,
      turnoverRate,
    };
  }

  // ==================== RECEIVABLES SUMMARY ====================

  private async getReceivablesSummary(): Promise<ReceivablesSummaryDto> {
    const bills = await this.prisma.bill.findMany({
      include: { payments: true },
    });

    const totalReceivable = bills.reduce((sum, bill) => sum + bill.dueAmount, 0);
    const totalCollected = bills.reduce((sum, bill) =>
      sum + bill.payments.reduce((pSum, payment) => pSum + payment.amount, 0), 0
    );
    const totalBilled = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const collectionRate = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

    // Aging buckets
    const now = new Date();
    const agingBuckets = [
      { name: '0-30 days', minDays: 0, maxDays: 30, color: '#10b981' },
      { name: '31-60 days', minDays: 31, maxDays: 60, color: '#f59e0b' },
      { name: '61-90 days', minDays: 61, maxDays: 90, color: '#f97316' },
      { name: '90+ days', minDays: 91, maxDays: Infinity, color: '#ef4444' },
    ];

    const buckets: AgingBucketDto[] = agingBuckets.map((bucket) => {
      const bucketBills = bills.filter((bill) => {
        if (bill.dueAmount <= 0) return false;
        const billDate = new Date(bill.billDate);
        const daysDiff = Math.floor((now.getTime() - billDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff >= bucket.minDays && daysDiff <= bucket.maxDays;
      });

      const amount = bucketBills.reduce((sum, bill) => sum + bill.dueAmount, 0);
      return {
        bucket: bucket.name,
        amount,
        count: bucketBills.length,
        percentage: totalReceivable > 0 ? (amount / totalReceivable) * 100 : 0,
        color: bucket.color,
      };
    });

    const thisMonth = new Date();
    const startOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    const collectedThisMonth = bills.reduce((sum, bill) => {
      const monthPayments = bill.payments.filter(p =>
        new Date(p.paymentDate) >= startOfMonth
      ).reduce((pSum, payment) => pSum + payment.amount, 0);
      return sum + monthPayments;
    }, 0);

    return {
      totalReceivable,
      collectedThisMonth,
      overdueAmount: buckets.filter(b => b.bucket !== '0-30 days').reduce((sum, bucket) => sum + bucket.amount, 0),
      collectionRate,
      agingBuckets: buckets,
    };
  }

  // ==================== INVESTOR METRICS ====================

  private async getInvestorMetrics(): Promise<InvestorMetricsDto> {
    const investors = await this.prisma.investor.findMany({
      include: {
        investments: {
          include: {
            purchaseOrder: {
              include: {
                inventory: {
                  include: {
                    billItems: true,
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

    const totalInvestment = investors.reduce((sum, investor) =>
      sum + investor.investments.reduce((iSum, inv) => iSum + inv.investmentAmount, 0), 0
    );

    const totalPayouts = investors.reduce((sum, investor) =>
      sum + investor.investorPayments.reduce((pSum, payment) => pSum + payment.amount, 0), 0
    );

    const activeInvestors = investors.filter(inv =>
      inv.investments.some(i => i.purchaseOrder.status !== 'CANCELLED')
    ).length;

    // Calculate real ROI for each investor
    const investorPerformance = investors
      .filter(inv => inv.investments.length > 0)
      .map((investor) => {
        const investment = investor.investments.reduce((sum, inv) => sum + inv.investmentAmount, 0);

        // Calculate revenue from sales of invested POs
        let totalRevenue = 0;
        investor.investments.forEach(inv => {
          const profitPercent = inv.profitPercentage / 100;
          inv.purchaseOrder.inventory.forEach(item => {
            const billRevenue = item.billItems.reduce((s, bi) => s + bi.totalPrice, 0);
            const retailRevenue = item.retailItems.reduce((s, ri) => s + ri.totalPrice, 0);
            totalRevenue += (billRevenue + retailRevenue) * profitPercent;
          });
        });

        const roi = investment > 0 ? ((totalRevenue - investment) / investment) * 100 : 0;

        return {
          investorName: investor.name,
          investment,
          returns: totalRevenue,
          roi: Number(roi.toFixed(2)),
        };
      })
      .sort((a, b) => b.returns - a.returns);

    const averageROI = investorPerformance.length > 0
      ? Number((investorPerformance.reduce((sum, p) => sum + p.roi, 0) / investorPerformance.length).toFixed(2))
      : 0;

    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const topPerformers: InvestorPerformanceDto[] = investorPerformance.slice(0, 5).map((p, index) => ({
      ...p,
      color: colors[index % colors.length],
    }));

    return {
      totalInvestment,
      activeInvestors,
      totalPayouts,
      averageROI,
      topPerformers,
    };
  }

  // ==================== EXPENSE BREAKDOWN ====================

  private async getExpenseBreakdown(range?: DateRangeDto): Promise<ExpenseBreakdownDto> {
    const where: any = {};
    if (range?.startDate && range?.endDate) {
      where.expenseDate = {
        gte: new Date(range.startDate),
        lte: new Date(range.endDate),
      };
    }

    const expenses = await this.prisma.expense.findMany({ where });

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Group by category
    const categoryMap = new Map<string, { amount: number; count: number }>();
    expenses.forEach(expense => {
      const current = categoryMap.get(expense.category) || { amount: 0, count: 0 };
      categoryMap.set(expense.category, {
        amount: current.amount + expense.amount,
        count: current.count + 1,
      });
    });

    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#a855f7', '#f43f5e', '#84cc16', '#6366f1', '#22d3ee', '#fb923c'];
    let colorIndex = 0;

    const byCategory: ExpenseCategoryDto[] = Array.from(categoryMap.entries())
      .sort((a, b) => b[1].amount - a[1].amount)
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
        color: colors[colorIndex++ % colors.length],
      }));

    const monthlyTrend = await this.getMonthlyExpenseTrend(range);

    return {
      totalExpenses,
      byCategory,
      monthlyTrend,
    };
  }

  private async getMonthlyExpenseTrend(range?: DateRangeDto): Promise<MonthlyExpenseDto[]> {
    const months = 6;
    const monthlyData: MonthlyExpenseDto[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const expenses = await this.prisma.expense.findMany({
        where: {
          expenseDate: { gte: startOfMonth, lte: endOfMonth },
        },
      });

      const amount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

      const previousMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
      const previousEnd = new Date(date.getFullYear(), date.getMonth(), 0);

      const previousExpenses = await this.prisma.expense.findMany({
        where: {
          expenseDate: { gte: previousMonth, lte: previousEnd },
        },
      });

      const previousAmount = previousExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const growth = previousAmount > 0 ? ((amount - previousAmount) / previousAmount) * 100 : 0;

      monthlyData.push({
        month: startOfMonth.toLocaleString('default', { month: 'short' }),
        amount,
        growth,
      });
    }

    return monthlyData;
  }

  // ==================== EMPLOYEE STATS ====================

  private async getEmployeeStats(): Promise<EmployeeStatsDto> {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const employees = await this.prisma.employee.findMany({
      where: { isActive: true },
      include: {
        salaries: {
          where: {
            status: 'PAID',
            month: currentMonth,
            year: currentYear,
          },
        },
      },
    });

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.isActive).length;

    const monthlySalary = employees.reduce((sum, emp) => {
      const currentSalary = emp.salaries[0]?.netSalary || emp.baseSalary;
      return sum + currentSalary;
    }, 0);

    const averageSalary = totalEmployees > 0 ? monthlySalary / totalEmployees : 0;

    // Advance outstanding from real data
    const advanceAgg = await this.prisma.employee.aggregate({
      where: { isActive: true },
      _sum: { advanceBalance: true },
    });
    const totalAdvanceOutstanding = advanceAgg._sum.advanceBalance || 0;

    // Total salary paid this year
    const paidSalariesYTD = await this.prisma.salary.aggregate({
      where: {
        status: 'PAID',
        year: currentYear,
      },
      _sum: { netSalary: true },
    });
    const totalSalaryPaidThisYear = paidSalariesYTD._sum.netSalary || 0;

    // Real designation grouping (replaces hardcoded departments)
    const designationMap = new Map<string, { count: number; totalSalary: number }>();
    employees.forEach(emp => {
      const designation = emp.designation || 'Unspecified';
      const current = designationMap.get(designation) || { count: 0, totalSalary: 0 };
      designationMap.set(designation, {
        count: current.count + 1,
        totalSalary: current.totalSalary + emp.baseSalary,
      });
    });

    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];
    let colorIndex = 0;

    const byDesignation: DesignationStatsDto[] = Array.from(designationMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .map(([designation, data]) => ({
        designation,
        count: data.count,
        avgSalary: data.count > 0 ? data.totalSalary / data.count : 0,
        color: colors[colorIndex++ % colors.length],
      }));

    return {
      totalEmployees,
      activeEmployees,
      monthlySalary,
      averageSalary,
      totalAdvanceOutstanding,
      totalSalaryPaidThisYear,
      byDesignation,
    };
  }

  // ==================== BUSINESS HEALTH ====================

  private async getBusinessHealth(range?: DateRangeDto): Promise<BusinessHealthDto> {
    const salesSummary = await this.getSalesSummary(range);
    const inventorySummary = await this.getInventoryOverview();
    const expenses = await this.getTotalExpenses(range);

    // Calculate health metrics from real data
    const profitabilityIndex = expenses > 0 ? salesSummary.netProfit / expenses : 0;
    const operatingMargin = salesSummary.netMargin;
    const inventoryTurnover = inventorySummary.totalValue > 0 ? salesSummary.cogs / inventorySummary.totalValue : 0;

    // Calculate current ratio from real data: current assets / current liabilities
    const totalReceivable = (await this.prisma.bill.aggregate({
      _sum: { dueAmount: true },
    }))._sum.dueAmount || 0;

    const totalPayable = (await this.prisma.purchaseOrder.aggregate({
      _sum: { dueAmount: true },
    }))._sum.dueAmount || 0;

    // Pending salaries as payables
    const pendingSalaries = await this.prisma.salary.aggregate({
      where: { status: 'PENDING' },
      _sum: { grossSalary: true },
    });
    const salaryPayable = pendingSalaries._sum.grossSalary || 0;

    const totalCurrentLiabilities = totalPayable + salaryPayable;
    const totalCurrentAssets = totalReceivable + inventorySummary.totalValue;

    const currentRatio = totalCurrentLiabilities > 0 ? Number((totalCurrentAssets / totalCurrentLiabilities).toFixed(2)) : 0;
    const quickRatio = totalCurrentLiabilities > 0 ? Number((totalReceivable / totalCurrentLiabilities).toFixed(2)) : 0;
    const cashFlow = salesSummary.totalSales - expenses;

    // Calculate health score (0-100)
    let healthScore = 0;
    healthScore += Math.min(profitabilityIndex * 20, 20);
    healthScore += Math.min(operatingMargin / 5, 20);
    healthScore += Math.min(inventoryTurnover * 10, 20);
    healthScore += Math.min((currentRatio > 0 ? currentRatio - 1 : 0) * 20, 20);
    healthScore += Math.min((quickRatio > 0 ? quickRatio : 0) * 20, 20);
    healthScore = Math.max(0, Math.min(100, healthScore));

    let status: 'excellent' | 'good' | 'fair' | 'poor';
    if (healthScore >= 80) status = 'excellent';
    else if (healthScore >= 60) status = 'good';
    else if (healthScore >= 40) status = 'fair';
    else status = 'poor';

    return {
      profitabilityIndex,
      operatingMargin,
      inventoryTurnover,
      currentRatio,
      quickRatio,
      cashFlow,
      healthScore,
      status,
    };
  }

  // ==================== RECENT ACTIVITIES ====================

  private async getRecentActivities(): Promise<ActivityLogDto[]> {
    const activities: ActivityLogDto[] = [];

    // Get recent bills (corporate sales)
    const recentBills = await this.prisma.bill.findMany({
      take: 3,
      orderBy: { billDate: 'desc' },
      include: {
        user: true,
        buyerPO: {
          include: {
            quotation: { select: { companyName: true } },
          },
        },
      },
    });

    recentBills.forEach(bill => {
      activities.push({
        id: bill.id,
        type: 'sale',
        description: `Corporate sale to ${bill.buyerPO?.quotation?.companyName || 'customer'} - Bill #${bill.billNumber}`,
        amount: bill.totalAmount,
        timestamp: bill.billDate,
        user: bill.user?.name || 'System',
        icon: '\uD83D\uDCB0',
        color: '#10b981',
      });
    });

    // Get recent retail sales
    const recentRetail = await this.prisma.retailSale.findMany({
      take: 2,
      orderBy: { saleDate: 'desc' },
    });

    recentRetail.forEach(sale => {
      activities.push({
        id: sale.id,
        type: 'sale',
        description: `Retail sale #${sale.saleNumber} - ${sale.customerName || 'Walk-in customer'}`,
        amount: sale.totalAmount,
        timestamp: sale.saleDate,
        user: 'POS System',
        icon: '\uD83D\uDED2',
        color: '#10b981',
      });
    });

    // Get recent expenses (manual ones)
    const recentExpenses = await this.prisma.expense.findMany({
      take: 2,
      where: { isAutoGenerated: false },
      orderBy: { expenseDate: 'desc' },
      include: { user: true },
    });

    recentExpenses.forEach(expense => {
      activities.push({
        id: expense.id,
        type: 'expense',
        description: `Expense: ${expense.title}`,
        amount: expense.amount,
        timestamp: expense.expenseDate,
        user: expense.user?.name || 'System',
        icon: '\uD83D\uDCB8',
        color: '#ef4444',
      });
    });

    // Get recent salary payments
    const recentSalaryPayments = await this.prisma.salary.findMany({
      take: 2,
      where: { status: 'PAID' },
      orderBy: { paidDate: 'desc' },
      include: {
        employee: { select: { name: true, employeeId: true } },
      },
    });

    recentSalaryPayments.forEach(salary => {
      activities.push({
        id: salary.id,
        type: 'expense',
        description: `Salary paid to ${salary.employee.name} - ${this.getMonthName(salary.month)} ${salary.year}`,
        amount: salary.netSalary,
        timestamp: salary.paidDate || new Date(),
        user: 'Payroll',
        icon: '\uD83D\uDCB5',
        color: '#f97316',
      });
    });

    // Get recent investor payments
    const recentInvestorPayments = await this.prisma.investorPayment.findMany({
      take: 2,
      orderBy: { paymentDate: 'desc' },
      include: {
        investor: { select: { name: true } },
      },
    });

    recentInvestorPayments.forEach(payment => {
      activities.push({
        id: payment.id,
        type: 'payment',
        description: `Investor payment to ${payment.investor.name}`,
        amount: payment.amount,
        timestamp: payment.paymentDate,
        user: payment.investor.name,
        icon: '\uD83D\uDCCA',
        color: '#8b5cf6',
      });
    });

    // Get recent PO payments
    const recentPOPayments = await this.prisma.purchaseOrderPayment.findMany({
      take: 2,
      orderBy: { paymentDate: 'desc' },
      include: {
        purchaseOrder: { select: { poNumber: true, vendorName: true } },
      },
    });

    recentPOPayments.forEach(payment => {
      activities.push({
        id: payment.id,
        type: 'purchase',
        description: `PO payment for ${payment.purchaseOrder.poNumber} - ${payment.purchaseOrder.vendorName}`,
        amount: payment.amount,
        timestamp: payment.paymentDate,
        user: 'Procurement',
        icon: '\uD83D\uDCE6',
        color: '#f59e0b',
      });
    });

    // Get recent investments
    const recentInvestments = await this.prisma.purchaseOrderInvestment.findMany({
      take: 2,
      orderBy: { purchaseOrder: { createdAt: 'desc' } },
      include: { investor: true, purchaseOrder: true },
    });

    recentInvestments.forEach(inv => {
      activities.push({
        id: inv.id,
        type: 'investment',
        description: `Investment from ${inv.investor.name} in PO ${inv.purchaseOrder.poNumber}`,
        amount: inv.investmentAmount,
        timestamp: inv.purchaseOrder.createdAt,
        user: inv.investor.name,
        icon: '\uD83D\uDCC8',
        color: '#4f46e5',
      });
    });

    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
  }

  // ==================== QUICK STATS ====================

  async getQuickStats(range?: DateRangeDto): Promise<QuickStatsDto> {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todaySales = await this.getSalesSummary({
      startDate: startOfToday.toISOString().split('T')[0],
      endDate: endOfToday.toISOString().split('T')[0],
    });

    const weekSales = await this.getSalesSummary({
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: endOfToday.toISOString().split('T')[0],
    });

    const monthSales = await this.getSalesSummary({
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfToday.toISOString().split('T')[0],
    });

    const pendingOrders = await this.prisma.purchaseOrder.count({
      where: { status: 'PENDING' },
    });

    const unpaidBills = await this.prisma.bill.count({
      where: { status: { in: ['PENDING', 'PARTIALLY_PAID'] } },
    });

    const lowStockItems = await this.prisma.inventory.count({
      where: {
        quantity: { lte: 10 },
      },
    });

    const activeInvestments = await this.prisma.purchaseOrderInvestment.count({
      where: {
        purchaseOrder: {
          status: { not: 'CANCELLED' },
        },
      },
    });

    return {
      todaySales: todaySales.totalSales,
      weekSales: weekSales.totalSales,
      monthSales: monthSales.totalSales,
      pendingOrders,
      unpaidBills,
      lowStockAlerts: lowStockItems,
      activeInvestments,
    };
  }

  // ==================== HELPER METHODS ====================

  private async getSalesSummary(range?: DateRangeDto) {
    const reportService = new ReportService(this.prisma);
    return reportService.getSalesSummary(range);
  }

  private async getTotalExpenses(range?: DateRangeDto): Promise<number> {
    const where: any = {};
    if (range?.startDate && range?.endDate) {
      where.expenseDate = {
        gte: new Date(range.startDate),
        lte: new Date(range.endDate),
      };
    }

    const result = await this.prisma.expense.aggregate({
      where,
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  private getPreviousPeriod(range?: DateRangeDto): DateRangeDto {
    if (!range?.startDate || !range?.endDate) {
      const end = new Date();
      const start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    }

    const start = new Date(range.startDate);
    const end = new Date(range.endDate);
    const duration = end.getTime() - start.getTime();

    return {
      startDate: new Date(start.getTime() - duration).toISOString().split('T')[0],
      endDate: new Date(end.getTime() - duration).toISOString().split('T')[0],
    };
  }

  private getMonthName(month: number): string {
    const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month] || '';
  }

  // ==================== CHART DATA METHODS ====================

  async getSalesChartData(range?: DateRangeDto): Promise<ChartDataDto> {
    const monthlyData = await this.getMonthlySalesData(range);

    return {
      labels: monthlyData.map(data => data.period),
      datasets: [
        {
          label: 'Corporate Sales',
          data: monthlyData.map(data => data.corporateSales),
          backgroundColor: '#4f46e5',
          borderColor: '#4f46e5',
          borderWidth: 2,
        },
        {
          label: 'Retail Sales',
          data: monthlyData.map(data => data.retailSales),
          backgroundColor: '#10b981',
          borderColor: '#10b981',
          borderWidth: 2,
        },
      ],
    };
  }

  async getExpenseChartData(range?: DateRangeDto): Promise<ChartDataDto> {
    const breakdown = await this.getExpenseBreakdown(range);

    return {
      labels: breakdown.byCategory.map(cat => cat.category),
      datasets: [
        {
          label: 'Expenses by Category',
          data: breakdown.byCategory.map(cat => cat.amount),
          backgroundColor: breakdown.byCategory.map(cat => cat.color),
          borderWidth: 1,
        },
      ],
    };
  }

  async getInventoryChartData(): Promise<ChartDataDto> {
    const overview = await this.getInventoryOverview();

    return {
      labels: overview.byCategory.map(cat => cat.category),
      datasets: [
        {
          label: 'Inventory Value by Vendor',
          data: overview.byCategory.map(cat => cat.value),
          backgroundColor: overview.byCategory.map(cat => cat.color),
          borderWidth: 1,
        },
      ],
    };
  }
}
