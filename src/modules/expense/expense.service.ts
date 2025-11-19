import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDto, ExpenseCategory, PaymentMethod, ExpenseStatus } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseResponseDto } from './dto/expense-response.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ExpenseService {
  constructor(private prisma: DatabaseService) {}

  async create(createExpenseDto: CreateExpenseDto, userId: string): Promise<ExpenseResponseDto> {
    const expense = await this.prisma.expense.create({
      data: {
        ...createExpenseDto,
        recordedBy: userId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return this.mapToResponseDto(expense);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    search?: string;
    category?: ExpenseCategory;
    startDate?: Date;
    endDate?: Date;
    status?: ExpenseStatus;
  }): Promise<{ expenses: ExpenseResponseDto[]; total: number }> {
    const { skip, take, search, category, startDate, endDate, status } = params;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = startDate;
      if (endDate) where.expenseDate.lte = endDate;
    }

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        skip,
        take: Number(take),
        where,
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          expenseDate: 'desc',
        },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      expenses: expenses.map(expense => this.mapToResponseDto(expense)),
      total,
    };
  }

  async findOne(id: string): Promise<ExpenseResponseDto> {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    return this.mapToResponseDto(expense);
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<ExpenseResponseDto> {
    const existingExpense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!existingExpense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    const expense = await this.prisma.expense.update({
      where: { id },
      data: updateExpenseDto,
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return this.mapToResponseDto(expense);
  }

  async remove(id: string): Promise<void> {
    const existingExpense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!existingExpense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    await this.prisma.expense.delete({
      where: { id },
    });
  }

  async getStatistics() {
    const totalExpenses = await this.prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const approvedExpenses = await this.prisma.expense.aggregate({
      where: {
        status: ExpenseStatus.APPROVED,
      },
      _sum: {
        amount: true,
      },
    });

    const pendingExpenses = await this.prisma.expense.aggregate({
      where: {
        status: ExpenseStatus.PENDING,
      },
      _sum: {
        amount: true,
      },
    });

    const averageExpense = totalExpenses._count.id > 0 
      ? totalExpenses._sum.amount / totalExpenses._count.id 
      : 0;

    return {
      total: totalExpenses._sum.amount || 0,
      transactionCount: totalExpenses._count.id,
      approved: approvedExpenses._sum.amount || 0,
      pending: pendingExpenses._sum.amount || 0,
      average: averageExpense,
    };
  }

  async getMonthlyTrend(months: number = 6) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const monthlyExpenses = await this.prisma.expense.groupBy({
      by: ['expenseDate'],
      where: {
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Group by month-year and format for chart
    const monthlyData = monthlyExpenses.reduce((acc, expense) => {
      const monthYear = expense.expenseDate.toISOString().substring(0, 7); // YYYY-MM
      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear] += expense._sum.amount;
      return acc;
    }, {});

    return Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount,
    }));
  }

  async getCategorySummary() {
    const categoryData = await this.prisma.expense.groupBy({
      by: ['category'],
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const totalAmount = categoryData.reduce((sum, item) => sum + (item._sum.amount || 0), 0);

    return categoryData.map(item => ({
      category: item.category,
      total: item._sum.amount || 0,
      count: item._count.id,
      percentage: totalAmount > 0 ? ((item._sum.amount || 0) / totalAmount) * 100 : 0,
    }));
  }

  private mapToResponseDto(expense: any): ExpenseResponseDto {
    return {
      id: expense.id,
      title: expense.title,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      expenseDate: expense.expenseDate,
      paymentMethod: expense.paymentMethod,
      status: expense.status,
      notes: expense.notes,
      recordedBy: expense.recordedBy,
      userName: expense.user?.name,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }
}