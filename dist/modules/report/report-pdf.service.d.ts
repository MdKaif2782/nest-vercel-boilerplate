import { ReportService } from './report.service';
import { DatabaseService } from '../database/database.service';
export declare class ReportPdfService {
    private readonly reportService;
    private readonly prisma;
    constructor(reportService: ReportService, prisma: DatabaseService);
    private getDateRange;
    private createTable;
    private fetchFinancialData;
    generateFinancialReport(year?: number, month?: number): Promise<Buffer>;
    private addDetailedSections;
    generateInventoryReport(year?: number, month?: number): Promise<Buffer>;
    generateInvestorReport(year?: number, month?: number): Promise<Buffer>;
    generateSalesReport(year?: number, month?: number): Promise<Buffer>;
    generateEmployeeReport(year?: number, month?: number): Promise<Buffer>;
    generateExpenseReport(year?: number, month?: number): Promise<Buffer>;
    generateAllReportsSummary(year?: number, month?: number): Promise<Buffer>;
    generateReport(type: 'financial' | 'inventory' | 'investor' | 'sales' | 'employee' | 'expense' | 'summary', year?: number, month?: number): Promise<Buffer>;
}
