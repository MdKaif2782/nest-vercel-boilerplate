import { ExpenseService } from './expense.service';
import { CreateExpenseDto, ExpenseCategory, ExpenseStatus } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseResponseDto } from './dto/expense-response.dto';
import { Request } from 'express';
export declare class ExpenseController {
    private readonly expensesService;
    constructor(expensesService: ExpenseService);
    create(createExpenseDto: CreateExpenseDto, req: Request): Promise<ExpenseResponseDto>;
    findAll(skip: number, take: number, search?: string, category?: ExpenseCategory, startDate?: string, endDate?: string, status?: ExpenseStatus): Promise<{
        expenses: ExpenseResponseDto[];
        total: number;
    }>;
    getStatistics(): Promise<{
        total: number;
        transactionCount: number;
        approved: number;
        pending: number;
        average: number;
    }>;
    getMonthlyTrend(months: number): Promise<{
        month: string;
        amount: unknown;
    }[]>;
    getCategoryChart(): Promise<{
        category: import(".prisma/client").$Enums.ExpenseCategory;
        total: number;
        count: number;
        percentage: number;
    }[]>;
    getCategorySummary(): Promise<{
        category: import(".prisma/client").$Enums.ExpenseCategory;
        total: number;
        count: number;
        percentage: number;
    }[]>;
    findOne(id: string): Promise<ExpenseResponseDto>;
    update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<ExpenseResponseDto>;
    remove(id: string): Promise<void>;
}
