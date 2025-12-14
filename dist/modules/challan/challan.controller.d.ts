import { ChallanService } from './challan.service';
import { CreateChallanDto, UpdateChallanStatusDto, DispatchBPODto } from './dto';
export declare class ChallanController {
    private readonly challanService;
    constructor(challanService: ChallanService);
    getPendingBPOs(): Promise<{
        id: string;
        poNumber: string;
        companyName: string;
        totalQuantity: number;
        dispatchedQuantity: number;
        remainingQuantity: number;
        hasChallan: boolean;
        challanStatus: import(".prisma/client").$Enums.ChallanStatus;
        items: {
            inventoryId: string;
            productName: string;
            productCode: string;
            orderedQuantity: number;
            availableQuantity: number;
            unitPrice: number;
        }[];
    }[]>;
    getDispatchSummary(): Promise<{
        totalBPOs: number;
        fullyDispatched: number;
        partiallyDispatched: number;
        notDispatched: number;
        totalItemsOrdered: number;
        totalItemsDispatched: number;
        totalValueOrdered: number;
        totalValueDispatched: number;
        bpoDetails: import("./dto").BpoSummaryDto[];
    }>;
    markAsDispatched(dto: DispatchBPODto): Promise<{
        buyerPurchaseOrder: {
            quotation: {
                id: string;
                createdAt: Date;
                status: import(".prisma/client").$Enums.QuotationStatus;
                totalAmount: number;
                taxAmount: number;
                quotationNumber: string;
                companyName: string;
                companyAddress: string;
                companyContact: string | null;
                deliveryTerms: string | null;
                deliveryDays: number | null;
                moneyInWords: string | null;
                validUntil: Date | null;
                contactPersonName: string | null;
                subject: string | null;
                body: string | null;
                generalTerms: string | null;
                paymentTerms: string | null;
                signatureImageUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            poNumber: string;
            poDate: Date;
            dispatchedQuantity: number;
            pdfUrl: string | null;
            externalUrl: string | null;
            quotationId: string;
        };
        items: ({
            inventory: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                purchaseOrderId: string;
                description: string | null;
                productName: string;
                quantity: number;
                productCode: string;
                barcode: string | null;
                imageUrl: string | null;
                purchasePrice: number;
                expectedSalePrice: number;
                minStockLevel: number | null;
                maxStockLevel: number | null;
            };
        } & {
            id: string;
            quantity: number;
            inventoryId: string;
            challanId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ChallanStatus;
        challanNumber: string;
        dispatchDate: Date | null;
        deliveryDate: Date | null;
        buyerPurchaseOrderId: string;
    }>;
    getChallansByBPO(bpoId: string): Promise<({
        items: ({
            inventory: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                purchaseOrderId: string;
                description: string | null;
                productName: string;
                quantity: number;
                productCode: string;
                barcode: string | null;
                imageUrl: string | null;
                purchasePrice: number;
                expectedSalePrice: number;
                minStockLevel: number | null;
                maxStockLevel: number | null;
            };
        } & {
            id: string;
            quantity: number;
            inventoryId: string;
            challanId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ChallanStatus;
        challanNumber: string;
        dispatchDate: Date | null;
        deliveryDate: Date | null;
        buyerPurchaseOrderId: string;
    })[]>;
    getAllChallans(): Promise<({
        buyerPurchaseOrder: {
            quotation: {
                items: {
                    id: string;
                    quantity: number;
                    unitPrice: number;
                    taxPercentage: number | null;
                    totalPrice: number;
                    inventoryId: string;
                    quotationId: string;
                    mrp: number;
                    packagePrice: number;
                }[];
            } & {
                id: string;
                createdAt: Date;
                status: import(".prisma/client").$Enums.QuotationStatus;
                totalAmount: number;
                taxAmount: number;
                quotationNumber: string;
                companyName: string;
                companyAddress: string;
                companyContact: string | null;
                deliveryTerms: string | null;
                deliveryDays: number | null;
                moneyInWords: string | null;
                validUntil: Date | null;
                contactPersonName: string | null;
                subject: string | null;
                body: string | null;
                generalTerms: string | null;
                paymentTerms: string | null;
                signatureImageUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            poNumber: string;
            poDate: Date;
            dispatchedQuantity: number;
            pdfUrl: string | null;
            externalUrl: string | null;
            quotationId: string;
        };
        items: ({
            inventory: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                purchaseOrderId: string;
                description: string | null;
                productName: string;
                quantity: number;
                productCode: string;
                barcode: string | null;
                imageUrl: string | null;
                purchasePrice: number;
                expectedSalePrice: number;
                minStockLevel: number | null;
                maxStockLevel: number | null;
            };
        } & {
            id: string;
            quantity: number;
            inventoryId: string;
            challanId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ChallanStatus;
        challanNumber: string;
        dispatchDate: Date | null;
        deliveryDate: Date | null;
        buyerPurchaseOrderId: string;
    })[]>;
    createChallan(dto: CreateChallanDto): Promise<{
        buyerPurchaseOrder: {
            quotation: {
                id: string;
                createdAt: Date;
                status: import(".prisma/client").$Enums.QuotationStatus;
                totalAmount: number;
                taxAmount: number;
                quotationNumber: string;
                companyName: string;
                companyAddress: string;
                companyContact: string | null;
                deliveryTerms: string | null;
                deliveryDays: number | null;
                moneyInWords: string | null;
                validUntil: Date | null;
                contactPersonName: string | null;
                subject: string | null;
                body: string | null;
                generalTerms: string | null;
                paymentTerms: string | null;
                signatureImageUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            poNumber: string;
            poDate: Date;
            dispatchedQuantity: number;
            pdfUrl: string | null;
            externalUrl: string | null;
            quotationId: string;
        };
        items: ({
            inventory: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                purchaseOrderId: string;
                description: string | null;
                productName: string;
                quantity: number;
                productCode: string;
                barcode: string | null;
                imageUrl: string | null;
                purchasePrice: number;
                expectedSalePrice: number;
                minStockLevel: number | null;
                maxStockLevel: number | null;
            };
        } & {
            id: string;
            quantity: number;
            inventoryId: string;
            challanId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ChallanStatus;
        challanNumber: string;
        dispatchDate: Date | null;
        deliveryDate: Date | null;
        buyerPurchaseOrderId: string;
    }>;
    getChallanById(id: string): Promise<{
        buyerPurchaseOrder: {
            quotation: {
                items: ({
                    inventory: {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        purchaseOrderId: string;
                        description: string | null;
                        productName: string;
                        quantity: number;
                        productCode: string;
                        barcode: string | null;
                        imageUrl: string | null;
                        purchasePrice: number;
                        expectedSalePrice: number;
                        minStockLevel: number | null;
                        maxStockLevel: number | null;
                    };
                } & {
                    id: string;
                    quantity: number;
                    unitPrice: number;
                    taxPercentage: number | null;
                    totalPrice: number;
                    inventoryId: string;
                    quotationId: string;
                    mrp: number;
                    packagePrice: number;
                })[];
            } & {
                id: string;
                createdAt: Date;
                status: import(".prisma/client").$Enums.QuotationStatus;
                totalAmount: number;
                taxAmount: number;
                quotationNumber: string;
                companyName: string;
                companyAddress: string;
                companyContact: string | null;
                deliveryTerms: string | null;
                deliveryDays: number | null;
                moneyInWords: string | null;
                validUntil: Date | null;
                contactPersonName: string | null;
                subject: string | null;
                body: string | null;
                generalTerms: string | null;
                paymentTerms: string | null;
                signatureImageUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            poNumber: string;
            poDate: Date;
            dispatchedQuantity: number;
            pdfUrl: string | null;
            externalUrl: string | null;
            quotationId: string;
        };
        items: ({
            inventory: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                purchaseOrderId: string;
                description: string | null;
                productName: string;
                quantity: number;
                productCode: string;
                barcode: string | null;
                imageUrl: string | null;
                purchasePrice: number;
                expectedSalePrice: number;
                minStockLevel: number | null;
                maxStockLevel: number | null;
            };
        } & {
            id: string;
            quantity: number;
            inventoryId: string;
            challanId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ChallanStatus;
        challanNumber: string;
        dispatchDate: Date | null;
        deliveryDate: Date | null;
        buyerPurchaseOrderId: string;
    }>;
    updateChallanStatus(id: string, dto: UpdateChallanStatusDto): Promise<{
        buyerPurchaseOrder: {
            quotation: {
                id: string;
                createdAt: Date;
                status: import(".prisma/client").$Enums.QuotationStatus;
                totalAmount: number;
                taxAmount: number;
                quotationNumber: string;
                companyName: string;
                companyAddress: string;
                companyContact: string | null;
                deliveryTerms: string | null;
                deliveryDays: number | null;
                moneyInWords: string | null;
                validUntil: Date | null;
                contactPersonName: string | null;
                subject: string | null;
                body: string | null;
                generalTerms: string | null;
                paymentTerms: string | null;
                signatureImageUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            poNumber: string;
            poDate: Date;
            dispatchedQuantity: number;
            pdfUrl: string | null;
            externalUrl: string | null;
            quotationId: string;
        };
        items: ({
            inventory: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                purchaseOrderId: string;
                description: string | null;
                productName: string;
                quantity: number;
                productCode: string;
                barcode: string | null;
                imageUrl: string | null;
                purchasePrice: number;
                expectedSalePrice: number;
                minStockLevel: number | null;
                maxStockLevel: number | null;
            };
        } & {
            id: string;
            quantity: number;
            inventoryId: string;
            challanId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ChallanStatus;
        challanNumber: string;
        dispatchDate: Date | null;
        deliveryDate: Date | null;
        buyerPurchaseOrderId: string;
    }>;
}
