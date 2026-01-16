import { QuotationService } from './quotation.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto, QuotationSearchDto, AcceptQuotationDto } from './dto/update-quotation.dto';
import { Response } from 'express';
export declare class QuotationController {
    private readonly quotationService;
    constructor(quotationService: QuotationService);
    create(createQuotationDto: CreateQuotationDto): Promise<{
        items: ({
            inventory: {
                id: string;
                productCode: string;
                productName: string;
                imageUrl: string;
                description: string;
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
    }>;
    getPdf(id: string, res: Response): Promise<void>;
    findAll(searchDto: QuotationSearchDto): Promise<{
        data: ({
            items: ({
                inventory: {
                    id: string;
                    productCode: string;
                    productName: string;
                    imageUrl: string;
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
            buyerPO: {
                id: string;
                poNumber: string;
                poDate: Date;
            };
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
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getExpiredQuotations(): Promise<({
        items: ({
            inventory: {
                id: string;
                productCode: string;
                productName: string;
                imageUrl: string;
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
    })[]>;
    findOne(id: string): Promise<{
        items: ({
            inventory: {
                id: string;
                quantity: number;
                productCode: string;
                productName: string;
                imageUrl: string;
                description: string;
                expectedSalePrice: number;
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
        buyerPO: {
            bills: {
                id: string;
                status: import(".prisma/client").$Enums.BillStatus;
                totalAmount: number;
                billNumber: string;
                billDate: Date;
            }[];
            challans: {
                id: string;
                status: import(".prisma/client").$Enums.ChallanStatus;
                challanNumber: string;
                dispatchDate: Date;
            }[];
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
    }>;
    update(id: string, updateQuotationDto: UpdateQuotationDto): Promise<{
        items: ({
            inventory: {
                id: string;
                productCode: string;
                productName: string;
                imageUrl: string;
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
    }>;
    acceptQuotation(id: string, acceptQuotationDto: AcceptQuotationDto): Promise<{
        items: ({
            inventory: {
                id: string;
                quantity: number;
                productCode: string;
                productName: string;
                imageUrl: string;
                description: string;
                purchasePrice: number;
                expectedSalePrice: number;
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
        buyerPO: {
            id: string;
            poNumber: string;
            poDate: Date;
            dispatchedQuantity: number;
            pdfUrl: string | null;
            externalUrl: string | null;
            createdAt: Date;
            quotationId: string;
        };
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
    }>;
    updateStatus(id: string, status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'): Promise<{
        items: ({
            inventory: {
                id: string;
                productCode: string;
                productName: string;
                imageUrl: string;
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
