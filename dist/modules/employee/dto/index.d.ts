export declare class CreateEmployeeDto {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    designation: string;
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
export declare class UpdateEmployeeDto {
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
export declare class CreateSalaryDto {
    employeeId: string;
    month: number;
    year: number;
    overtimeHours?: number;
    bonus?: number;
    deductions?: number;
}
export declare class PaySalaryDto {
    employeeId: string;
    month: number;
    year: number;
    paidDate: string;
}
export declare class SalaryPaymentDto {
    salaryId: string;
    paidDate: string;
    notes?: string;
}
