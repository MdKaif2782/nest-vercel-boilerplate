export declare class BillItemDto {
    productDescription: string;
    packagingDescription?: string;
    quantity: number;
    unitPrice: number;
    inventoryId: string;
}
export declare class CreateBillDto {
    buyerPOId: string;
    vatRegNo: string;
    code: string;
    vendorNo: string;
    billDate?: string;
}
import { PaymentMethod } from '@prisma/client';
export declare class AddPaymentDto {
    amount: number;
    paymentMethod: PaymentMethod;
    reference?: string;
}
import { BillStatus } from '@prisma/client';
export declare class BillSearchDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: BillStatus;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
