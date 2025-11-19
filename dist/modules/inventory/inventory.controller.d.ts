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
}
