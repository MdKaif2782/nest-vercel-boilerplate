import { QuotationStatus } from '@prisma/client';
export declare class UpdateQuotationDto {
    companyName?: string;
    companyAddress?: string;
    companyContact?: string;
    deliveryTerms?: string;
    deliveryDays?: number;
    totalAmount?: number;
    taxAmount?: number;
    moneyInWords?: string;
    validUntil?: string;
    status?: QuotationStatus;
}
export declare class AcceptQuotationDto {
    poDate?: string;
    pdfUrl?: string;
    externalUrl?: string;
}
export declare class QuotationSearchDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: QuotationStatus;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
