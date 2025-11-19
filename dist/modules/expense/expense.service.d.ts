import { CreateExpenseDto, ExpenseCategory, ExpenseStatus } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseResponseDto } from './dto/expense-response.dto';
import { DatabaseService } from '../database/database.service';
export declare class ExpenseService {
    private prisma;
    constructor(prisma: DatabaseService);
    create(createExpenseDto: CreateExpenseDto, userId: string): Promise<ExpenseResponseDto>;
    findAll(params: {
        skip?: number;
        take?: number;
        search?: string;
        category?: ExpenseCategory;
        startDate?: Date;
        endDate?: Date;
        status?: ExpenseStatus;
    }): Promise<{
        expenses: ExpenseResponseDto[];
        total: number;
    }>;
    findOne(id: string): Promise<ExpenseResponseDto>;
    update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<ExpenseResponseDto>;
    remove(id: string): Promise<void>;
    getStatistics(): Promise<{
        total: number;
        transactionCount: number;
        approved: number;
        pending: number;
        average: number;
    }>;
    getMonthlyTrend(months?: number): Promise<{
        month: string;
        amount: unknown;
    }[]>;
    getCategorySummary(): Promise<{
        category: import(".prisma/client").$Enums.ExpenseCategory;
        total: number;
        count: number;
        percentage: number;
    }[]>;
    private mapToResponseDto;
}
