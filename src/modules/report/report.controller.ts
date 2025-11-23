import { Controller, Get, Query, Param } from '@nestjs/common';
import { ReportService } from './report.service';
import { DateRangeDto, PeriodQueryDto, PaginationQueryDto } from './dto/report-query.dto';
import {
  InventorySummaryDto,
  CompanyStockDto,
  LowStockItemDto,
  CompanyReceivableDto,
  ReceivableAgingDto,
  BillingSummaryDto,
  InvestorSummaryDto,
  InvestmentBreakdownDto,
  ExpenseCategorySummaryDto,
  PeriodicExpenseDto,
  SalesSummaryDto,
  PeriodicSalesDto,
  SalarySummaryDto,
  MonthlySalaryDto,
  BusinessHealthDto,
  CorporateSummaryDto,
} from './dto/report-response.dto';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // ==================== INVENTORY REPORTS ====================

  @Get('inventory/summary')
  async getInventorySummary(): Promise<InventorySummaryDto> {
    return this.reportService.getInventorySummary();
  }

  @Get('inventory/company-stock')
  async getCompanyWiseStock(): Promise<CompanyStockDto[]> {
    return this.reportService.getCompanyWiseStock();
  }

  @Get('inventory/low-stock')
  async getLowStockReport(): Promise<LowStockItemDto[]> {
    return this.reportService.getLowStockReport();
  }

  // ==================== ACCOUNTS RECEIVABLE REPORTS ====================

  @Get('receivable/company-wise')
  async getCompanyReceivables(): Promise<CompanyReceivableDto[]> {
    return this.reportService.getCompanyReceivables();
  }

  @Get('receivable/aging')
  async getReceivableAging(): Promise<ReceivableAgingDto> {
    return this.reportService.getReceivableAging();
  }

  @Get('billing/summary')
  async getBillingSummary(): Promise<BillingSummaryDto> {
    return this.reportService.getBillingSummary();
  }

  // ==================== INVESTOR REPORTS ====================

  @Get('investors/summary')
  async getInvestorSummary(): Promise<InvestorSummaryDto[]> {
    return this.reportService.getInvestorSummary();
  }

  @Get('investors/:id/breakdown')
  async getInvestmentBreakdown(@Param('id') investorId: string): Promise<InvestmentBreakdownDto[]> {
    return this.reportService.getInvestmentBreakdown(investorId);
  }

  // ==================== EXPENSE REPORTS ====================

  @Get('expenses/by-category')
  async getExpenseByCategory(@Query() query: DateRangeDto): Promise<ExpenseCategorySummaryDto[]> {
    return this.reportService.getExpenseByCategory(query);
  }

  @Get('expenses/periodic')
  async getPeriodicExpenses(@Query() query: PeriodQueryDto): Promise<PeriodicExpenseDto[]> {
    return this.reportService.getPeriodicExpenses(query);
  }

  // ==================== SALES REPORTS ====================

  @Get('sales/summary')
  async getSalesSummary(@Query() query: DateRangeDto): Promise<SalesSummaryDto> {
    return this.reportService.getSalesSummary(query);
  }

  @Get('sales/periodic')
  async getPeriodicSales(@Query() query: PeriodQueryDto): Promise<PeriodicSalesDto[]> {
    // Implementation similar to periodic expenses
    return []; // Placeholder
  }

  // ==================== EMPLOYEE REPORTS ====================

  @Get('employees/salary-summary')
  async getSalarySummary(): Promise<SalarySummaryDto> {
    return this.reportService.getSalarySummary();
  }

  @Get('employees/monthly-salaries')
  async getMonthlySalaries(@Query() query: PeriodQueryDto): Promise<MonthlySalaryDto[]> {
    return this.reportService.getMonthlySalaries(query);
  }

  // ==================== BUSINESS HEALTH REPORTS ====================

  @Get('business-health')
  async getBusinessHealth(@Query() query: DateRangeDto): Promise<BusinessHealthDto> {
    return this.reportService.getBusinessHealth(query);
  }

  // ==================== COMPREHENSIVE CORPORATE SUMMARY ====================

  @Get('corporate-summary')
  async getCorporateSummary(@Query() query: PeriodQueryDto): Promise<CorporateSummaryDto> {
    return this.reportService.getCorporateSummary(query);
  }

  // ==================== DASHBOARD QUICK STATS ====================

  @Get('dashboard/quick-stats')
  async getQuickStats() {
    const [
      inventorySummary,
      billingSummary,
      salesSummary,
      salarySummary,
      investorSummary,
    ] = await Promise.all([
      this.reportService.getInventorySummary(),
      this.reportService.getBillingSummary(),
      this.reportService.getSalesSummary({}),
      this.reportService.getSalarySummary(),
      this.reportService.getInvestorSummary(),
    ]);

    const totalDueToInvestors = investorSummary.reduce((sum, investor) => sum + investor.totalDue, 0);

    return {
      inventory: {
        totalItems: inventorySummary.totalItems,
        totalValue: inventorySummary.totalInventoryValue,
        lowStockItems: inventorySummary.lowStockItemsCount,
      },
      receivables: {
        totalDue: billingSummary.totalDue,
        collectionRate: billingSummary.collectionRate,
        totalBills: billingSummary.totalBills,
      },
      sales: {
        totalSales: salesSummary.totalSales,
        netProfit: salesSummary.netProfit,
        profitMargin: salesSummary.netMargin,
      },
      investors: {
        totalInvestment: investorSummary.reduce((sum, inv) => sum + inv.totalInvestment, 0),
        totalDue: totalDueToInvestors,
        activeInvestors: investorSummary.filter(inv => inv.activeInvestments > 0).length,
      },
      employees: {
        totalSalary: salarySummary.totalSalaryExpense,
        activeEmployees: salarySummary.activeEmployees,
      },
    };
  }
}