import { PaymentMethod } from '@prisma/client';
export declare class RetailSaleItemDto {
    inventoryId: string;
    quantity: number;
    unitPrice: number;
}
export declare class CreateRetailSaleDto {
    items: RetailSaleItemDto[];
    paymentMethod: PaymentMethod;
    reference?: string;
    discount?: number;
    tax?: number;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
}
