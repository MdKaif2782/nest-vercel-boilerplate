// src/quotation/dto/update-quotation.dto.ts
import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  IsEnum,
  IsDateString,
  IsIn,
} from 'class-validator';
import { QuotationStatus } from '@prisma/client';

export class UpdateQuotationDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companyAddress?: string;

  @IsOptional()
  @IsString()
  companyContact?: string;

  @IsOptional()
  @IsString()
  deliveryTerms?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  deliveryDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @IsOptional()
  @IsString()
  moneyInWords?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsEnum(QuotationStatus)
  status?: QuotationStatus;
}

// src/quotation/dto/accept-quotation.dto.ts

export class AcceptQuotationDto {
  @IsOptional()
  @IsDateString()
  poDate?: string;

  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @IsOptional()
  @IsString()
  externalUrl?: string;
}

// src/quotation/dto/quotation-search.dto.ts
import { Type } from 'class-transformer';

export class QuotationSearchDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(QuotationStatus)
  status?: QuotationStatus;

  @IsOptional()
  @IsString()
  @IsIn(['quotationNumber', 'companyName', 'totalAmount', 'createdAt', 'validUntil'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}