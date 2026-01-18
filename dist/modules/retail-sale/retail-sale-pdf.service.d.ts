import { DatabaseService } from '../database/database.service';
export declare class RetailSalePdfService {
    private readonly prisma;
    constructor(prisma: DatabaseService);
    generateSalesInvoice(retailSaleId: string): Promise<Buffer>;
    generateReceipt(retailSaleId: string): Promise<Buffer>;
}
