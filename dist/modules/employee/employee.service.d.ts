import { CreateEmployeeDto } from './dto';
import { UpdateEmployeeDto } from './dto';
import { CreateSalaryDto } from './dto';
import { PaySalaryDto } from './dto';
import { DatabaseService } from '../database/database.service';
export declare class EmployeeService {
    private prisma;
    constructor(prisma: DatabaseService);
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
        joinDate: Date;
        employeeId: string;
        designation: string;
        baseSalary: number;
        homeRentAllowance: number;
        healthAllowance: number;
        travelAllowance: number;
        mobileAllowance: number;
        otherAllowances: number;
        overtimeRate: number | null;
        userId: string | null;
    }>;
    findAll(): Promise<({
        user: {
            name: string;
            email: string;
        };
        salaries: {
            id: string;
            status: import(".prisma/client").$Enums.SalaryStatus;
            paidDate: Date | null;
            employeeId: string;
            baseSalary: number;
            month: number;
            year: number;
            allowances: number;
            overtimeHours: number | null;
            overtimeAmount: number | null;
            bonus: number | null;
            deductions: number | null;
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
        joinDate: Date;
        employeeId: string;
        designation: string;
        baseSalary: number;
        homeRentAllowance: number;
        healthAllowance: number;
        travelAllowance: number;
        mobileAllowance: number;
        otherAllowances: number;
        overtimeRate: number | null;
        userId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            name: string;
            email: string;
        };
        salaries: {
            id: string;
            status: import(".prisma/client").$Enums.SalaryStatus;
            paidDate: Date | null;
            employeeId: string;
            baseSalary: number;
            month: number;
            year: number;
            allowances: number;
            overtimeHours: number | null;
            overtimeAmount: number | null;
            bonus: number | null;
            deductions: number | null;
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
        joinDate: Date;
        employeeId: string;
        designation: string;
        baseSalary: number;
        homeRentAllowance: number;
        healthAllowance: number;
        travelAllowance: number;
        mobileAllowance: number;
        otherAllowances: number;
        overtimeRate: number | null;
        userId: string | null;
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
        joinDate: Date;
        employeeId: string;
        designation: string;
        baseSalary: number;
        homeRentAllowance: number;
        healthAllowance: number;
        travelAllowance: number;
        mobileAllowance: number;
        otherAllowances: number;
        overtimeRate: number | null;
        userId: string | null;
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
        joinDate: Date;
        employeeId: string;
        designation: string;
        baseSalary: number;
        homeRentAllowance: number;
        healthAllowance: number;
        travelAllowance: number;
        mobileAllowance: number;
        otherAllowances: number;
        overtimeRate: number | null;
        userId: string | null;
    }>;
    createSalary(createSalaryDto: CreateSalaryDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SalaryStatus;
        paidDate: Date | null;
        employeeId: string;
        baseSalary: number;
        month: number;
        year: number;
        allowances: number;
        overtimeHours: number | null;
        overtimeAmount: number | null;
        bonus: number | null;
        deductions: number | null;
        netSalary: number;
    }>;
    paySalary(paySalaryDto: PaySalaryDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SalaryStatus;
        paidDate: Date | null;
        employeeId: string;
        baseSalary: number;
        month: number;
        year: number;
        allowances: number;
        overtimeHours: number | null;
        overtimeAmount: number | null;
        bonus: number | null;
        deductions: number | null;
        netSalary: number;
    }>;
    getSalaries(employeeId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SalaryStatus;
        paidDate: Date | null;
        employeeId: string;
        baseSalary: number;
        month: number;
        year: number;
        allowances: number;
        overtimeHours: number | null;
        overtimeAmount: number | null;
        bonus: number | null;
        deductions: number | null;
        netSalary: number;
    }[]>;
    getSalaryReport(month: number, year: number): Promise<({
        employee: {
            name: string;
            employeeId: string;
            designation: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SalaryStatus;
        paidDate: Date | null;
        employeeId: string;
        baseSalary: number;
        month: number;
        year: number;
        allowances: number;
        overtimeHours: number | null;
        overtimeAmount: number | null;
        bonus: number | null;
        deductions: number | null;
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
        unpaid: ({
            employee: {
                name: string;
                employeeId: string;
                designation: string;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.SalaryStatus;
            paidDate: Date | null;
            employeeId: string;
            baseSalary: number;
            month: number;
            year: number;
            allowances: number;
            overtimeHours: number | null;
            overtimeAmount: number | null;
            bonus: number | null;
            deductions: number | null;
            netSalary: number;
        })[];
        paid: ({
            employee: {
                name: string;
                employeeId: string;
                designation: string;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.SalaryStatus;
            paidDate: Date | null;
            employeeId: string;
            baseSalary: number;
            month: number;
            year: number;
            allowances: number;
            overtimeHours: number | null;
            overtimeAmount: number | null;
            bonus: number | null;
            deductions: number | null;
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
            paidEmployees: number;
            pendingEmployees: number;
            totalEmployees: number;
        };
        yearToDate: {
            totalPaid: number;
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
    }>;
    getMonthlyTrends(year?: number): Promise<{
        year: number;
        trends: {
            month: number;
            paidAmount: number;
            pendingAmount: number;
            paidCount: number;
            pendingCount: number;
        }[];
    }>;
    private calculateTotalSalary;
    private calculateSalaryComponents;
}
