import { DatabaseService } from '../database/database.service';
import { CreateRetailSaleDto, RetailSaleQueryDto, RetailSaleResponseDto, RetailAnalyticsDto } from './dto';
export declare class RetailSaleService {
    private prisma;
    constructor(prisma: DatabaseService);
    createRetailSale(createRetailSaleDto: CreateRetailSaleDto): Promise<RetailSaleResponseDto>;
    getAllRetailSales(query: RetailSaleQueryDto): Promise<{
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
    getRetailSaleById(id: string): Promise<RetailSaleResponseDto>;
    getRetailAnalytics(startDate?: string, endDate?: string): Promise<RetailAnalyticsDto>;
    private generateSaleNumber;
    deleteRetailSale(id: string): Promise<{
        message: string;
    }>;
}
