import { Quotation } from '@prisma/client';
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
export declare class PdfService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: DatabaseService);
    generateQuotationPdf(quotationId: string): Promise<Buffer>;
    private generateLatexTemplate;
    private copyAssets;
    private createPlaceholderImage;
    private compileLatex;
    private numberToWords;
    private convertCrore;
    private convertLakh;
    private convertThousand;
    private convertHundred;
}
