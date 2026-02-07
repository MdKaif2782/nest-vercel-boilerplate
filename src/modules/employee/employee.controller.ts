import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  CreateSalaryDto,
  PaySalaryDto,
  GiveAdvanceDto,
  AdjustAdvanceDto,
} from './dto';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  EMPLOYEE CRUD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @Post()
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    try {
      const employee = await this.employeeService.create(createEmployeeDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Employee created successfully',
        data: employee,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      };
    }
  }

  @Get()
  async findAll() {
    const employees = await this.employeeService.findAll();
    return {
      statusCode: HttpStatus.OK,
      data: employees,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  AGGREGATE ROUTES (before :id to avoid conflicts)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @Get('payables/salaries')
  async getPayables(
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    try {
      const payables = await this.employeeService.getPayables(month, year);
      return { statusCode: HttpStatus.OK, data: payables };
    } catch (error) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: error.message };
    }
  }

  @Get('statistics/salaries')
  async getSalaryStatistics(
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    try {
      const statistics = await this.employeeService.getSalaryStatistics(month, year);
      return { statusCode: HttpStatus.OK, data: statistics };
    } catch (error) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: error.message };
    }
  }

  @Get('trends/salaries')
  async getMonthlyTrends(@Query('year') year: number) {
    try {
      const trends = await this.employeeService.getMonthlyTrends(year);
      return { statusCode: HttpStatus.OK, data: trends };
    } catch (error) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: error.message };
    }
  }

  @Get('reports/salaries')
  async getSalaryReport(
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    try {
      const report = await this.employeeService.getSalaryReport(month, year);
      return { statusCode: HttpStatus.OK, data: report };
    } catch (error) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: error.message };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  ADVANCE OVERVIEW (aggregate, before :id)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @Get('advances/overview')
  async getAdvanceOverview() {
    try {
      const overview = await this.employeeService.getAdvanceOverview();
      return { statusCode: HttpStatus.OK, data: overview };
    } catch (error) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: error.message };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  SALARY BULK OPERATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @Post('salaries')
  async createSalary(@Body() createSalaryDto: CreateSalaryDto) {
    try {
      const salary = await this.employeeService.createSalary(createSalaryDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Salary record created successfully',
        data: salary,
      };
    } catch (error) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: error.message };
    }
  }

  @Post('salaries/pay')
  async paySalary(@Body() paySalaryDto: PaySalaryDto) {
    try {
      const result = await this.employeeService.paySalary(paySalaryDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Salary paid successfully',
        data: result,
      };
    } catch (error) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: error.message };
    }
  }

  @Post('salaries/generate-monthly')
  async generateMonthlySalaries(
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    try {
      const result = await this.employeeService.generateMonthlySalaries(month, year);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Monthly salaries generated successfully',
        data: result,
      };
    } catch (error) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: error.message };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  INDIVIDUAL EMPLOYEE ROUTES (:id)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const employee = await this.employeeService.findOne(id);
      return { statusCode: HttpStatus.OK, data: employee };
    } catch (error) {
      return { statusCode: HttpStatus.NOT_FOUND, message: error.message };
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    try {
      const employee = await this.employeeService.update(id, updateEmployeeDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Employee updated successfully',
        data: employee,
      };
    } catch (error) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: error.message };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.employeeService.remove(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Employee deactivated successfully',
      };
    } catch (error) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: error.message };
    }
  }

  // ── Salaries per employee ──

  @Get(':id/salaries')
  async getSalaries(@Param('id') id: string) {
    try {
      const salaries = await this.employeeService.getSalaries(id);
      return { statusCode: HttpStatus.OK, data: salaries };
    } catch (error) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: error.message };
    }
  }

  @Get(':id/salary-preview')
  async getSalaryPreview(
    @Param('id') id: string,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    try {
      const preview = await this.employeeService.getSalaryPreview(id, month, year);
      return { statusCode: HttpStatus.OK, data: preview };
    } catch (error) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: error.message };
    }
  }

  // ── Advances per employee ──

  @Post(':id/advance')
  async giveAdvance(
    @Param('id') id: string,
    @Body() dto: GiveAdvanceDto,
  ) {
    try {
      const result = await this.employeeService.giveAdvance(id, dto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Advance given successfully',
        data: result,
      };
    } catch (error) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: error.message };
    }
  }

  @Post(':id/advance/adjust')
  async adjustAdvance(
    @Param('id') id: string,
    @Body() dto: AdjustAdvanceDto,
  ) {
    try {
      const result = await this.employeeService.adjustAdvance(id, dto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Advance adjusted successfully',
        data: result,
      };
    } catch (error) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: error.message };
    }
  }

  @Get(':id/advances')
  async getAdvanceHistory(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    try {
      const history = await this.employeeService.getAdvanceHistory(id, page, limit);
      return { statusCode: HttpStatus.OK, data: history };
    } catch (error) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: error.message };
    }
  }
}