import { PaymentMethod } from '@prisma/client';
export declare class RetailSaleQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    paymentMethod?: PaymentMethod;
}
