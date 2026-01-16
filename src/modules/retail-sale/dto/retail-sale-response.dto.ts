import { PaymentMethod } from '@prisma/client';

export class RetailSaleItemResponseDto {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  inventory: {
    id: string;
    productCode: string;
    productName: string;
    description?: string;
  };
}

export class RetailSaleResponseDto {
  id: string;
  saleNumber: string;
  saleDate: Date;
  customerName?: string;
  customerPhone?: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  items: RetailSaleItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class RetailSaleSummaryDto {
  totalSales: number;
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionValue: number;
  totalItemsSold: number;
  cashSales: number;
  cardSales: number;
  bankTransferSales: number;
  chequeSales: number;
}

export class TopSellingProductDto {
  productCode: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export class DailySalesDto {
  date: string;
  totalSales: number;
  totalTransactions: number;
  revenue: number;
}

export class RetailAnalyticsDto {
  summary: RetailSaleSummaryDto;
  topSellingProducts: TopSellingProductDto[];
  dailySales: DailySalesDto[];
  paymentMethodBreakdown: {
    method: PaymentMethod;
    count: number;
    amount: number;
    percentage: number;
  }[];
}
