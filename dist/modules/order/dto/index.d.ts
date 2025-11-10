export declare class CreateOrderDto {
    quotationId: string;
    poDate?: Date;
    pdfUrl?: string;
    externalUrl?: string;
}
export declare class UpdateOrderDto {
    poDate?: Date;
    pdfUrl?: string;
    externalUrl?: string;
}
export declare class OrderStatusUpdateDto {
    status: string;
}
export declare class OrderSummaryDto {
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
export declare class InvestorProfitSummaryDto {
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
export declare class OrderProductDto {
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
export declare class OrderTimelineEventDto {
    event: string;
    date: Date;
    description: string;
    status: string;
}
