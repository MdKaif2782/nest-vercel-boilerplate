import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { InvestorService } from './investor.service';
import {
  CreateInvestorDto,
  UpdateInvestorDto,
  InvestorQueryDto,
} from './dto';

@Controller('investors')
export class InvestorController {
  constructor(private readonly investorService: InvestorService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createInvestor(@Body() createInvestorDto: CreateInvestorDto) {
    return this.investorService.createInvestor(createInvestorDto);
  }

  @Get()
  async getAllInvestors(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.investorService.getAllInvestors(page, limit, search);
  }

  @Get('statistics')
  async getInvestorStatistics() {
    return this.investorService.getInvestorStatistics();
  }

  @Get('performance')
  async getInvestorPerformanceReport() {
    return this.investorService.getInvestorPerformanceReport();
  }

  @Get('equity-distribution')
  async getEquityDistribution() {
    return this.investorService.getEquityDistribution();
  }

  @Get(':id')
  async getInvestorById(@Param('id') id: string) {
    return this.investorService.getInvestorById(id);
  }

  @Put(':id')
  async updateInvestor(
    @Param('id') id: string,
    @Body() updateInvestorDto: UpdateInvestorDto,
  ) {
    return this.investorService.updateInvestor(id, updateInvestorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteInvestor(@Param('id') id: string) {
    return this.investorService.deleteInvestor(id);
  }

  @Put(':id/toggle-status')
  async toggleInvestorStatus(@Param('id') id: string) {
    return this.investorService.toggleInvestorStatus(id);
  }
}