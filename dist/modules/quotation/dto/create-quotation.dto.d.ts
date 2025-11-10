export declare class QuotationItemDto {
    inventoryId: string;
    quantity: number;
    mrp: number;
    unitPrice: number;
    packagePrice: number;
    taxPercentage?: number;
}
export declare class CreateQuotationDto {
    companyName: string;
    companyAddress: string;
    companyContact?: string;
    deliveryTerms?: string;
    deliveryDays?: number;
    totalAmount: number;
    taxAmount: number;
    moneyInWords?: string;
    validUntil?: string;
    items: QuotationItemDto[];
}
