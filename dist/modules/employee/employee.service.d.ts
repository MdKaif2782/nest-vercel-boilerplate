import { CreateEmployeeDto, UpdateEmployeeDto, CreateSalaryDto, PaySalaryDto, GiveAdvanceDto, AdjustAdvanceDto } from './dto';
import { DatabaseService } from '../database/database.service';
export declare class EmployeeService {
    private prisma;
    constructor(prisma: DatabaseService);
    private getSystemUserId;
    private generateEmployeeId;
    create(createEmployeeDto: CreateEmployeeDto): Promise<{
        name: string;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        isActive: boolean;
        designation: string;
        joinDate: Date;
        baseSalary: number;
        homeRentAllowance: number;
        healthAllowance: number;
        travelAllowance: number;
        mobileAllowance: number;
        otherAllowances: number;
        overtimeRate: number | null;
        userId: string | null;
        employeeId: string;
        advanceBalance: number;
    }>;
    findAll(): Promise<({
        user: {
            name: string;
            email: string;
        };
        salaries: {
            id: string;
            status: import(".prisma/client").$Enums.SalaryStatus;
            notes: string | null;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
            reference: string | null;
            baseSalary: number;
            employeeId: string;
            month: number;
            year: number;
            overtimeHours: number | null;
            bonus: number | null;
            deductions: number | null;
            paidDate: Date | null;
            advanceDeduction: number;
            allowances: number;
            overtimeAmount: number | null;
            grossSalary: number;
            netSalary: number;
        }[];
    } & {
        name: string;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        isActive: boolean;
        designation: string;
        joinDate: Date;
        baseSalary: number;
        homeRentAllowance: number;
        healthAllowance: number;
        travelAllowance: number;
        mobileAllowance: number;
        otherAllowances: number;
        overtimeRate: number | null;
        userId: string | null;
        employeeId: string;
        advanceBalance: number;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            name: string;
            email: string;
        };
        salaries: {
            id: string;
            status: import(".prisma/client").$Enums.SalaryStatus;
            notes: string | null;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
            reference: string | null;
            baseSalary: number;
            employeeId: string;
            month: number;
            year: number;
            overtimeHours: number | null;
            bonus: number | null;
            deductions: number | null;
            paidDate: Date | null;
            advanceDeduction: number;
            allowances: number;
            overtimeAmount: number | null;
            grossSalary: number;
            netSalary: number;
        }[];
        advances: {
            id: string;
            createdAt: Date;
            description: string | null;
            amount: number;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
            reference: string | null;
            type: import(".prisma/client").$Enums.AdvanceType;
            salaryId: string | null;
            employeeId: string;
            balanceAfter: number;
        }[];
    } & {
        name: string;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        isActive: boolean;
        designation: string;
        joinDate: Date;
        baseSalary: number;
        homeRentAllowance: number;
        healthAllowance: number;
        travelAllowance: number;
        mobileAllowance: number;
        otherAllowances: number;
        overtimeRate: number | null;
        userId: string | null;
        employeeId: string;
        advanceBalance: number;
    }>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<{
        name: string;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        isActive: boolean;
        designation: string;
        joinDate: Date;
        baseSalary: number;
        homeRentAllowance: number;
        healthAllowance: number;
        travelAllowance: number;
        mobileAllowance: number;
        otherAllowances: number;
        overtimeRate: number | null;
        userId: string | null;
        employeeId: string;
        advanceBalance: number;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        isActive: boolean;
        designation: string;
        joinDate: Date;
        baseSalary: number;
        homeRentAllowance: number;
        healthAllowance: number;
        travelAllowance: number;
        mobileAllowance: number;
        otherAllowances: number;
        overtimeRate: number | null;
        userId: string | null;
        employeeId: string;
        advanceBalance: number;
    }>;
    giveAdvance(employeeId: string, dto: GiveAdvanceDto): Promise<{
        success: boolean;
        advance: {
            id: string;
            createdAt: Date;
            description: string | null;
            amount: number;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
            reference: string | null;
            type: import(".prisma/client").$Enums.AdvanceType;
            salaryId: string | null;
            employeeId: string;
            balanceAfter: number;
        };
        employee: {
            id: string;
            name: string;
            previousBalance: number;
            newBalance: number;
        };
    }>;
    adjustAdvance(employeeId: string, dto: AdjustAdvanceDto): Promise<{
        success: boolean;
        advance: {
            id: string;
            createdAt: Date;
            description: string | null;
            amount: number;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
            reference: string | null;
            type: import(".prisma/client").$Enums.AdvanceType;
            salaryId: string | null;
            employeeId: string;
            balanceAfter: number;
        };
        employee: {
            id: string;
            name: string;
            previousBalance: number;
            newBalance: number;
        };
    }>;
    getAdvanceHistory(employeeId: string, page?: number, limit?: number): Promise<{
        employee: {
            name: string;
            id: string;
            advanceBalance: number;
        };
        advances: ({
            salary: {
                month: number;
                year: number;
            };
        } & {
            id: string;
            createdAt: Date;
            description: string | null;
            amount: number;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
            reference: string | null;
            type: import(".prisma/client").$Enums.AdvanceType;
            salaryId: string | null;
            employeeId: string;
            balanceAfter: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getAdvanceOverview(): Promise<{
        summary: {
            totalOutstandingAdvance: number;
            employeesWithAdvance: number;
            totalActiveEmployees: number;
        };
        employees: {
            id: string;
            employeeId: string;
            name: string;
            designation: string;
            advanceBalance: number;
            lastAdvanceTransaction: {
                createdAt: Date;
                amount: number;
                type: import(".prisma/client").$Enums.AdvanceType;
            };
        }[];
    }>;
    private calculateSalaryComponents;
    createSalary(createSalaryDto: CreateSalaryDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SalaryStatus;
        notes: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        reference: string | null;
        baseSalary: number;
        employeeId: string;
        month: number;
        year: number;
        overtimeHours: number | null;
        bonus: number | null;
        deductions: number | null;
        paidDate: Date | null;
        advanceDeduction: number;
        allowances: number;
        overtimeAmount: number | null;
        grossSalary: number;
        netSalary: number;
    }>;
    paySalary(paySalaryDto: PaySalaryDto): Promise<{
        success: boolean;
        salary: {
            id: string;
            status: import(".prisma/client").$Enums.SalaryStatus;
            notes: string | null;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
            reference: string | null;
            baseSalary: number;
            employeeId: string;
            month: number;
            year: number;
            overtimeHours: number | null;
            bonus: number | null;
            deductions: number | null;
            paidDate: Date | null;
            advanceDeduction: number;
            allowances: number;
            overtimeAmount: number | null;
            grossSalary: number;
            netSalary: number;
        };
        advanceDeduction: {
            deducted: number;
            previousBalance: number;
            newBalance: number;
            recoveryRecord: any;
        };
        payment: {
            grossSalary: number;
            advanceDeducted: number;
            netPaid: number;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            reference: string;
        };
        employee: {
            id: string;
            name: string;
            designation: string;
        };
    }>;
    getSalaryPreview(employeeId: string, month: number, year: number): Promise<{
        salary: {
            id: string;
            month: number;
            year: number;
            monthName: string;
            status: import(".prisma/client").$Enums.SalaryStatus;
            baseSalary: number;
            allowances: number;
            overtimeHours: number;
            overtimeAmount: number;
            bonus: number;
            deductions: number;
            grossSalary: number;
            paidDate: Date;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            reference: string;
            notes: string;
            advanceDeduction: number;
            netSalary: number;
        };
        employee: {
            name: string;
            id: string;
            designation: string;
            baseSalary: number;
            homeRentAllowance: number;
            healthAllowance: number;
            travelAllowance: number;
            mobileAllowance: number;
            otherAllowances: number;
            employeeId: string;
            advanceBalance: number;
        };
        advance: {
            currentBalance: number;
            suggestedDeduction: number;
            netAfterDeduction: number;
            maxDeduction: number;
        };
    }>;
    getSalaries(employeeId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SalaryStatus;
        notes: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        reference: string | null;
        baseSalary: number;
        employeeId: string;
        month: number;
        year: number;
        overtimeHours: number | null;
        bonus: number | null;
        deductions: number | null;
        paidDate: Date | null;
        advanceDeduction: number;
        allowances: number;
        overtimeAmount: number | null;
        grossSalary: number;
        netSalary: number;
    }[]>;
    getSalaryReport(month: number, year: number): Promise<({
        employee: {
            name: string;
            designation: string;
            employeeId: string;
            advanceBalance: number;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SalaryStatus;
        notes: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        reference: string | null;
        baseSalary: number;
        employeeId: string;
        month: number;
        year: number;
        overtimeHours: number | null;
        bonus: number | null;
        deductions: number | null;
        paidDate: Date | null;
        advanceDeduction: number;
        allowances: number;
        overtimeAmount: number | null;
        grossSalary: number;
        netSalary: number;
    })[]>;
    generateMonthlySalaries(month?: number, year?: number): Promise<{
        month: number;
        year: number;
        summary: {
            totalEmployees: number;
            created: number;
            skipped: number;
            errors: number;
        };
        details: {
            created: any[];
            skipped: any[];
            errors: any[];
        };
    }>;
    getPayables(month?: number, year?: number): Promise<{
        unpaid: {
            advanceInfo: {
                currentBalance: number;
                suggestedDeduction: number;
                projectedNetPay: number;
            };
            employee: {
                name: string;
                designation: string;
                employeeId: string;
                advanceBalance: number;
            };
            id: string;
            status: import(".prisma/client").$Enums.SalaryStatus;
            notes: string | null;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
            reference: string | null;
            baseSalary: number;
            employeeId: string;
            month: number;
            year: number;
            overtimeHours: number | null;
            bonus: number | null;
            deductions: number | null;
            paidDate: Date | null;
            advanceDeduction: number;
            allowances: number;
            overtimeAmount: number | null;
            grossSalary: number;
            netSalary: number;
        }[];
        paid: ({
            employee: {
                name: string;
                designation: string;
                employeeId: string;
                advanceBalance: number;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.SalaryStatus;
            notes: string | null;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
            reference: string | null;
            baseSalary: number;
            employeeId: string;
            month: number;
            year: number;
            overtimeHours: number | null;
            bonus: number | null;
            deductions: number | null;
            paidDate: Date | null;
            advanceDeduction: number;
            allowances: number;
            overtimeAmount: number | null;
            grossSalary: number;
            netSalary: number;
        })[];
        month: number;
        year: number;
    }>;
    getSalaryStatistics(month?: number, year?: number): Promise<{
        currentMonth: {
            month: number;
            year: number;
            totalPaid: number;
            totalPending: number;
            totalAdvanceDeducted: number;
            paidEmployees: number;
            pendingEmployees: number;
            totalEmployees: number;
        };
        yearToDate: {
            totalPaid: number;
            totalAdvanceDeducted: number;
            totalMonths: number;
            totalPayments: number;
        };
        allTime: {
            totalPaid: number;
            totalPayments: number;
        };
        employeeStats: {
            totalActive: number;
            paidThisMonth: number;
            pendingThisMonth: number;
        };
        advanceSummary: {
            totalOutstandingAdvance: number;
        };
    }>;
    getMonthlyTrends(year?: number): Promise<{
        year: number;
        trends: {
            month: number;
            monthName: string;
            paidAmount: number;
            pendingAmount: number;
            advanceDeducted: number;
            paidCount: number;
            pendingCount: number;
        }[];
    }>;
    private getMonthName;
}
