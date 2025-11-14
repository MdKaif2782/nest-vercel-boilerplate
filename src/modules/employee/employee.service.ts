import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto';
import { UpdateEmployeeDto } from './dto';
import { CreateSalaryDto } from './dto';
import { PaySalaryDto } from './dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class EmployeeService {
  constructor(private prisma: DatabaseService) { }

  private async generateEmployeeId(): Promise<string> {
    const lastEmployee = await this.prisma.employee.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { employeeId: true }
    });

    if (!lastEmployee) return 'EMP-00001';

    const lastNumber = parseInt(lastEmployee.employeeId.split('-')[1]) || 0;
    const nextNumber = lastNumber + 1;

    return `EMP-${nextNumber.toString().padStart(5, '0')}`;
  }

  async create(createEmployeeDto: CreateEmployeeDto) {
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

  async findOne(id: string) {
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
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    await this.findOne(id); // Check if employee exists

    return this.prisma.employee.update({
      where: { id },
      data: updateEmployeeDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if employee exists

    return this.prisma.employee.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async createSalary(createSalaryDto: CreateSalaryDto) {
    const employee = await this.findOne(createSalaryDto.employeeId);

    // Check if salary already exists for this month/year
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

    // Calculate salary components
    const salaryComponents = this.calculateSalaryComponents(employee, createSalaryDto);

    return this.prisma.salary.create({
      data: {
        ...createSalaryDto,
        ...salaryComponents,
      },
    });
  }

  async paySalary(paySalaryDto: PaySalaryDto) {
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
      throw new NotFoundException('Salary record not found');
    }

    if (salary.status === 'PAID') {
      throw new Error('Salary already paid');
    }

    // Update salary status
    const updatedSalary = await this.prisma.salary.update({
      where: { id: salary.id },
      data: {
        status: 'PAID',
        paidDate: paySalaryDto.paidDate,
      },
    });

    // Create expense record for the salary payment
    await this.prisma.expense.create({
      data: {
        title: `Salary - ${salary.employee.name} - ${paySalaryDto.month}/${paySalaryDto.year}`,
        description: `Salary payment for ${salary.employee.name}`,
        amount: salary.netSalary,
        category: 'OTHER',
        expenseDate: paySalaryDto.paidDate,
        recordedBy: paySalaryDto.employeeId,
      },
    });

    return updatedSalary;
  }

  async getSalaries(employeeId: string) {
    await this.findOne(employeeId); // Check if employee exists

    return this.prisma.salary.findMany({
      where: { employeeId },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ],
    });
  }

  async getSalaryReport(month: number, year: number) {
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

  // NEW METHOD: Generate Monthly Salaries for All Active Employees
  async generateMonthlySalaries(month?: number, year?: number) {
    const currentDate = new Date();
    const currentMonth = month || currentDate.getMonth() + 1;
    const currentYear = year || currentDate.getFullYear();

    // Get all active employees
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
      created: [] as any[],
      skipped: [] as any[],
      errors: [] as any[]
    };

    // Generate salary for each active employee
    for (const employee of activeEmployees) {
      try {
        // Check if salary already exists for this month
        const existingSalary = employee.salaries.find(s => 
          s.month === currentMonth && s.year === currentYear
        );

        if (existingSalary) {
          results.skipped.push({
            employeeId: employee.id,
            employeeName: employee.name,
            reason: 'Salary record already exists for this month'
          });
          continue;
        }

        // Create salary record with zero overtime, bonus, deductions
        const salaryData: CreateSalaryDto = {
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

      } catch (error) {
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

  // New Methods for Payables and Statistics

  async getPayables(month?: number, year?: number) {
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

  async getSalaryStatistics(month?: number, year?: number) {
    const currentDate = new Date();
    const currentMonth = month || currentDate.getMonth() + 1;
    const currentYear = year || currentDate.getFullYear();

    // Current month statistics
    const currentMonthSalaries = await this.prisma.salary.findMany({
      where: {
        month: currentMonth,
        year: currentYear
      }
    });

    // Year-to-date statistics
    const ytdSalaries = await this.prisma.salary.findMany({
      where: {
        year: currentYear,
        status: 'PAID'
      }
    });

    // Total statistics (all time)
    const allTimeSalaries = await this.prisma.salary.findMany({
      where: {
        status: 'PAID'
      }
    });

    // Calculate totals
    const currentMonthTotal = currentMonthSalaries
      .filter(s => s.status === 'PAID')
      .reduce((sum, salary) => sum + salary.netSalary, 0);

    const currentMonthPending = currentMonthSalaries
      .filter(s => s.status === 'PENDING')
      .reduce((sum, salary) => sum + salary.netSalary, 0);

    const ytdTotal = ytdSalaries.reduce((sum, salary) => sum + salary.netSalary, 0);
    const allTimeTotal = allTimeSalaries.reduce((sum, salary) => sum + salary.netSalary, 0);

    // Employee counts
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

  async getMonthlyTrends(year?: number) {
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

    // Format the data for charts
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

  private calculateTotalSalary(employeeData: CreateEmployeeDto | UpdateEmployeeDto): number {
    return employeeData.baseSalary +
      employeeData.homeRentAllowance +
      employeeData.healthAllowance +
      employeeData.travelAllowance +
      employeeData.mobileAllowance +
      employeeData.otherAllowances;
  }

  private calculateSalaryComponents(employee: any, salaryData: CreateSalaryDto) {
    const {
      baseSalary,
      homeRentAllowance,
      healthAllowance,
      travelAllowance,
      mobileAllowance,
      otherAllowances,
      overtimeRate
    } = employee;

    // Calculate overtime amount
    const overtimeAmount = salaryData.overtimeHours ?
      salaryData.overtimeHours * (overtimeRate || 0) : 0;

    // Calculate total allowances
    const totalAllowances = homeRentAllowance + healthAllowance +
      travelAllowance + mobileAllowance + otherAllowances;

    // Calculate net salary
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
}