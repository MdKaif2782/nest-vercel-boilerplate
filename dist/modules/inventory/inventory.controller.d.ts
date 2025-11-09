import { InventorySearchDto } from '../inventory/dto';
import { UpdateInventoryDto } from '../inventory/dto/update-inventory.dto';
import { InventoryService } from '../inventory/inventory.service';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
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
}
