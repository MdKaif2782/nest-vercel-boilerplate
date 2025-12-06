import { QuotationStatus } from '@prisma/client';
export declare class UpdateQuotationDto {
    companyName?: string;
    companyAddress?: string;
    companyContact?: string;
    contactPersonName?: string;
    subject?: string;
    body?: string;
    generalTerms?: string;
    paymentTerms?: string;
    deliveryTerms?: string;
    deliveryDays?: number;
    totalAmount?: number;
    taxAmount?: number;
    moneyInWords?: string;
    validUntil?: string;
    status?: QuotationStatus;
}
export declare class AcceptQuotationItemDto {
    inventoryId: string;
    unitPrice?: number;
    packagePrice?: number;
    quantity?: number;
    mrp?: number;
    taxPercentage?: number;
}
export declare class AcceptQuotationDto {
    poDate?: string;
    pdfUrl?: string;
    externalUrl?: string;
    commission?: number;
    items?: AcceptQuotationItemDto[];
}
export declare class QuotationSearchDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: QuotationStatus;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
