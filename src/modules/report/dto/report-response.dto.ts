// Inventory Reports
export class InventorySummaryDto {
  totalItems: number;
  totalInventoryValue: number;
  totalExpectedSaleValue: number;
  averageStockValue: number;
  lowStockItemsCount: number;
}

export class CompanyStockDto {
  companyName: string;
  stockValue: number;
  itemCount: number;
  percentageOfTotal: number;
}

export class LowStockItemDto {
  id: string;
  productCode: string;
  productName: string;
  currentQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  purchasePrice: number;
  expectedSalePrice: number;
}

// Accounts Receivable Reports
export class CompanyReceivableDto {
  companyName: string;
  totalBilled: number;
  totalCollected: number;
  totalDue: number;
  collectionRate: number;
}

export class AgingBucketDto {
  bucket: string;
  amount: number;
  count: number;
  percentage: number;
}

export class ReceivableAgingDto {
  totalReceivable: number;
  agingBuckets: AgingBucketDto[];
}

export class BillingSummaryDto {
  totalBills: number;
  totalBilledAmount: number;
  totalCollected: number;
  totalDue: number;
  collectionRate: number;
  billsByStatus: {
    pending: number;
    partiallyPaid: number;
    paid: number;
    overdue: number;
  };
}

// Investor Reports
export class InvestorSummaryDto {
  investorId: string;
  investorName: string;
  totalInvestment: number;
  totalRevenue: number;
  totalCollected: number;
  totalProfitEarned: number;
  totalPaid: number;
  totalDue: number;
  payableNow: number;
  overallROI: number;
  activeInvestments: number;
}

export class InvestmentBreakdownDto {
  investmentId: string;
  poNumber: string;
  vendorName: string;
  investmentAmount: number;
  profitPercentage: number;
  totalRevenue: number;
  totalCollected: number;
  profitEarned: number;
  payableNow: number;
  roi: number;
  status: string;
}

// Expense Reports
export class ExpenseCategorySummaryDto {
  category: string;
  totalAmount: number;
  count: number;
  percentage: number;
}

export class PeriodicExpenseDto {
  period: string;
  totalAmount: number;
  count: number;
  categories: ExpenseCategorySummaryDto[];
}

// Sales Reports
export class SalesSummaryDto {
  totalSales: number;
  corporateSales: number;
  retailSales: number;
  cogs: number; // Cost of Goods Sold
  grossProfit: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
}

export class PeriodicSalesDto {
  period: string;
  totalSales: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
}

// Employee Reports
export class SalarySummaryDto {
  totalSalaryExpense: number;
  totalEmployees: number;
  activeEmployees: number;
  averageSalary: number;
}

export class MonthlySalaryDto {
  month: string;
  year: number;
  totalSalary: number;
  employeeCount: number;
  allowances: number;
  overtime: number;
  bonuses: number;
}

export class AllowanceBreakdownDto {
  category: string;
  totalAmount: number;
  percentage: number;
}

// Business Health Reports
export class BusinessHealthDto {
  profitabilityIndex: number;
  operatingMargin: number;
  inventoryTurnover: number;
  cashFlow: number;
  currentRatio: number;
  quickRatio: number;
}

export class CashFlowDto {
  operatingActivities: number;
  investingActivities: number;
  financingActivities: number;
  netCashFlow: number;
}

// Comprehensive Corporate Summary
export class CorporateSummaryDto {
  period: string;
  financials: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    totalAssets: number;
    totalLiabilities: number;
    equity: number;
  };
  sales: SalesSummaryDto;
  inventory: InventorySummaryDto;
  receivables: BillingSummaryDto;
  investors: {
    totalInvestment: number;
    totalDueToInvestors: number;
    investorCount: number;
  };
  expenses: {
    total: number;
    byCategory: ExpenseCategorySummaryDto[];
  };
  employees: SalarySummaryDto;
  health: BusinessHealthDto;
}