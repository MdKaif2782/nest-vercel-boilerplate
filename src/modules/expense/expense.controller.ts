import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
  ParseEnumPipe,
  ParseArrayPipe,
  Optional,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto, ExpenseCategory, ExpenseStatus } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseResponseDto } from './dto/expense-response.dto';
import { Request } from 'express';
import { AccessTokenGuard } from '../auth/auth.guard';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expensesService: ExpenseService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  create(@Body() createExpenseDto: CreateExpenseDto, @Req() req: Request): Promise<ExpenseResponseDto> {
    // In a real app, you'd get userId from auth context
    const request = req as any as {user:{id:string}};
    return this.expensesService.create(createExpenseDto, request.user.id);
  }

  @Get()
  async findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('search') search?: string,
    @Query('category') category?: ExpenseCategory,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: ExpenseStatus,
  ) {
    const params = {
      skip,
      take,
      search,
      category,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status,
    };

    return this.expensesService.findAll(params);
  }

  @Get('statistics')
  getStatistics() {
    return this.expensesService.getStatistics();
  }

  @Get('charts/monthly')
  getMonthlyTrend(@Query('months', new DefaultValuePipe(6), ParseIntPipe) months: number) {
    return this.expensesService.getMonthlyTrend(months);
  }

  @Get('charts/category')
  getCategoryChart() {
    return this.expensesService.getCategorySummary();
  }

  @Get('category-summary')
  getCategorySummary() {
    return this.expensesService.getCategorySummary();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ExpenseResponseDto> {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.expensesService.remove(id);
  }
}