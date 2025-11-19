import { HttpStatus } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto';
import { UpdateEmployeeDto } from './dto';
import { CreateSalaryDto } from './dto';
import { PaySalaryDto } from './dto';
export declare class EmployeeController {
    private readonly employeeService;
    constructor(employeeService: EmployeeService);
    create(createEmployeeDto: CreateEmployeeDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            name: string;
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            address: string | null;
            isActive: boolean;
            employeeId: string;
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
        };
    } | {
        statusCode: HttpStatus;
        message: any;
        data?: undefined;
    }>;
    findAll(): Promise<{
        statusCode: HttpStatus;
        data: ({
            user: {
                name: string;
                email: string;
            };
            salaries: {
                id: string;
                status: import(".prisma/client").$Enums.SalaryStatus;
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
                paidDate: Date | null;
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
            employeeId: string;
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
        })[];
    }>;
    getPayables(month: number, year: number): Promise<{
        statusCode: HttpStatus;
        data: {
            unpaid: ({
                employee: {
                    name: string;
                    employeeId: string;
                    designation: string;
                };
            } & {
                id: string;
                status: import(".prisma/client").$Enums.SalaryStatus;
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
                paidDate: Date | null;
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
                paidDate: Date | null;
            })[];
            month: number;
            year: number;
        };
        message?: undefined;
    } | {
        statusCode: HttpStatus;
        message: any;
        data?: undefined;
    }>;
    getSalaryStatistics(month: number, year: number): Promise<{
        statusCode: HttpStatus;
        data: {
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
        };
        message?: undefined;
    } | {
        statusCode: HttpStatus;
        message: any;
        data?: undefined;
    }>;
    getMonthlyTrends(year: number): Promise<{
        statusCode: HttpStatus;
        data: {
            year: number;
            trends: {
                month: number;
                paidAmount: number;
                pendingAmount: number;
                paidCount: number;
                pendingCount: number;
            }[];
        };
        message?: undefined;
    } | {
        statusCode: HttpStatus;
        message: any;
        data?: undefined;
    }>;
    getSalaryReport(month: number, year: number): Promise<{
        statusCode: HttpStatus;
        data: ({
            employee: {
                name: string;
                employeeId: string;
                designation: string;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.SalaryStatus;
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
            paidDate: Date | null;
        })[];
        message?: undefined;
    } | {
        statusCode: HttpStatus;
        message: any;
        data?: undefined;
    }>;
    createSalary(createSalaryDto: CreateSalaryDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            id: string;
            status: import(".prisma/client").$Enums.SalaryStatus;
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
            paidDate: Date | null;
        };
    } | {
        statusCode: HttpStatus;
        message: any;
        data?: undefined;
    }>;
    paySalary(paySalaryDto: PaySalaryDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            id: string;
            status: import(".prisma/client").$Enums.SalaryStatus;
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
            paidDate: Date | null;
        };
    } | {
        statusCode: HttpStatus;
        message: any;
        data?: undefined;
    }>;
    generateMonthlySalaries(month: number, year: number): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
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
        };
    } | {
        statusCode: HttpStatus;
        message: any;
        data?: undefined;
    }>;
    findOne(id: string): Promise<{
        statusCode: HttpStatus;
        data: {
            user: {
                name: string;
                email: string;
            };
            salaries: {
                id: string;
                status: import(".prisma/client").$Enums.SalaryStatus;
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
                paidDate: Date | null;
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
            employeeId: string;
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
        };
        message?: undefined;
    } | {
        statusCode: HttpStatus;
        message: any;
        data?: undefined;
    }>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            name: string;
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            address: string | null;
            isActive: boolean;
            employeeId: string;
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
        };
    } | {
        statusCode: HttpStatus;
        message: any;
        data?: undefined;
    }>;
    remove(id: string): Promise<{
        statusCode: HttpStatus;
        message: any;
    }>;
    getSalaries(id: string): Promise<{
        statusCode: HttpStatus;
        data: {
            id: string;
            status: import(".prisma/client").$Enums.SalaryStatus;
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
            paidDate: Date | null;
        }[];
        message?: undefined;
    } | {
        statusCode: HttpStatus;
        message: any;
        data?: undefined;
    }>;
}
