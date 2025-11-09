// src/quotation/dto/create-quotation.dto.ts
import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuotationStatus } from '@prisma/client';

export class QuotationItemDto {
  @IsString()
  inventoryId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  mrp: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  packagePrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number;
}

export class CreateQuotationDto {
  @IsString()
  companyName: string;

  @IsString()
  companyAddress: string;

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
  totalAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount: number;

  @IsOptional()
  @IsString()
  moneyInWords?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items: QuotationItemDto[];
}