import { DateRangeDto, PeriodQueryDto } from './dto/report-query.dto';
import { InventorySummaryDto, CompanyStockDto, LowStockItemDto, CompanyReceivableDto, ReceivableAgingDto, BillingSummaryDto, InvestorSummaryDto, InvestmentBreakdownDto, ExpenseCategorySummaryDto, PeriodicExpenseDto, SalesSummaryDto, SalarySummaryDto, MonthlySalaryDto, BusinessHealthDto, CorporateSummaryDto } from './dto/report-response.dto';
import { DatabaseService } from '../database/database.service';
export declare class ReportService {
    private prisma;
    constructor(prisma: DatabaseService);
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
    getSalarySummary(): Promise<SalarySummaryDto>;
    getMonthlySalaries(query: PeriodQueryDto): Promise<MonthlySalaryDto[]>;
    getBusinessHealth(query: DateRangeDto): Promise<BusinessHealthDto>;
    getCorporateSummary(query: PeriodQueryDto): Promise<CorporateSummaryDto>;
}
