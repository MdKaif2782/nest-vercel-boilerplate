import { PaymentMethod, PaymentType, POStatus } from '@prisma/client';
export declare class PurchaseOrderItemDto {
    productName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    taxPercentage: number;
    totalPrice: number;
}
export declare class PurchaseOrderInvestmentDto {
    investorId: string;
    investmentAmount: number;
    profitPercentage: number;
    isFullInvestment?: boolean;
}
export declare class CreatePurchaseOrderDto {
    vendorName: string;
    vendorCountry: string;
    vendorAddress: string;
    vendorContact: string;
    paymentType: PaymentType;
    totalAmount: number;
    taxAmount: number;
    dueAmount: number;
    notes?: string;
    items: PurchaseOrderItemDto[];
    investments: PurchaseOrderInvestmentDto[];
}
export declare class UpdatePurchaseOrderDto implements Partial<CreatePurchaseOrderDto> {
    vendorName?: string;
    vendorCountry?: string;
    vendorAddress?: string;
    vendorContact?: string;
    paymentType?: PaymentType;
    totalAmount?: number;
    taxAmount?: number;
    dueAmount?: number;
    notes?: string;
    status?: POStatus;
    items?: PurchaseOrderItemDto[];
    investments?: PurchaseOrderInvestmentDto[];
}
export declare class ReceivedItemDto {
    purchaseOrderItemId: string;
    receivedQuantity: number;
    expectedSalePrice: number;
}
export declare class MarkAsReceivedDto {
    receivedItems: ReceivedItemDto[];
}
export declare class PurchaseOrderQueryDto {
    page?: number;
    limit?: number;
}
export declare class CreatePurchaseOrderPaymentDto {
    amount: number;
    paymentMethod: PaymentMethod;
    reference?: string;
    notes?: string;
    paymentDate?: string;
}
export declare class PurchaseOrderPaymentResponseDto {
    id: string;
    amount: number;
    paymentDate: Date;
    paymentMethod: PaymentMethod;
    reference?: string;
    notes?: string;
    purchaseOrderId: string;
    createdAt: Date;
}
export declare class PaymentSummaryDto {
    totalAmount: number;
    totalPaid: number;
    remainingDue: number;
    paymentCount: number;
    payments: PurchaseOrderPaymentResponseDto[];
}
