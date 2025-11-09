export class CreateOrderDto {
  quotationId: string;
  poDate?: Date;
  pdfUrl?: string;
  externalUrl?: string;
}

export class UpdateOrderDto {
  poDate?: Date;
  pdfUrl?: string;
  externalUrl?: string;
}

export class OrderStatusUpdateDto {
  status: string;
}

export class OrderSummaryDto {
  orderId: string;
  orderNumber: string;
  quotationNumber: string;
  companyName: string;
  totalOrderedQuantity: number;
  totalDeliveredQuantity: number;
  totalBilledAmount: number;
  totalPaidAmount: number;
  totalProfitDistributed: number;
  completionPercentage: number;
  billCount: number;
  challanCount: number;
  status: string;
  createdAt: Date;
  lastUpdated: Date;
}

export class InvestorProfitSummaryDto {
  investorId: string;
  investorName: string;
  totalProfitPercentage: number;
  totalInvestmentAmount: number;
  calculatedProfit: number;
  actualDistributedProfit: number;
  purchaseOrders: {
    poNumber: string;
    profitPercentage: number;
    investmentAmount: number;
  }[];
}

export class OrderProductDto {
  productId: string;
  productCode: string;
  productName: string;
  description: string;
  orderedQuantity: number;
  deliveredQuantity: number;
  remainingQuantity: number;
  unitPrice: number;
  totalPrice: number;
  purchasePrice: number;
  expectedProfit: number;
  status: string;
}

export class OrderTimelineEventDto {
  event: string;
  date: Date;
  description: string;
  status: string;
}