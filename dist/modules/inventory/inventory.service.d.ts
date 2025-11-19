import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { DatabaseService } from '../database/database.service';
import { InventorySearchDto } from './dto';
export declare class InventoryService {
    private prisma;
    constructor(prisma: DatabaseService);
    findAll(searchDto: InventorySearchDto): Promise<{
        data: ({
            purchaseOrder: {
                poNumber: string;
                vendorName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            purchaseOrderId: string;
            description: string | null;
            productCode: string;
            barcode: string | null;
            productName: string;
            quantity: number;
            purchasePrice: number;
            expectedSalePrice: number;
            minStockLevel: number | null;
            maxStockLevel: number | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        purchaseOrder: {
            poNumber: string;
            vendorName: string;
            vendorCountry: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        purchaseOrderId: string;
        description: string | null;
        productCode: string;
        barcode: string | null;
        productName: string;
        quantity: number;
        purchasePrice: number;
        expectedSalePrice: number;
        minStockLevel: number | null;
        maxStockLevel: number | null;
    }>;
    update(id: string, updateInventoryDto: UpdateInventoryDto): Promise<{
        purchaseOrder: {
            poNumber: string;
            vendorName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        purchaseOrderId: string;
        description: string | null;
        productCode: string;
        barcode: string | null;
        productName: string;
        quantity: number;
        purchasePrice: number;
        expectedSalePrice: number;
        minStockLevel: number | null;
        maxStockLevel: number | null;
    }>;
    getLowStockItems(threshold?: number): Promise<({
        purchaseOrder: {
            poNumber: string;
            vendorName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        purchaseOrderId: string;
        description: string | null;
        productCode: string;
        barcode: string | null;
        productName: string;
        quantity: number;
        purchasePrice: number;
        expectedSalePrice: number;
        minStockLevel: number | null;
        maxStockLevel: number | null;
    })[]>;
}
