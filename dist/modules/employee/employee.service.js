"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const client_1 = require("@prisma/client");
let EmployeeService = class EmployeeService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSystemUserId() {
        const admin = await this.prisma.user.findFirst({
            where: { role: 'ADMIN' },
            select: { id: true },
        });
        if (!admin) {
            const anyUser = await this.prisma.user.findFirst({ select: { id: true } });
            return anyUser?.id || 'system';
        }
        return admin.id;
    }
    async generateEmployeeId() {
        const lastEmployee = await this.prisma.employee.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { employeeId: true },
        });
        if (!lastEmployee)
            return 'EMP-00001';
        const lastNumber = parseInt(lastEmployee.employeeId.split('-')[1]) || 0;
        return `EMP-${(lastNumber + 1).toString().padStart(5, '0')}`;
    }
    async create(createEmployeeDto) {
        const employeeId = await this.generateEmployeeId();
        return this.prisma.employee.create({
            data: { ...createEmployeeDto, employeeId },
        });
    }
    async findAll() {
        return this.prisma.employee.findMany({
            where: { isActive: true },
            include: {
                user: { select: { name: true, email: true } },
                salaries: {
                    orderBy: [{ year: 'desc' }, { month: 'desc' }],
                    take: 1,
                },
            },
        });
    }
    async findOne(id) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, email: true } },
                salaries: {
                    orderBy: [{ year: 'desc' }, { month: 'desc' }],
                },
                advances: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with ID ${id} not found`);
        }
        return employee;
    }
    async update(id, updateEmployeeDto) {
        await this.findOne(id);
        return this.prisma.employee.update({
            where: { id },
            data: updateEmployeeDto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.employee.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async giveAdvance(employeeId, dto) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
        });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        if (dto.amount <= 0) {
            throw new common_1.BadRequestException('Advance amount must be greater than 0');
        }
        const newBalance = employee.advanceBalance + dto.amount;
        const [advance] = await this.prisma.$transaction([
            this.prisma.employeeAdvance.create({
                data: {
                    employeeId,
                    amount: dto.amount,
                    type: 'GIVEN',
                    description: dto.description || 'Advance payment',
                    paymentMethod: dto.paymentMethod,
                    reference: dto.reference,
                    balanceAfter: newBalance,
                },
            }),
            this.prisma.employee.update({
                where: { id: employeeId },
                data: { advanceBalance: newBalance },
            }),
        ]);
        try {
            const systemUserId = await this.getSystemUserId();
            await this.prisma.expense.create({
                data: {
                    title: `Employee Advance - ${employee.name}`,
                    description: dto.description || `Advance payment to ${employee.name} (${employee.employeeId})`,
                    amount: dto.amount,
                    category: client_1.ExpenseCategory.EMPLOYEE_ADVANCE,
                    expenseDate: new Date(),
                    paymentMethod: dto.paymentMethod || 'CASH',
                    status: client_1.ExpenseStatus.APPROVED,
                    isAutoGenerated: true,
                    employeeAdvanceId: advance.id,
                    recordedBy: systemUserId,
                },
            });
        }
        catch (_) {
        }
        return {
            success: true,
            advance,
            employee: {
                id: employee.id,
                name: employee.name,
                previousBalance: employee.advanceBalance,
                newBalance,
            },
        };
    }
    async adjustAdvance(employeeId, dto) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
        });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        const newBalance = employee.advanceBalance + dto.amount;
        if (newBalance < 0) {
            throw new common_1.BadRequestException(`Adjustment would result in negative balance. Current balance: ${employee.advanceBalance}`);
        }
        const [advance] = await this.prisma.$transaction([
            this.prisma.employeeAdvance.create({
                data: {
                    employeeId,
                    amount: Math.abs(dto.amount),
                    type: 'ADJUSTMENT',
                    description: dto.description,
                    balanceAfter: newBalance,
                },
            }),
            this.prisma.employee.update({
                where: { id: employeeId },
                data: { advanceBalance: newBalance },
            }),
        ]);
        return {
            success: true,
            advance,
            employee: {
                id: employee.id,
                name: employee.name,
                previousBalance: employee.advanceBalance,
                newBalance,
            },
        };
    }
    async getAdvanceHistory(employeeId, page = 1, limit = 20) {
        await this.findOne(employeeId);
        const skip = (page - 1) * limit;
        const [advances, total] = await Promise.all([
            this.prisma.employeeAdvance.findMany({
                where: { employeeId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    salary: {
                        select: { month: true, year: true },
                    },
                },
            }),
            this.prisma.employeeAdvance.count({ where: { employeeId } }),
        ]);
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
            select: { id: true, name: true, advanceBalance: true },
        });
        return {
            employee,
            advances,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        };
    }
    async getAdvanceOverview() {
        const employees = await this.prisma.employee.findMany({
            where: { isActive: true },
            select: {
                id: true,
                employeeId: true,
                name: true,
                designation: true,
                advanceBalance: true,
                advances: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { amount: true, type: true, createdAt: true },
                },
            },
            orderBy: { advanceBalance: 'desc' },
        });
        const totalOutstanding = employees.reduce((sum, e) => sum + e.advanceBalance, 0);
        const employeesWithAdvance = employees.filter((e) => e.advanceBalance > 0);
        return {
            summary: {
                totalOutstandingAdvance: totalOutstanding,
                employeesWithAdvance: employeesWithAdvance.length,
                totalActiveEmployees: employees.length,
            },
            employees: employees.map((e) => ({
                id: e.id,
                employeeId: e.employeeId,
                name: e.name,
                designation: e.designation,
                advanceBalance: e.advanceBalance,
                lastAdvanceTransaction: e.advances[0] || null,
            })),
        };
    }
    calculateSalaryComponents(employee, salaryData) {
        const { baseSalary, homeRentAllowance, healthAllowance, travelAllowance, mobileAllowance, otherAllowances, overtimeRate, } = employee;
        const overtimeAmount = salaryData.overtimeHours
            ? salaryData.overtimeHours * (overtimeRate || 0)
            : 0;
        const totalAllowances = homeRentAllowance +
            healthAllowance +
            travelAllowance +
            mobileAllowance +
            otherAllowances;
        const grossSalary = baseSalary +
            totalAllowances +
            overtimeAmount +
            (salaryData.bonus || 0) -
            (salaryData.deductions || 0);
        return {
            baseSalary,
            allowances: totalAllowances,
            overtimeHours: salaryData.overtimeHours || 0,
            overtimeAmount,
            bonus: salaryData.bonus || 0,
            deductions: salaryData.deductions || 0,
            grossSalary,
            netSalary: grossSalary,
            advanceDeduction: 0,
        };
    }
    async createSalary(createSalaryDto) {
        const employee = await this.findOne(createSalaryDto.employeeId);
        const existingSalary = await this.prisma.salary.findUnique({
            where: {
                employeeId_month_year: {
                    employeeId: createSalaryDto.employeeId,
                    month: createSalaryDto.month,
                    year: createSalaryDto.year,
                },
            },
        });
        if (existingSalary) {
            throw new common_1.ConflictException('Salary record already exists for this month and year');
        }
        const components = this.calculateSalaryComponents(employee, createSalaryDto);
        return this.prisma.salary.create({
            data: {
                ...createSalaryDto,
                ...components,
            },
        });
    }
    async paySalary(paySalaryDto) {
        const salary = await this.prisma.salary.findUnique({
            where: {
                employeeId_month_year: {
                    employeeId: paySalaryDto.employeeId,
                    month: paySalaryDto.month,
                    year: paySalaryDto.year,
                },
            },
            include: { employee: true },
        });
        if (!salary) {
            throw new common_1.NotFoundException('Salary record not found');
        }
        if (salary.status === 'PAID') {
            throw new common_1.ConflictException('Salary already paid');
        }
        const employee = salary.employee;
        const currentAdvanceBalance = employee.advanceBalance;
        let advanceDeduction;
        if (paySalaryDto.advanceDeduction !== undefined) {
            advanceDeduction = paySalaryDto.advanceDeduction;
            if (advanceDeduction < 0) {
                throw new common_1.BadRequestException('Advance deduction cannot be negative');
            }
            if (advanceDeduction > currentAdvanceBalance) {
                throw new common_1.BadRequestException(`Advance deduction (${advanceDeduction}) exceeds current advance balance (${currentAdvanceBalance})`);
            }
            if (advanceDeduction > salary.grossSalary) {
                throw new common_1.BadRequestException(`Advance deduction (${advanceDeduction}) cannot exceed gross salary (${salary.grossSalary})`);
            }
        }
        else {
            advanceDeduction = Math.min(currentAdvanceBalance, salary.grossSalary);
        }
        const netSalary = salary.grossSalary - advanceDeduction;
        const newAdvanceBalance = currentAdvanceBalance - advanceDeduction;
        const result = await this.prisma.$transaction(async (tx) => {
            const updatedSalary = await tx.salary.update({
                where: { id: salary.id },
                data: {
                    status: 'PAID',
                    paidDate: paySalaryDto.paidDate,
                    advanceDeduction,
                    netSalary,
                    paymentMethod: paySalaryDto.paymentMethod,
                    reference: paySalaryDto.reference,
                    notes: paySalaryDto.notes,
                },
            });
            await tx.employee.update({
                where: { id: employee.id },
                data: { advanceBalance: newAdvanceBalance },
            });
            let advanceRecord = null;
            if (advanceDeduction > 0) {
                advanceRecord = await tx.employeeAdvance.create({
                    data: {
                        employeeId: employee.id,
                        amount: advanceDeduction,
                        type: 'RECOVERED',
                        description: `Recovered from ${this.getMonthName(salary.month)} ${salary.year} salary`,
                        balanceAfter: newAdvanceBalance,
                        salaryId: salary.id,
                    },
                });
            }
            const systemUserId = await this.getSystemUserId();
            await tx.expense.create({
                data: {
                    title: `Salary - ${employee.name} (${this.getMonthName(salary.month)} ${salary.year})`,
                    description: `Net salary payment to ${employee.name} (${employee.employeeId}). Gross: ${salary.grossSalary}, Advance Deducted: ${advanceDeduction}`,
                    amount: netSalary,
                    category: client_1.ExpenseCategory.SALARY,
                    expenseDate: paySalaryDto.paidDate || new Date(),
                    paymentMethod: paySalaryDto.paymentMethod || 'BANK_TRANSFER',
                    status: client_1.ExpenseStatus.APPROVED,
                    isAutoGenerated: true,
                    salaryId: updatedSalary.id,
                    recordedBy: systemUserId,
                },
            });
            return { updatedSalary, advanceRecord };
        });
        return {
            success: true,
            salary: result.updatedSalary,
            advanceDeduction: {
                deducted: advanceDeduction,
                previousBalance: currentAdvanceBalance,
                newBalance: newAdvanceBalance,
                recoveryRecord: result.advanceRecord,
            },
            payment: {
                grossSalary: salary.grossSalary,
                advanceDeducted: advanceDeduction,
                netPaid: netSalary,
                paymentMethod: paySalaryDto.paymentMethod || null,
                reference: paySalaryDto.reference || null,
            },
            employee: {
                id: employee.id,
                name: employee.name,
                designation: employee.designation,
            },
        };
    }
    async getSalaryPreview(employeeId, month, year) {
        const salary = await this.prisma.salary.findUnique({
            where: {
                employeeId_month_year: { employeeId, month, year },
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        employeeId: true,
                        name: true,
                        designation: true,
                        advanceBalance: true,
                        baseSalary: true,
                        homeRentAllowance: true,
                        healthAllowance: true,
                        travelAllowance: true,
                        mobileAllowance: true,
                        otherAllowances: true,
                    },
                },
            },
        });
        if (!salary) {
            throw new common_1.NotFoundException(`Salary record not found for ${this.getMonthName(month)} ${year}`);
        }
        const advanceBalance = salary.employee.advanceBalance;
        const suggestedDeduction = Math.min(advanceBalance, salary.grossSalary);
        return {
            salary: {
                id: salary.id,
                month: salary.month,
                year: salary.year,
                monthName: this.getMonthName(salary.month),
                status: salary.status,
                baseSalary: salary.baseSalary,
                allowances: salary.allowances,
                overtimeHours: salary.overtimeHours,
                overtimeAmount: salary.overtimeAmount,
                bonus: salary.bonus,
                deductions: salary.deductions,
                grossSalary: salary.grossSalary,
                paidDate: salary.paidDate,
                paymentMethod: salary.paymentMethod,
                reference: salary.reference,
                notes: salary.notes,
                advanceDeduction: salary.status === 'PAID' ? salary.advanceDeduction : null,
                netSalary: salary.status === 'PAID' ? salary.netSalary : null,
            },
            employee: salary.employee,
            advance: {
                currentBalance: advanceBalance,
                suggestedDeduction,
                netAfterDeduction: salary.grossSalary - suggestedDeduction,
                maxDeduction: Math.min(advanceBalance, salary.grossSalary),
            },
        };
    }
    async getSalaries(employeeId) {
        await this.findOne(employeeId);
        return this.prisma.salary.findMany({
            where: { employeeId },
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
        });
    }
    async getSalaryReport(month, year) {
        return this.prisma.salary.findMany({
            where: { month, year },
            include: {
                employee: {
                    select: {
                        name: true,
                        designation: true,
                        employeeId: true,
                        advanceBalance: true,
                    },
                },
            },
            orderBy: { employee: { name: 'asc' } },
        });
    }
    async generateMonthlySalaries(month, year) {
        const now = new Date();
        const currentMonth = month || now.getMonth() + 1;
        const currentYear = year || now.getFullYear();
        const activeEmployees = await this.prisma.employee.findMany({
            where: { isActive: true },
            include: {
                salaries: {
                    where: { month: currentMonth, year: currentYear },
                },
            },
        });
        const results = {
            created: [],
            skipped: [],
            errors: [],
        };
        for (const employee of activeEmployees) {
            try {
                if (employee.salaries.find((s) => s.month === currentMonth && s.year === currentYear)) {
                    results.skipped.push({
                        employeeId: employee.id,
                        employeeName: employee.name,
                        reason: 'Salary record already exists for this month',
                    });
                    continue;
                }
                const salaryData = {
                    employeeId: employee.id,
                    month: currentMonth,
                    year: currentYear,
                    overtimeHours: 0,
                    bonus: 0,
                    deductions: 0,
                };
                const components = this.calculateSalaryComponents(employee, salaryData);
                const newSalary = await this.prisma.salary.create({
                    data: { ...salaryData, ...components },
                });
                results.created.push({
                    employeeId: employee.id,
                    employeeName: employee.name,
                    salaryId: newSalary.id,
                    grossSalary: newSalary.grossSalary,
                    advanceBalance: employee.advanceBalance,
                });
            }
            catch (error) {
                results.errors.push({
                    employeeId: employee.id,
                    employeeName: employee.name,
                    error: error.message,
                });
            }
        }
        return {
            month: currentMonth,
            year: currentYear,
            summary: {
                totalEmployees: activeEmployees.length,
                created: results.created.length,
                skipped: results.skipped.length,
                errors: results.errors.length,
            },
            details: results,
        };
    }
    async getPayables(month, year) {
        const now = new Date();
        const currentMonth = month || now.getMonth() + 1;
        const currentYear = year || now.getFullYear();
        const unpaidSalaries = await this.prisma.salary.findMany({
            where: { month: currentMonth, year: currentYear, status: 'PENDING' },
            include: {
                employee: {
                    select: {
                        name: true,
                        designation: true,
                        employeeId: true,
                        advanceBalance: true,
                    },
                },
            },
            orderBy: { employee: { name: 'asc' } },
        });
        const paidSalaries = await this.prisma.salary.findMany({
            where: { month: currentMonth, year: currentYear, status: 'PAID' },
            include: {
                employee: {
                    select: {
                        name: true,
                        designation: true,
                        employeeId: true,
                        advanceBalance: true,
                    },
                },
            },
            orderBy: { employee: { name: 'asc' } },
        });
        const unpaidWithAdvanceInfo = unpaidSalaries.map((s) => ({
            ...s,
            advanceInfo: {
                currentBalance: s.employee.advanceBalance,
                suggestedDeduction: Math.min(s.employee.advanceBalance, s.grossSalary),
                projectedNetPay: s.grossSalary -
                    Math.min(s.employee.advanceBalance, s.grossSalary),
            },
        }));
        return {
            unpaid: unpaidWithAdvanceInfo,
            paid: paidSalaries,
            month: currentMonth,
            year: currentYear,
        };
    }
    async getSalaryStatistics(month, year) {
        const now = new Date();
        const currentMonth = month || now.getMonth() + 1;
        const currentYear = year || now.getFullYear();
        const currentMonthSalaries = await this.prisma.salary.findMany({
            where: { month: currentMonth, year: currentYear },
        });
        const ytdSalaries = await this.prisma.salary.findMany({
            where: { year: currentYear, status: 'PAID' },
        });
        const allTimeSalaries = await this.prisma.salary.findMany({
            where: { status: 'PAID' },
        });
        const currentMonthTotal = currentMonthSalaries
            .filter((s) => s.status === 'PAID')
            .reduce((sum, s) => sum + s.netSalary, 0);
        const currentMonthPending = currentMonthSalaries
            .filter((s) => s.status === 'PENDING')
            .reduce((sum, s) => sum + s.grossSalary, 0);
        const totalAdvanceDeductedThisMonth = currentMonthSalaries
            .filter((s) => s.status === 'PAID')
            .reduce((sum, s) => sum + s.advanceDeduction, 0);
        const ytdTotal = ytdSalaries.reduce((sum, s) => sum + s.netSalary, 0);
        const ytdAdvanceDeductions = ytdSalaries.reduce((sum, s) => sum + s.advanceDeduction, 0);
        const allTimeTotal = allTimeSalaries.reduce((sum, s) => sum + s.netSalary, 0);
        const totalEmployees = await this.prisma.employee.count({
            where: { isActive: true },
        });
        const totalOutstandingAdvance = await this.prisma.employee.aggregate({
            where: { isActive: true },
            _sum: { advanceBalance: true },
        });
        const paidThisMonth = currentMonthSalaries.filter((s) => s.status === 'PAID').length;
        const pendingThisMonth = currentMonthSalaries.filter((s) => s.status === 'PENDING').length;
        return {
            currentMonth: {
                month: currentMonth,
                year: currentYear,
                totalPaid: currentMonthTotal,
                totalPending: currentMonthPending,
                totalAdvanceDeducted: totalAdvanceDeductedThisMonth,
                paidEmployees: paidThisMonth,
                pendingEmployees: pendingThisMonth,
                totalEmployees: currentMonthSalaries.length,
            },
            yearToDate: {
                totalPaid: ytdTotal,
                totalAdvanceDeducted: ytdAdvanceDeductions,
                totalMonths: new Set(ytdSalaries.map((s) => s.month)).size,
                totalPayments: ytdSalaries.length,
            },
            allTime: {
                totalPaid: allTimeTotal,
                totalPayments: allTimeSalaries.length,
            },
            employeeStats: {
                totalActive: totalEmployees,
                paidThisMonth,
                pendingThisMonth,
            },
            advanceSummary: {
                totalOutstandingAdvance: totalOutstandingAdvance._sum.advanceBalance || 0,
            },
        };
    }
    async getMonthlyTrends(year) {
        const currentYear = year || new Date().getFullYear();
        const monthlyData = await this.prisma.salary.groupBy({
            by: ['month', 'status'],
            where: { year: currentYear },
            _sum: { netSalary: true, advanceDeduction: true },
            _count: { id: true },
        });
        const trends = Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const monthData = monthlyData.filter((d) => d.month === month);
            const paid = monthData.find((d) => d.status === 'PAID');
            const pending = monthData.find((d) => d.status === 'PENDING');
            return {
                month,
                monthName: this.getMonthName(month),
                paidAmount: paid?._sum?.netSalary || 0,
                pendingAmount: pending?._sum?.netSalary || 0,
                advanceDeducted: paid?._sum?.advanceDeduction || 0,
                paidCount: paid?._count?.id || 0,
                pendingCount: pending?._count?.id || 0,
            };
        });
        return { year: currentYear, trends };
    }
    getMonthName(month) {
        const months = [
            '',
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];
        return months[month] || '';
    }
};
exports.EmployeeService = EmployeeService;
exports.EmployeeService = EmployeeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], EmployeeService);
//# sourceMappingURL=employee.service.js.map