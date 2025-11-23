import { IsOptional, IsDateString, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class DateRangeDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class PeriodQueryDto {
  @IsOptional()
  @IsEnum(['day', 'week', 'month', 'quarter', 'year'])
  period?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  year?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Min(12)
  @Type(() => Number)
  month?: number;
}

export class PaginationQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Min(100)
  @Type(() => Number)
  limit?: number = 20;
}