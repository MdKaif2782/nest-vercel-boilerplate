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
exports.ExpenseService = void 0;
const common_1 = require("@nestjs/common");
const create_expense_dto_1 = require("./dto/create-expense.dto");
const database_service_1 = require("../database/database.service");
let ExpenseService = class ExpenseService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createExpenseDto, userId) {
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
    async findAll(params) {
        const { skip, take, search, category, startDate, endDate, status } = params;
        const where = {};
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
            if (startDate)
                where.expenseDate.gte = startDate;
            if (endDate)
                where.expenseDate.lte = endDate;
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Expense with ID ${id} not found`);
        }
        return this.mapToResponseDto(expense);
    }
    async update(id, updateExpenseDto) {
        const existingExpense = await this.prisma.expense.findUnique({
            where: { id },
        });
        if (!existingExpense) {
            throw new common_1.NotFoundException(`Expense with ID ${id} not found`);
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
    async remove(id) {
        const existingExpense = await this.prisma.expense.findUnique({
            where: { id },
        });
        if (!existingExpense) {
            throw new common_1.NotFoundException(`Expense with ID ${id} not found`);
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
                status: create_expense_dto_1.ExpenseStatus.APPROVED,
            },
            _sum: {
                amount: true,
            },
        });
        const pendingExpenses = await this.prisma.expense.aggregate({
            where: {
                status: create_expense_dto_1.ExpenseStatus.PENDING,
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
    async getMonthlyTrend(months = 6) {
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
        const monthlyData = monthlyExpenses.reduce((acc, expense) => {
            const monthYear = expense.expenseDate.toISOString().substring(0, 7);
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
    mapToResponseDto(expense) {
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
};
exports.ExpenseService = ExpenseService;
exports.ExpenseService = ExpenseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ExpenseService);
//# sourceMappingURL=expense.service.js.map