export class CreateExpenseDto {
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: Date;
  paymentMethod: PaymentMethod;
  status: ExpenseStatus;
  notes?: string;
}

export enum ExpenseCategory {
  ELECTRICITY = 'ELECTRICITY',
  RENT = 'RENT',
  TRAVEL = 'TRAVEL',
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
  MAINTENANCE = 'MAINTENANCE',
  INTERNET = 'INTERNET',
  OTHER = 'OTHER'
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
  CARD = 'CARD'
}

export enum ExpenseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}