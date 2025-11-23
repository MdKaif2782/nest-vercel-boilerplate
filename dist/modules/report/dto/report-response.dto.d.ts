export declare class InventorySummaryDto {
    totalItems: number;
    totalInventoryValue: number;
    totalExpectedSaleValue: number;
    averageStockValue: number;
    lowStockItemsCount: number;
}
export declare class CompanyStockDto {
    companyName: string;
    stockValue: number;
    itemCount: number;
    percentageOfTotal: number;
}
export declare class LowStockItemDto {
    id: string;
    productCode: string;
    productName: string;
    currentQuantity: number;
    minStockLevel: number;
    maxStockLevel: number;
    purchasePrice: number;
    expectedSalePrice: number;
}
export declare class CompanyReceivableDto {
    companyName: string;
    totalBilled: number;
    totalCollected: number;
    totalDue: number;
    collectionRate: number;
}
export declare class AgingBucketDto {
    bucket: string;
    amount: number;
    count: number;
    percentage: number;
}
export declare class ReceivableAgingDto {
    totalReceivable: number;
    agingBuckets: AgingBucketDto[];
}
export declare class BillingSummaryDto {
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
export declare class InvestorSummaryDto {
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
export declare class InvestmentBreakdownDto {
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
export declare class ExpenseCategorySummaryDto {
    category: string;
    totalAmount: number;
    count: number;
    percentage: number;
}
export declare class PeriodicExpenseDto {
    period: string;
    totalAmount: number;
    count: number;
    categories: ExpenseCategorySummaryDto[];
}
export declare class SalesSummaryDto {
    totalSales: number;
    corporateSales: number;
    retailSales: number;
    cogs: number;
    grossProfit: number;
    netProfit: number;
    grossMargin: number;
    netMargin: number;
}
export declare class PeriodicSalesDto {
    period: string;
    totalSales: number;
    cogs: number;
    grossProfit: number;
    expenses: number;
    netProfit: number;
}
export declare class SalarySummaryDto {
    totalSalaryExpense: number;
    totalEmployees: number;
    activeEmployees: number;
    averageSalary: number;
}
export declare class MonthlySalaryDto {
    month: string;
    year: number;
    totalSalary: number;
    employeeCount: number;
    allowances: number;
    overtime: number;
    bonuses: number;
}
export declare class AllowanceBreakdownDto {
    category: string;
    totalAmount: number;
    percentage: number;
}
export declare class BusinessHealthDto {
    profitabilityIndex: number;
    operatingMargin: number;
    inventoryTurnover: number;
    cashFlow: number;
    currentRatio: number;
    quickRatio: number;
}
export declare class CashFlowDto {
    operatingActivities: number;
    investingActivities: number;
    financingActivities: number;
    netCashFlow: number;
}
export declare class CorporateSummaryDto {
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
