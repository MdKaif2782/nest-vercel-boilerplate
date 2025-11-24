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
  DepartmentStatsDto,
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
    // Get last 6 months of sales data
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

    const colors = ['#4f46e5', '#10b981', '#f59e0b'];

    return [
      {
        channel: 'Corporate',
        amount: sales.corporateSales,
        percentage: total > 0 ? (sales.corporateSales / total) * 100 : 0,
        color: colors[0],
      },
      {
        channel: 'Retail',
        amount: sales.retailSales,
        percentage: total > 0 ? (sales.retailSales / total) * 100 : 0,
        color: colors[1],
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

    const billItems = await this.prisma.billItem.findMany({
      where: {
        bill: where,
      },
      include: {
        inventory: true,
        bill: true,
      },
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
      include: {
        inventory: true,
      },
    });

    const productSales = new Map();

    // Process bill items
    billItems.forEach(item => {
      const productName = item.inventory.productName;
      const sales = item.totalPrice;
      
      if (!productSales.has(productName)) {
        productSales.set(productName, {
          sales: 0,
          quantity: 0,
        });
      }
      
      const current = productSales.get(productName);
      productSales.set(productName, {
        sales: current.sales + sales,
        quantity: current.quantity + item.quantity,
      });
    });

    // Process retail items
    retailItems.forEach(item => {
      const productName = item.inventory.productName;
      const sales = item.totalPrice;
      
      if (!productSales.has(productName)) {
        productSales.set(productName, {
          sales: 0,
          quantity: 0,
        });
      }
      
      const current = productSales.get(productName);
      productSales.set(productName, {
        sales: current.sales + sales,
        quantity: current.quantity + item.quantity,
      });
    });

    return Array.from(productSales.entries())
      .sort((a, b) => b[1].sales - a[1].sales)
      .slice(0, 5)
      .map(([productName, data], index) => ({
        productName,
        sales: data.sales,
        quantity: data.quantity,
        growth: Math.random() * 20 - 5, // Mock growth for demo
      }));
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
    const inventory = await this.prisma.inventory.findMany();
    const lowStockItems = await this.prisma.inventory.findMany({
      where: {
        OR: [
          {
            minStockLevel: { not: null },
            quantity: { lt: this.prisma.inventory.fields.minStockLevel },
          },
          {
            minStockLevel: null,
            quantity: { lte: 10 },
          },
        ],
      },
    });

    const outOfStockItems = inventory.filter(item => item.quantity === 0);

    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
    const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

    // Mock category data - you might want to add category to your Inventory model
    const byCategory: InventoryCategoryDto[] = [
      { category: 'Electronics', value: totalValue * 0.4, percentage: 40, color: '#4f46e5' },
      { category: 'Office Supplies', value: totalValue * 0.3, percentage: 30, color: '#10b981' },
      { category: 'Furniture', value: totalValue * 0.2, percentage: 20, color: '#f59e0b' },
      { category: 'Others', value: totalValue * 0.1, percentage: 10, color: '#ef4444' },
    ];

    return {
      totalValue,
      totalItems,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      byCategory,
      turnoverRate: 2.5, // Mock turnover rate
    };
  }

  // ==================== RECEIVABLES SUMMARY ====================

  private async getReceivablesSummary(): Promise<ReceivablesSummaryDto> {
    const bills = await this.prisma.bill.findMany({
      include: {
        payments: true,
      },
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
      { name: '0-30 days', maxDays: 30, color: '#10b981' },
      { name: '31-60 days', maxDays: 60, color: '#f59e0b' },
      { name: '61-90 days', maxDays: 90, color: '#f97316' },
      { name: '90+ days', maxDays: Infinity, color: '#ef4444' },
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
      overdueAmount: buckets.slice(1).reduce((sum, bucket) => sum + bucket.amount, 0), // 31+ days
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
            purchaseOrder: true,
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

    // Mock ROI calculation
    const averageROI = 15.5; // This should be calculated based on actual returns

    const topPerformers: InvestorPerformanceDto[] = investors.slice(0, 3).map((investor, index) => {
      const investment = investor.investments.reduce((sum, inv) => sum + inv.investmentAmount, 0);
      const returns = investment * (1 + (Math.random() * 0.3)); // Mock returns
      const roi = ((returns - investment) / investment) * 100;

      const colors = ['#4f46e5', '#10b981', '#f59e0b'];
      
      return {
        investorName: investor.name,
        investment,
        returns,
        roi,
        color: colors[index],
      };
    });

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
    const categoryMap = new Map();
    expenses.forEach(expense => {
      const current = categoryMap.get(expense.category) || { amount: 0, count: 0 };
      categoryMap.set(expense.category, {
        amount: current.amount + expense.amount,
        count: current.count + 1,
      });
    });

    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];
    let colorIndex = 0;

    const byCategory: ExpenseCategoryDto[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
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
          expenseDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      const amount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

      // Calculate growth (simplified)
      const previousMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
      const previousEnd = new Date(date.getFullYear(), date.getMonth(), 0);
      
      const previousExpenses = await this.prisma.expense.findMany({
        where: {
          expenseDate: {
            gte: previousMonth,
            lte: previousEnd,
          },
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
    const employees = await this.prisma.employee.findMany({
      where: { isActive: true },
      include: {
        salaries: {
          where: {
            status: 'PAID',
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
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

    // Mock department data
    const byDepartment: DepartmentStatsDto[] = [
      { department: 'Sales', count: Math.floor(totalEmployees * 0.4), avgSalary: averageSalary * 1.2, color: '#4f46e5' },
      { department: 'Operations', count: Math.floor(totalEmployees * 0.3), avgSalary: averageSalary, color: '#10b981' },
      { department: 'Admin', count: Math.floor(totalEmployees * 0.2), avgSalary: averageSalary * 0.8, color: '#f59e0b' },
      { department: 'Management', count: Math.floor(totalEmployees * 0.1), avgSalary: averageSalary * 1.5, color: '#ef4444' },
    ];

    return {
      totalEmployees,
      activeEmployees,
      monthlySalary,
      averageSalary,
      byDepartment,
    };
  }

  // ==================== BUSINESS HEALTH ====================

  private async getBusinessHealth(range?: DateRangeDto): Promise<BusinessHealthDto> {
    const salesSummary = await this.getSalesSummary(range);
    const inventorySummary = await this.getInventoryOverview();
    const expenses = await this.getTotalExpenses(range);

    // Calculate health metrics
    const profitabilityIndex = expenses > 0 ? salesSummary.netProfit / expenses : 0;
    const operatingMargin = salesSummary.netMargin;
    const inventoryTurnover = inventorySummary.totalValue > 0 ? salesSummary.cogs / inventorySummary.totalValue : 0;
    
    // Mock ratios (these would require balance sheet data)
    const currentRatio = 1.8;
    const quickRatio = 1.2;
    const cashFlow = salesSummary.totalSales - expenses;

    // Calculate health score (0-100)
    let healthScore = 0;
    healthScore += Math.min(profitabilityIndex * 20, 20);
    healthScore += Math.min(operatingMargin / 5, 20);
    healthScore += Math.min(inventoryTurnover * 10, 20);
    healthScore += Math.min((currentRatio - 1) * 20, 20);
    healthScore += Math.min((quickRatio - 1) * 20, 20);
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

    // Get recent bills
    const recentBills = await this.prisma.bill.findMany({
      take: 3,
      orderBy: { billDate: 'desc' },
      include: { user: true },
    });

    recentBills.forEach(bill => {
      activities.push({
        id: bill.id,
        type: 'sale',
        description: `New corporate sale to ${bill.buyerPOId}`,
        amount: bill.totalAmount,
        timestamp: bill.billDate,
        user: bill.user?.name || 'System',
        icon: '💰',
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
        description: 'New retail sale completed',
        amount: sale.totalAmount,
        timestamp: sale.saleDate,
        user: 'POS System',
        icon: '🛒',
        color: '#10b981',
      });
    });

    // Get recent expenses
    const recentExpenses = await this.prisma.expense.findMany({
      take: 2,
      orderBy: { expenseDate: 'desc' },
      include: { user: true },
    });

    recentExpenses.forEach(expense => {
      activities.push({
        id: expense.id,
        type: 'expense',
        description: `Expense recorded: ${expense.title}`,
        amount: expense.amount,
        timestamp: expense.expenseDate,
        user: expense.user?.name || 'System',
        icon: '💸',
        color: '#ef4444',
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
        description: `New investment from ${inv.investor.name}`,
        amount: inv.investmentAmount,
        timestamp: inv.purchaseOrder.createdAt,
        user: inv.investor.name,
        icon: '📈',
        color: '#f59e0b',
      });
    });

    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 8);
  }

  // ==================== QUICK STATS ====================

  async getQuickStats(range?: DateRangeDto): Promise<QuickStatsDto> {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

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
        OR: [
          {
            minStockLevel: { not: null },
            quantity: { lt: this.prisma.inventory.fields.minStockLevel },
          },
          {
            minStockLevel: null,
            quantity: { lte: 10 },
          },
        ],
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

    const expenses = await this.prisma.expense.findMany({ where });
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
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
          label: 'Inventory Value',
          data: overview.byCategory.map(cat => cat.value),
          backgroundColor: overview.byCategory.map(cat => cat.color),
          borderWidth: 1,
        },
      ],
    };
  }
}