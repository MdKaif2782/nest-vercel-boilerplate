import { HttpStatus } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto, CreateSalaryDto, PaySalaryDto, GiveAdvanceDto, AdjustAdvanceDto } from './dto';
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
        })[];
    }>;
    getPayables(month: number, year: number): Promise<{
        statusCode: HttpStatus;
        data: {
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
                monthName: string;
                paidAmount: number;
                pendingAmount: number;
                advanceDeducted: number;
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
        message?: undefined;
    } | {
        statusCode: HttpStatus;
        message: any;
        data?: undefined;
    }>;
    getAdvanceOverview(): Promise<{
        statusCode: HttpStatus;
        data: {
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
        };
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
    } | {
        statusCode: HttpStatus;
        message: any;
        data?: undefined;
    }>;
    paySalary(paySalaryDto: PaySalaryDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
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
        message?: undefined;
    } | {
        statusCode: HttpStatus;
        message: any;
        data?: undefined;
    }>;
    getSalaryPreview(id: string, month: number, year: number): Promise<{
        statusCode: HttpStatus;
        data: {
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
        };
        message?: undefined;
    } | {
        statusCode: HttpStatus;
        message: any;
        data?: undefined;
    }>;
    giveAdvance(id: string, dto: GiveAdvanceDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
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
        };
    } | {
        statusCode: HttpStatus;
        message: any;
        data?: undefined;
    }>;
    adjustAdvance(id: string, dto: AdjustAdvanceDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
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
        };
    } | {
        statusCode: HttpStatus;
        message: any;
        data?: undefined;
    }>;
    getAdvanceHistory(id: string, page: number, limit: number): Promise<{
        statusCode: HttpStatus;
        data: {
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
        };
        message?: undefined;
    } | {
        statusCode: HttpStatus;
        message: any;
        data?: undefined;
    }>;
}
