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
    contactPersonName?: string;
    subject?: string;
    body?: string;
    generalTerms?: string;
    paymentTerms?: string;
    deliveryTerms?: string;
    deliveryDays?: number;
    totalAmount: number;
    taxAmount: number;
    moneyInWords?: string;
    signatureImageUrl?: string;
    validUntil?: string;
    items: QuotationItemDto[];
}
