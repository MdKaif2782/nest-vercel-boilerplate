import { Bill, Challan, Quotation } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
export interface QuotationWithItems extends Quotation {
    items: Array<{
        id: string;
        quantity: number;
        mrp: number;
        unitPrice: number;
        packagePrice: number;
        taxPercentage: number;
        totalPrice: number;
        inventory: {
            id: string;
            productCode: string;
            productName: string;
            description?: string;
            imageUrl?: string;
        };
    }>;
}
export interface BillWithRelations extends Bill {
    items: Array<{
        id: string;
        productDescription: string;
        packagingDescription?: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        inventory: {
            id: string;
            productCode: string;
            productName: string;
            description?: string;
        };
    }>;
    payments: Array<{
        id: string;
        amount: number;
        paymentDate: Date;
        paymentMethod: string;
        reference?: string;
    }>;
    buyerPO: {
        id: string;
        poNumber: string;
        poDate: Date;
        quotation: {
            companyName: string;
            companyAddress: string;
            companyContact?: string;
            contactPersonName?: string;
        };
    };
    user: {
        name: string;
    };
}
export interface ChallanWithItems extends Challan {
    items: Array<{
        id: string;
        quantity: number;
        inventory: {
            id: string;
            productCode: string;
            productName: string;
            description?: string;
        };
    }>;
    buyerPurchaseOrder: {
        id: string;
        poNumber: string;
        poDate: Date;
        bills: Array<{
            id: string;
            billNumber: string;
            billDate: Date;
            vatRegNo: string;
            code: string;
            vendorNo: string;
        }>;
        quotation: {
            companyName: string;
            companyAddress: string;
            companyContact?: string;
            contactPersonName?: string;
        };
    };
}
export declare class PdfService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: DatabaseService);
    generateQuotationPdf(quotationId: string): Promise<Buffer>;
    private generateLatexQuotationTemplate;
    private copyAssets;
    private createPlaceholderImage;
    private compileLatex;
    generateBillPdf(billId: string): Promise<Buffer>;
    private generateLatexBillTemplate;
    generateChallanPdf(challanId: string): Promise<Buffer>;
    private generateLatexChallanTemplate;
    private numberToWords;
    private convertCrore;
    private convertLakh;
    private convertThousand;
    private convertHundred;
}
