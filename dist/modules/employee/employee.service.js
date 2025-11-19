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
let EmployeeService = class EmployeeService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateEmployeeId() {
        const lastEmployee = await this.prisma.employee.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { employeeId: true }
        });
        if (!lastEmployee)
            return 'EMP-00001';
        const lastNumber = parseInt(lastEmployee.employeeId.split('-')[1]) || 0;
        const nextNumber = lastNumber + 1;
        return `EMP-${nextNumber.toString().padStart(5, '0')}`;
    }
    async create(createEmployeeDto) {
        const employeeId = await this.generateEmployeeId();
        return this.prisma.employee.create({
            data: {
                ...createEmployeeDto,
                employeeId,
            },
        });
    }
    async findAll() {
        return this.prisma.employee.findMany({
            where: { isActive: true },
            include: {
                user: {
                    select: { name: true, email: true }
                },
                salaries: {
                    orderBy: [
                        { year: 'desc' },
                        { month: 'desc' }
                    ],
                    take: 1
                }
            }
        });
    }
    async findOne(id) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
            include: {
                user: {
                    select: { name: true, email: true }
                },
                salaries: {
                    orderBy: [
                        { year: 'desc' },
                        { month: 'desc' }
                    ],
                }
            }
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
            throw new Error('Salary record already exists for this month and year');
        }
        const salaryComponents = this.calculateSalaryComponents(employee, createSalaryDto);
        return this.prisma.salary.create({
            data: {
                ...createSalaryDto,
                ...salaryComponents,
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
            throw new Error('Salary already paid');
        }
        const updatedSalary = await this.prisma.salary.update({
            where: { id: salary.id },
            data: {
                status: 'PAID',
                paidDate: paySalaryDto.paidDate,
            },
        });
        return updatedSalary;
    }
    async getSalaries(employeeId) {
        await this.findOne(employeeId);
        return this.prisma.salary.findMany({
            where: { employeeId },
            orderBy: [
                { year: 'desc' },
                { month: 'desc' }
            ],
        });
    }
    async getSalaryReport(month, year) {
        return this.prisma.salary.findMany({
            where: { month, year },
            include: {
                employee: {
                    select: { name: true, designation: true, employeeId: true }
                }
            },
            orderBy: { employee: { name: 'asc' } }
        });
    }
    async generateMonthlySalaries(month, year) {
        const currentDate = new Date();
        const currentMonth = month || currentDate.getMonth() + 1;
        const currentYear = year || currentDate.getFullYear();
        const activeEmployees = await this.prisma.employee.findMany({
            where: { isActive: true },
            include: {
                salaries: {
                    where: {
                        month: currentMonth,
                        year: currentYear
                    }
                }
            }
        });
        const results = {
            created: [],
            skipped: [],
            errors: []
        };
        for (const employee of activeEmployees) {
            try {
                const existingSalary = employee.salaries.find(s => s.month === currentMonth && s.year === currentYear);
                if (existingSalary) {
                    results.skipped.push({
                        employeeId: employee.id,
                        employeeName: employee.name,
                        reason: 'Salary record already exists for this month'
                    });
                    continue;
                }
                const salaryData = {
                    employeeId: employee.id,
                    month: currentMonth,
                    year: currentYear,
                    overtimeHours: 0,
                    bonus: 0,
                    deductions: 0
                };
                const salaryComponents = this.calculateSalaryComponents(employee, salaryData);
                const newSalary = await this.prisma.salary.create({
                    data: {
                        ...salaryData,
                        ...salaryComponents,
                    },
                });
                results.created.push({
                    employeeId: employee.id,
                    employeeName: employee.name,
                    salaryId: newSalary.id,
                    netSalary: newSalary.netSalary
                });
            }
            catch (error) {
                results.errors.push({
                    employeeId: employee.id,
                    employeeName: employee.name,
                    error: error.message
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
                errors: results.errors.length
            },
            details: results
        };
    }
    async getPayables(month, year) {
        const currentDate = new Date();
        const currentMonth = month || currentDate.getMonth() + 1;
        const currentYear = year || currentDate.getFullYear();
        const unpaidSalaries = await this.prisma.salary.findMany({
            where: {
                month: currentMonth,
                year: currentYear,
                status: 'PENDING'
            },
            include: {
                employee: {
                    select: {
                        name: true,
                        designation: true,
                        employeeId: true
                    }
                }
            },
            orderBy: { employee: { name: 'asc' } }
        });
        const paidSalaries = await this.prisma.salary.findMany({
            where: {
                month: currentMonth,
                year: currentYear,
                status: 'PAID'
            },
            include: {
                employee: {
                    select: {
                        name: true,
                        designation: true,
                        employeeId: true
                    }
                }
            },
            orderBy: { employee: { name: 'asc' } }
        });
        return {
            unpaid: unpaidSalaries,
            paid: paidSalaries,
            month: currentMonth,
            year: currentYear
        };
    }
    async getSalaryStatistics(month, year) {
        const currentDate = new Date();
        const currentMonth = month || currentDate.getMonth() + 1;
        const currentYear = year || currentDate.getFullYear();
        const currentMonthSalaries = await this.prisma.salary.findMany({
            where: {
                month: currentMonth,
                year: currentYear
            }
        });
        const ytdSalaries = await this.prisma.salary.findMany({
            where: {
                year: currentYear,
                status: 'PAID'
            }
        });
        const allTimeSalaries = await this.prisma.salary.findMany({
            where: {
                status: 'PAID'
            }
        });
        const currentMonthTotal = currentMonthSalaries
            .filter(s => s.status === 'PAID')
            .reduce((sum, salary) => sum + salary.netSalary, 0);
        const currentMonthPending = currentMonthSalaries
            .filter(s => s.status === 'PENDING')
            .reduce((sum, salary) => sum + salary.netSalary, 0);
        const ytdTotal = ytdSalaries.reduce((sum, salary) => sum + salary.netSalary, 0);
        const allTimeTotal = allTimeSalaries.reduce((sum, salary) => sum + salary.netSalary, 0);
        const totalEmployees = await this.prisma.employee.count({
            where: { isActive: true }
        });
        const paidThisMonth = currentMonthSalaries.filter(s => s.status === 'PAID').length;
        const pendingThisMonth = currentMonthSalaries.filter(s => s.status === 'PENDING').length;
        return {
            currentMonth: {
                month: currentMonth,
                year: currentYear,
                totalPaid: currentMonthTotal,
                totalPending: currentMonthPending,
                paidEmployees: paidThisMonth,
                pendingEmployees: pendingThisMonth,
                totalEmployees: currentMonthSalaries.length
            },
            yearToDate: {
                totalPaid: ytdTotal,
                totalMonths: new Set(ytdSalaries.map(s => s.month)).size,
                totalPayments: ytdSalaries.length
            },
            allTime: {
                totalPaid: allTimeTotal,
                totalPayments: allTimeSalaries.length
            },
            employeeStats: {
                totalActive: totalEmployees,
                paidThisMonth,
                pendingThisMonth
            }
        };
    }
    async getMonthlyTrends(year) {
        const currentYear = year || new Date().getFullYear();
        const monthlyData = await this.prisma.salary.groupBy({
            by: ['month', 'status'],
            where: {
                year: currentYear
            },
            _sum: {
                netSalary: true
            },
            _count: {
                id: true
            }
        });
        const trends = Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const monthData = monthlyData.filter(d => d.month === month);
            const paid = monthData.find(d => d.status === 'PAID');
            const pending = monthData.find(d => d.status === 'PENDING');
            return {
                month,
                paidAmount: paid?._sum?.netSalary || 0,
                pendingAmount: pending?._sum?.netSalary || 0,
                paidCount: paid?._count?.id || 0,
                pendingCount: pending?._count?.id || 0
            };
        });
        return {
            year: currentYear,
            trends
        };
    }
    calculateTotalSalary(employeeData) {
        return employeeData.baseSalary +
            employeeData.homeRentAllowance +
            employeeData.healthAllowance +
            employeeData.travelAllowance +
            employeeData.mobileAllowance +
            employeeData.otherAllowances;
    }
    calculateSalaryComponents(employee, salaryData) {
        const { baseSalary, homeRentAllowance, healthAllowance, travelAllowance, mobileAllowance, otherAllowances, overtimeRate } = employee;
        const overtimeAmount = salaryData.overtimeHours ?
            salaryData.overtimeHours * (overtimeRate || 0) : 0;
        const totalAllowances = homeRentAllowance + healthAllowance +
            travelAllowance + mobileAllowance + otherAllowances;
        const netSalary = baseSalary + totalAllowances + overtimeAmount +
            (salaryData.bonus || 0) - (salaryData.deductions || 0);
        return {
            baseSalary,
            allowances: totalAllowances,
            overtimeHours: salaryData.overtimeHours || 0,
            overtimeAmount,
            bonus: salaryData.bonus || 0,
            deductions: salaryData.deductions || 0,
            netSalary,
        };
    }
};
exports.EmployeeService = EmployeeService;
exports.EmployeeService = EmployeeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], EmployeeService);
//# sourceMappingURL=employee.service.js.map