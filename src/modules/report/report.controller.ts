import { Controller, Get, Query, Param, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ReportService } from './report.service';
import { ReportPdfService } from './report-pdf.service';
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
  constructor(
    private readonly reportService: ReportService,
    private readonly reportPdfService: ReportPdfService,
  ) {}

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

  // ==================== PDF REPORTS ====================

  // In your controller
  @Get('pdf/:type')
  async generateReport(
    @Param('type') type: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Res() res?: Response,
  ) {
    try {
      const yearNum = year ? parseInt(year, 10) : undefined;
      const monthNum = month ? parseInt(month, 10) : undefined;

      const buffer = await this.reportPdfService.generateReport(
        type as any,
        yearNum,
        monthNum
      );
      
      const filename = `${type}-report-${yearNum || 'all'}-${monthNum || 'all'}.pdf`;
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length,
      });
      
      return res.send(buffer);
    } catch (error) {
      console.error('Error generating report:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to generate report',
        error: error.message,
      });
    }
  }
}
