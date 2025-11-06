import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentType, POStatus } from '@prisma/client';

export class PurchaseOrderItemDto {
  @ApiProperty({ description: 'Product name' })
  @IsString()
  productName: string;

  @ApiPropertyOptional({ description: 'Product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Quantity', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Unit price', minimum: 0 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ description: 'Tax percentage', minimum: 0 })
  @IsNumber()
  @Min(0)
  taxPercentage: number;

  @ApiProperty({ description: 'Total price', minimum: 0 })
  @IsNumber()
  @Min(0)
  totalPrice: number;
}

export class PurchaseOrderInvestmentDto {
  @ApiProperty({ description: 'Investor ID' })
  @IsString()
  investorId: string;

  @ApiProperty({ description: 'Investment amount', minimum: 0 })
  @IsNumber()
  @Min(0)
  investmentAmount: number;

  @ApiProperty({ description: 'Profit percentage', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  profitPercentage: number;

  @ApiPropertyOptional({ description: 'Is full investment', default: false })
  @IsOptional()
  @IsBoolean()
  isFullInvestment?: boolean;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ description: 'Vendor name' })
  @IsString()
  vendorName: string;

  @ApiProperty({ description: 'Vendor country' })
  @IsString()
  vendorCountry: string;

  @ApiProperty({ description: 'Vendor address' })
  @IsString()
  vendorAddress: string;

  @ApiProperty({ description: 'Vendor contact' })
  @IsString()
  vendorContact: string;

  @ApiProperty({ enum: PaymentType, description: 'Payment type' })
  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @ApiProperty({ description: 'Total amount', minimum: 0 })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({ description: 'Tax amount', minimum: 0 })
  @IsNumber()
  @Min(0)
  taxAmount: number;

  @ApiProperty({ description: 'Due amount', minimum: 0 })
  @IsNumber()
  @Min(0)
  dueAmount: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [PurchaseOrderItemDto], description: 'Purchase order items' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];

  @ApiProperty({ type: [PurchaseOrderInvestmentDto], description: 'Investments' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderInvestmentDto)
  investments: PurchaseOrderInvestmentDto[];

  @ApiProperty({ description: 'User ID who created the PO' })
  @IsString()
  createdBy: string;
}

export class UpdatePurchaseOrderDto implements Partial<CreatePurchaseOrderDto> {
  @ApiPropertyOptional({ description: 'Vendor name' })
  @IsOptional()
  @IsString()
  vendorName?: string;

  @ApiPropertyOptional({ description: 'Vendor country' })
  @IsOptional()
  @IsString()
  vendorCountry?: string;

  @ApiPropertyOptional({ description: 'Vendor address' })
  @IsOptional()
  @IsString()
  vendorAddress?: string;

  @ApiPropertyOptional({ description: 'Vendor contact' })
  @IsOptional()
  @IsString()
  vendorContact?: string;

  @ApiPropertyOptional({ enum: PaymentType, description: 'Payment type' })
  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  @ApiPropertyOptional({ description: 'Total amount', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @ApiPropertyOptional({ description: 'Tax amount', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiPropertyOptional({ description: 'Due amount', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dueAmount?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: POStatus, description: 'PO status' })
  @IsOptional()
  @IsEnum(POStatus)
  status?: POStatus;

  @ApiPropertyOptional({ type: [PurchaseOrderItemDto], description: 'Purchase order items' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items?: PurchaseOrderItemDto[];

  @ApiPropertyOptional({ type: [PurchaseOrderInvestmentDto], description: 'Investments' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderInvestmentDto)
  investments?: PurchaseOrderInvestmentDto[];
}

export class ReceivedItemDto {
  @ApiProperty({ description: 'Purchase order item ID' })
  @IsString()
  purchaseOrderItemId: string;

  @ApiProperty({ description: 'Received quantity', minimum: 0 })
  @IsNumber()
  @Min(0)
  receivedQuantity: number;

  @ApiProperty({ description: 'Expected sale price', minimum: 0 })
  @IsNumber()
  @Min(0)
  expectedSalePrice: number;
}

export class MarkAsReceivedDto {
  @ApiProperty({ type: [ReceivedItemDto], description: 'Received items' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReceivedItemDto)
  receivedItems: ReceivedItemDto[];
}

export class PurchaseOrderQueryDto {
  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}