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
        id: string;
        employeeId: string;
        name: string;
        email: string;
        phone: string | null;
        address: string | null;
        designation: string;
        joinDate: Date;
        baseSalary: number;
        homeRentAllowance: number;
        healthAllowance: number;
        travelAllowance: number;
        mobileAllowance: number;
        otherAllowances: number;
        overtimeRate: number | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    }>;
    findAll(): Promise<({
        user: {
            name: string;
            email: string;
        };
        salaries: {
            id: string;
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
            status: import(".prisma/client").$Enums.SalaryStatus;
            paidDate: Date | null;
        }[];
    } & {
        id: string;
        employeeId: string;
        name: string;
        email: string;
        phone: string | null;
        address: string | null;
        designation: string;
        joinDate: Date;
        baseSalary: number;
        homeRentAllowance: number;
        healthAllowance: number;
        travelAllowance: number;
        mobileAllowance: number;
        otherAllowances: number;
        overtimeRate: number | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            name: string;
            email: string;
        };
        salaries: {
            id: string;
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
            status: import(".prisma/client").$Enums.SalaryStatus;
            paidDate: Date | null;
        }[];
    } & {
        id: string;
        employeeId: string;
        name: string;
        email: string;
        phone: string | null;
        address: string | null;
        designation: string;
        joinDate: Date;
        baseSalary: number;
        homeRentAllowance: number;
        healthAllowance: number;
        travelAllowance: number;
        mobileAllowance: number;
        otherAllowances: number;
        overtimeRate: number | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    }>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<{
        id: string;
        employeeId: string;
        name: string;
        email: string;
        phone: string | null;
        address: string | null;
        designation: string;
        joinDate: Date;
        baseSalary: number;
        homeRentAllowance: number;
        healthAllowance: number;
        travelAllowance: number;
        mobileAllowance: number;
        otherAllowances: number;
        overtimeRate: number | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        employeeId: string;
        name: string;
        email: string;
        phone: string | null;
        address: string | null;
        designation: string;
        joinDate: Date;
        baseSalary: number;
        homeRentAllowance: number;
        healthAllowance: number;
        travelAllowance: number;
        mobileAllowance: number;
        otherAllowances: number;
        overtimeRate: number | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    }>;
    createSalary(createSalaryDto: CreateSalaryDto): Promise<{
        id: string;
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
        status: import(".prisma/client").$Enums.SalaryStatus;
        paidDate: Date | null;
    }>;
    paySalary(paySalaryDto: PaySalaryDto): Promise<{
        id: string;
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
        status: import(".prisma/client").$Enums.SalaryStatus;
        paidDate: Date | null;
    }>;
    getSalaries(employeeId: string): Promise<{
        id: string;
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
        status: import(".prisma/client").$Enums.SalaryStatus;
        paidDate: Date | null;
    }[]>;
    getSalaryReport(month: number, year: number): Promise<({
        employee: {
            employeeId: string;
            name: string;
            designation: string;
        };
    } & {
        id: string;
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
        status: import(".prisma/client").$Enums.SalaryStatus;
        paidDate: Date | null;
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
                employeeId: string;
                name: string;
                designation: string;
            };
        } & {
            id: string;
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
            status: import(".prisma/client").$Enums.SalaryStatus;
            paidDate: Date | null;
        })[];
        paid: ({
            employee: {
                employeeId: string;
                name: string;
                designation: string;
            };
        } & {
            id: string;
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
            status: import(".prisma/client").$Enums.SalaryStatus;
            paidDate: Date | null;
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
