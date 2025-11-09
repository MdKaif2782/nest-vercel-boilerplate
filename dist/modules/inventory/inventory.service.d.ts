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
            productCode: string;
            barcode: string | null;
            productName: string;
            description: string | null;
            quantity: number;
            purchasePrice: number;
            expectedSalePrice: number;
            minStockLevel: number | null;
            maxStockLevel: number | null;
            createdAt: Date;
            updatedAt: Date;
            purchaseOrderId: string;
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
        productCode: string;
        barcode: string | null;
        productName: string;
        description: string | null;
        quantity: number;
        purchasePrice: number;
        expectedSalePrice: number;
        minStockLevel: number | null;
        maxStockLevel: number | null;
        createdAt: Date;
        updatedAt: Date;
        purchaseOrderId: string;
    }>;
    update(id: string, updateInventoryDto: UpdateInventoryDto): Promise<{
        purchaseOrder: {
            poNumber: string;
            vendorName: string;
        };
    } & {
        id: string;
        productCode: string;
        barcode: string | null;
        productName: string;
        description: string | null;
        quantity: number;
        purchasePrice: number;
        expectedSalePrice: number;
        minStockLevel: number | null;
        maxStockLevel: number | null;
        createdAt: Date;
        updatedAt: Date;
        purchaseOrderId: string;
    }>;
    getLowStockItems(threshold?: number): Promise<({
        purchaseOrder: {
            poNumber: string;
            vendorName: string;
        };
    } & {
        id: string;
        productCode: string;
        barcode: string | null;
        productName: string;
        description: string | null;
        quantity: number;
        purchasePrice: number;
        expectedSalePrice: number;
        minStockLevel: number | null;
        maxStockLevel: number | null;
        createdAt: Date;
        updatedAt: Date;
        purchaseOrderId: string;
    })[]>;
}
