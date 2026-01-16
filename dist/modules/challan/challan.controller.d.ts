import { ChallanService } from './challan.service';
import { CreateChallanDto, UpdateChallanStatusDto, DispatchBPODto } from './dto';
import { Response } from 'express';
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
                quotationNumber: string;
                companyName: string;
                companyAddress: string;
                companyContact: string | null;
                deliveryTerms: string | null;
                deliveryDays: number | null;
                status: import(".prisma/client").$Enums.QuotationStatus;
                totalAmount: number;
                taxAmount: number;
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
            poNumber: string;
            poDate: Date;
            dispatchedQuantity: number;
            pdfUrl: string | null;
            externalUrl: string | null;
            createdAt: Date;
            quotationId: string;
        };
        items: ({
            inventory: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                quantity: number;
                productCode: string;
                barcode: string | null;
                productName: string;
                imageUrl: string | null;
                description: string | null;
                purchasePrice: number;
                expectedSalePrice: number;
                minStockLevel: number | null;
                maxStockLevel: number | null;
                purchaseOrderId: string;
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
        status: import(".prisma/client").$Enums.ChallanStatus;
        challanNumber: string;
        dispatchDate: Date | null;
        deliveryDate: Date | null;
        updatedAt: Date;
        buyerPurchaseOrderId: string;
    }>;
    getChallansByBPO(bpoId: string): Promise<({
        items: ({
            inventory: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                quantity: number;
                productCode: string;
                barcode: string | null;
                productName: string;
                imageUrl: string | null;
                description: string | null;
                purchasePrice: number;
                expectedSalePrice: number;
                minStockLevel: number | null;
                maxStockLevel: number | null;
                purchaseOrderId: string;
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
        status: import(".prisma/client").$Enums.ChallanStatus;
        challanNumber: string;
        dispatchDate: Date | null;
        deliveryDate: Date | null;
        updatedAt: Date;
        buyerPurchaseOrderId: string;
    })[]>;
    getAllChallans(): Promise<({
        buyerPurchaseOrder: {
            quotation: {
                items: {
                    id: string;
                    quotationId: string;
                    quantity: number;
                    mrp: number;
                    unitPrice: number;
                    packagePrice: number;
                    taxPercentage: number | null;
                    totalPrice: number;
                    inventoryId: string;
                }[];
            } & {
                id: string;
                createdAt: Date;
                quotationNumber: string;
                companyName: string;
                companyAddress: string;
                companyContact: string | null;
                deliveryTerms: string | null;
                deliveryDays: number | null;
                status: import(".prisma/client").$Enums.QuotationStatus;
                totalAmount: number;
                taxAmount: number;
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
            poNumber: string;
            poDate: Date;
            dispatchedQuantity: number;
            pdfUrl: string | null;
            externalUrl: string | null;
            createdAt: Date;
            quotationId: string;
        };
        items: ({
            inventory: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                quantity: number;
                productCode: string;
                barcode: string | null;
                productName: string;
                imageUrl: string | null;
                description: string | null;
                purchasePrice: number;
                expectedSalePrice: number;
                minStockLevel: number | null;
                maxStockLevel: number | null;
                purchaseOrderId: string;
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
        status: import(".prisma/client").$Enums.ChallanStatus;
        challanNumber: string;
        dispatchDate: Date | null;
        deliveryDate: Date | null;
        updatedAt: Date;
        buyerPurchaseOrderId: string;
    })[]>;
    createChallan(dto: CreateChallanDto): Promise<{
        buyerPurchaseOrder: {
            quotation: {
                id: string;
                createdAt: Date;
                quotationNumber: string;
                companyName: string;
                companyAddress: string;
                companyContact: string | null;
                deliveryTerms: string | null;
                deliveryDays: number | null;
                status: import(".prisma/client").$Enums.QuotationStatus;
                totalAmount: number;
                taxAmount: number;
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
            poNumber: string;
            poDate: Date;
            dispatchedQuantity: number;
            pdfUrl: string | null;
            externalUrl: string | null;
            createdAt: Date;
            quotationId: string;
        };
        items: ({
            inventory: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                quantity: number;
                productCode: string;
                barcode: string | null;
                productName: string;
                imageUrl: string | null;
                description: string | null;
                purchasePrice: number;
                expectedSalePrice: number;
                minStockLevel: number | null;
                maxStockLevel: number | null;
                purchaseOrderId: string;
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
        status: import(".prisma/client").$Enums.ChallanStatus;
        challanNumber: string;
        dispatchDate: Date | null;
        deliveryDate: Date | null;
        updatedAt: Date;
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
                        quantity: number;
                        productCode: string;
                        barcode: string | null;
                        productName: string;
                        imageUrl: string | null;
                        description: string | null;
                        purchasePrice: number;
                        expectedSalePrice: number;
                        minStockLevel: number | null;
                        maxStockLevel: number | null;
                        purchaseOrderId: string;
                    };
                } & {
                    id: string;
                    quotationId: string;
                    quantity: number;
                    mrp: number;
                    unitPrice: number;
                    packagePrice: number;
                    taxPercentage: number | null;
                    totalPrice: number;
                    inventoryId: string;
                })[];
            } & {
                id: string;
                createdAt: Date;
                quotationNumber: string;
                companyName: string;
                companyAddress: string;
                companyContact: string | null;
                deliveryTerms: string | null;
                deliveryDays: number | null;
                status: import(".prisma/client").$Enums.QuotationStatus;
                totalAmount: number;
                taxAmount: number;
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
            poNumber: string;
            poDate: Date;
            dispatchedQuantity: number;
            pdfUrl: string | null;
            externalUrl: string | null;
            createdAt: Date;
            quotationId: string;
        };
        items: ({
            inventory: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                quantity: number;
                productCode: string;
                barcode: string | null;
                productName: string;
                imageUrl: string | null;
                description: string | null;
                purchasePrice: number;
                expectedSalePrice: number;
                minStockLevel: number | null;
                maxStockLevel: number | null;
                purchaseOrderId: string;
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
        status: import(".prisma/client").$Enums.ChallanStatus;
        challanNumber: string;
        dispatchDate: Date | null;
        deliveryDate: Date | null;
        updatedAt: Date;
        buyerPurchaseOrderId: string;
    }>;
    getPdf(id: string, res: Response): Promise<void>;
    updateChallanStatus(id: string, dto: UpdateChallanStatusDto): Promise<{
        buyerPurchaseOrder: {
            quotation: {
                id: string;
                createdAt: Date;
                quotationNumber: string;
                companyName: string;
                companyAddress: string;
                companyContact: string | null;
                deliveryTerms: string | null;
                deliveryDays: number | null;
                status: import(".prisma/client").$Enums.QuotationStatus;
                totalAmount: number;
                taxAmount: number;
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
            poNumber: string;
            poDate: Date;
            dispatchedQuantity: number;
            pdfUrl: string | null;
            externalUrl: string | null;
            createdAt: Date;
            quotationId: string;
        };
        items: ({
            inventory: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                quantity: number;
                productCode: string;
                barcode: string | null;
                productName: string;
                imageUrl: string | null;
                description: string | null;
                purchasePrice: number;
                expectedSalePrice: number;
                minStockLevel: number | null;
                maxStockLevel: number | null;
                purchaseOrderId: string;
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
        status: import(".prisma/client").$Enums.ChallanStatus;
        challanNumber: string;
        dispatchDate: Date | null;
        deliveryDate: Date | null;
        updatedAt: Date;
        buyerPurchaseOrderId: string;
    }>;
}
