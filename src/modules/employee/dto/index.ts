import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';

// ──────────────── Employee DTOs ────────────────

export class CreateEmployeeDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  address?: string;

  @IsString()
  designation: string;

  @IsDateString()
  joinDate: string;

  @IsNumber()
  baseSalary: number;

  @IsNumber()
  homeRentAllowance: number;

  @IsNumber()
  healthAllowance: number;

  @IsNumber()
  travelAllowance: number;

  @IsNumber()
  mobileAllowance: number;

  @IsNumber()
  otherAllowances: number;

  @IsOptional() @IsNumber()
  overtimeRate?: number;

  @IsOptional() @IsString()
  userId?: string;
}

export class UpdateEmployeeDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  email?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  address?: string;

  @IsOptional() @IsString()
  designation?: string;

  @IsOptional() @IsNumber()
  baseSalary?: number;

  @IsOptional() @IsNumber()
  homeRentAllowance?: number;

  @IsOptional() @IsNumber()
  healthAllowance?: number;

  @IsOptional() @IsNumber()
  travelAllowance?: number;

  @IsOptional() @IsNumber()
  mobileAllowance?: number;

  @IsOptional() @IsNumber()
  otherAllowances?: number;

  @IsOptional() @IsNumber()
  overtimeRate?: number;

  @IsOptional()
  isActive?: boolean;
}

// ──────────────── Salary DTOs ────────────────

export class CreateSalaryDto {
  @IsString()
  employeeId: string;

  @IsNumber()
  month: number;

  @IsNumber()
  year: number;

  @IsOptional() @IsNumber()
  overtimeHours?: number;

  @IsOptional() @IsNumber()
  bonus?: number;

  @IsOptional() @IsNumber()
  deductions?: number;
}

export class PaySalaryDto {
  @IsString()
  employeeId: string;

  @IsNumber()
  month: number;

  @IsNumber()
  year: number;

  @IsDateString()
  paidDate: string;

  /** How much advance to deduct. 0 = no deduction. Omit to auto-deduct full advance balance (up to grossSalary). */
  @IsOptional() @IsNumber() @Min(0)
  advanceDeduction?: number;

  @IsOptional() @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional() @IsString()
  reference?: string;

  @IsOptional() @IsString()
  notes?: string;
}

// ──────────────── Advance DTOs ────────────────

export class GiveAdvanceDto {
  @IsNumber() @Min(1)
  amount: number;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional() @IsString()
  reference?: string;
}

export class AdjustAdvanceDto {
  /** Positive = increase balance (gave more), Negative = decrease balance (manual correction) */
  @IsNumber()
  amount: number;

  @IsString()
  description: string;
}

// ──────────────── Legacy ────────────────

export class SalaryPaymentDto {
  @IsString()
  salaryId: string;

  @IsDateString()
  paidDate: string;

  @IsOptional() @IsString()
  notes?: string;
}

// ──────────────── Bulk Salary Upload ────────────────

export class BulkSalaryEntryDto {
  /** Row-level employee identifier (maps to Employee.employeeId e.g. "EMP-00001" or numeric index) */
  @IsOptional() @IsString()
  employeeId?: string;

  @IsString()
  employeeName: string;

  /** Basic salary from the sheet */
  @IsNumber()
  basic: number;

  @IsOptional() @IsDateString()
  joiningDate?: string;

  @IsOptional() @IsString()
  designation?: string;

  /** The main monthly salary column (e.g. juneSalary). May differ from basic. */
  @IsNumber()
  monthlySalary: number;

  /** Medical + mobile allowance (mapped to mobileAllowance) */
  @IsOptional() @IsNumber()
  medicalMobile?: number;

  /** Bonus / boksis for the month */
  @IsOptional() @IsNumber()
  bonusBoksis?: number;

  /** Per-day rate (will be recalculated server-side if needed) */
  @IsOptional() @IsNumber()
  perDay?: number;

  /** Number of days present (0 = full month assumed) */
  @IsOptional() @IsNumber()
  dailyPresent?: number;

  /** Total payable from the sheet (server will recalculate) */
  @IsOptional() @IsNumber()
  totalPayable?: number;

  /** New advance given this month (>0 means new advance) */
  @IsOptional() @IsNumber()
  advance?: number;

  /** Mode of payment: "0" = CASH, "1" = BANK_TRANSFER, "2" = CHEQUE, "3" = CARD */
  @IsOptional() @IsString()
  modeOfPayment?: string;

  /** Balance column from excel (negative = recovery/deduction) */
  @IsOptional() @IsNumber()
  balance?: number;

  /** Signature column — ignored by backend */
  @IsOptional()
  signature?: any;
}

export class BulkSalaryUploadDto {
  @IsNumber()
  month: number;

  @IsNumber()
  year: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkSalaryEntryDto)
  entries: BulkSalaryEntryDto[];
}