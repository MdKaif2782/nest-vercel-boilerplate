import { ExpenseCategory, PaymentMethod, ExpenseStatus } from '../dto/create-expense.dto';

export class Expense {
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
  createdAt: Date;
  updatedAt: Date;
}