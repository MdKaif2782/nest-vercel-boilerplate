
// src/bill/dto/create-bill.dto.ts
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
  IsEnum,
  IsInt,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BillItemDto {
  @IsString()
  productDescription: string;

  @IsOptional()
  @IsString()
  packagingDescription?: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsString()
  inventoryId: string;
}

export class CreateBillDto {
  @IsString()
  buyerPOId: string;

  @IsString()
  vatRegNo: string;

  @IsString()
  code: string;

  @IsString()
  vendorNo: string;

  @IsOptional()
  @IsDateString()
  billDate?: string;
}
// src/bill/dto/add-payment.dto.ts
import { PaymentMethod } from '@prisma/client';
// src/bill/dto/add-payment.dto.ts

export class AddPaymentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  reference?: string;
}

// src/bill/dto/bill-search.dto.ts
import { BillStatus } from '@prisma/client';


export class BillSearchDto {
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
  @IsEnum(BillStatus)
  status?: BillStatus;

  @IsOptional()
  @IsString()
  @IsIn(['billNumber', 'billDate', 'totalAmount', 'dueAmount', 'createdAt'])
  sortBy?: string = 'billDate';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}