import { ExpenseCategory, PaymentMethod, ExpenseStatus } from './create-expense.dto';

export class ExpenseResponseDto {
  id: string;
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: Date;
  paymentMethod: PaymentMethod;
  status: ExpenseStatus;
  notes?: string;
  recordedBy: string;
  userName?: string;
  createdAt: Date;
  updatedAt: Date;
}