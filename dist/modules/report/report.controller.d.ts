import { Response } from 'express';
import { ReportService } from './report.service';
import { ReportPdfService } from './report-pdf.service';
import { DateRangeDto, PeriodQueryDto } from './dto/report-query.dto';
import { InventorySummaryDto, CompanyStockDto, LowStockItemDto, CompanyReceivableDto, ReceivableAgingDto, BillingSummaryDto, InvestorSummaryDto, InvestmentBreakdownDto, ExpenseCategorySummaryDto, PeriodicExpenseDto, SalesSummaryDto, PeriodicSalesDto, SalarySummaryDto, MonthlySalaryDto, BusinessHealthDto, CorporateSummaryDto } from './dto/report-response.dto';
export declare class ReportController {
    private readonly reportService;
    private readonly reportPdfService;
    constructor(reportService: ReportService, reportPdfService: ReportPdfService);
    getInventorySummary(): Promise<InventorySummaryDto>;
    getCompanyWiseStock(): Promise<CompanyStockDto[]>;
    getLowStockReport(): Promise<LowStockItemDto[]>;
    getCompanyReceivables(): Promise<CompanyReceivableDto[]>;
    getReceivableAging(): Promise<ReceivableAgingDto>;
    getBillingSummary(): Promise<BillingSummaryDto>;
    getInvestorSummary(): Promise<InvestorSummaryDto[]>;
    getInvestmentBreakdown(investorId: string): Promise<InvestmentBreakdownDto[]>;
    getExpenseByCategory(query: DateRangeDto): Promise<ExpenseCategorySummaryDto[]>;
    getPeriodicExpenses(query: PeriodQueryDto): Promise<PeriodicExpenseDto[]>;
    getSalesSummary(query: DateRangeDto): Promise<SalesSummaryDto>;
    getPeriodicSales(query: PeriodQueryDto): Promise<PeriodicSalesDto[]>;
    getSalarySummary(): Promise<SalarySummaryDto>;
    getMonthlySalaries(query: PeriodQueryDto): Promise<MonthlySalaryDto[]>;
    getBusinessHealth(query: DateRangeDto): Promise<BusinessHealthDto>;
    getCorporateSummary(query: PeriodQueryDto): Promise<CorporateSummaryDto>;
    getQuickStats(): Promise<{
        inventory: {
            totalItems: number;
            totalValue: number;
            lowStockItems: number;
        };
        receivables: {
            totalDue: number;
            collectionRate: number;
            totalBills: number;
        };
        sales: {
            totalSales: number;
            netProfit: number;
            profitMargin: number;
        };
        investors: {
            totalInvestment: number;
            totalDue: number;
            activeInvestors: number;
        };
        employees: {
            totalSalary: number;
            activeEmployees: number;
        };
    }>;
    generateReport(type: string, year?: string, month?: string, res?: Response): Promise<Response<any, Record<string, any>>>;
}
