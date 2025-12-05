// src/inventory/dto/update-inventory.dto.ts
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateInventoryDto {
  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  expectedSalePrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minStockLevel?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxStockLevel?: number;

  @IsOptional()
  @IsString()
  barcode?: string;
}