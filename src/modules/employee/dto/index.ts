import { IsDateString } from "class-validator";

// create-employee.dto.ts
export class CreateEmployeeDto {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  designation: string;
  @IsDateString()
  joinDate: string;
  baseSalary: number;
  homeRentAllowance: number;
  healthAllowance: number;
  travelAllowance: number;
  mobileAllowance: number;
  otherAllowances: number;
  overtimeRate?: number;
  userId?: string;
}

// update-employee.dto.ts
export class UpdateEmployeeDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  designation?: string;
  baseSalary?: number;
  homeRentAllowance?: number;
  healthAllowance?: number;
  travelAllowance?: number;
  mobileAllowance?: number;
  otherAllowances?: number;
  overtimeRate?: number;
  isActive?: boolean;
}

// create-salary.dto.ts
export class CreateSalaryDto {
  employeeId: string;
  month: number;
  year: number;
  overtimeHours?: number;
  bonus?: number;
  deductions?: number;
}

// pay-salary.dto.ts
export class PaySalaryDto {
  employeeId: string;
  month: number;
  year: number;
  @IsDateString()
  paidDate: string;
}

// salary-payment.dto.ts
export class SalaryPaymentDto {
  salaryId: string;
  @IsDateString()
  paidDate: string;
  notes?: string;
}