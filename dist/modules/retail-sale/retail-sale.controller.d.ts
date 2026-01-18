import { Response } from 'express';
import { RetailSaleService } from './retail-sale.service';
import { RetailSalePdfService } from './retail-sale-pdf.service';
import { CreateRetailSaleDto } from './dto';
export declare class RetailSaleController {
    private readonly retailSaleService;
    private readonly retailSalePdfService;
    constructor(retailSaleService: RetailSaleService, retailSalePdfService: RetailSalePdfService);
    create(createRetailSaleDto: CreateRetailSaleDto): Promise<import("./dto").RetailSaleResponseDto>;
    findAll(page?: number, limit?: number, search?: string, startDate?: string, endDate?: string, paymentMethod?: string): Promise<{
        sales: {
            id: string;
            saleNumber: string;
            saleDate: Date;
            customerName: string;
            customerPhone: string;
            subtotal: number;
            discount: number;
            tax: number;
            totalAmount: number;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            reference: string;
            notes: string;
            createdAt: Date;
            updatedAt: Date;
            items: {
                id: string;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
                inventory: {
                    id: string;
                    description: string;
                    productName: string;
                    productCode: string;
                };
            }[];
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getAnalytics(startDate?: string, endDate?: string): Promise<import("./dto").RetailAnalyticsDto>;
    findOne(id: string): Promise<import("./dto").RetailSaleResponseDto>;
    remove(id: string): Promise<{
        message: string;
    }>;
    generateInvoice(retailSaleId: string, res: Response): Promise<void>;
    generateReceipt(retailSaleId: string, res: Response): Promise<void>;
}
