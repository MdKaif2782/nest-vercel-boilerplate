import { CreateQuotationDto } from './dto/create-quotation.dto';
import { AcceptQuotationDto, QuotationSearchDto, UpdateQuotationDto } from './dto/update-quotation.dto';
import { DatabaseService } from '../database/database.service';
import { QuotationStatus } from '@prisma/client';
import { PdfService } from '../pdf/pdf.service';
export declare class QuotationService {
    private prisma;
    private readonly pdfService;
    constructor(prisma: DatabaseService, pdfService: PdfService);
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
            unitPrice: number;
            totalPrice: number;
            inventoryId: string;
            mrp: number;
            packagePrice: number;
            taxPercentage: number | null;
        })[];
    } & {
        id: string;
        totalAmount: number;
        taxAmount: number;
        status: import(".prisma/client").$Enums.QuotationStatus;
        createdAt: Date;
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
    }>;
    generatePdf(quotationId: string): Promise<Buffer>;
    getQuotationWithPdf(quotationId: string): Promise<{
        pdfBase64: string;
        pdfBuffer: Buffer;
        items: ({
            inventory: {
                id: string;
                createdAt: Date;
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
                updatedAt: Date;
                purchaseOrderId: string;
            };
        } & {
            id: string;
            quotationId: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            inventoryId: string;
            mrp: number;
            packagePrice: number;
            taxPercentage: number | null;
        })[];
        id: string;
        totalAmount: number;
        taxAmount: number;
        status: import(".prisma/client").$Enums.QuotationStatus;
        createdAt: Date;
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
    }>;
    findAll(searchDto: QuotationSearchDto): Promise<{
        data: ({
            buyerPO: {
                id: string;
                poNumber: string;
                poDate: Date;
            };
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
                unitPrice: number;
                totalPrice: number;
                inventoryId: string;
                mrp: number;
                packagePrice: number;
                taxPercentage: number | null;
            })[];
        } & {
            id: string;
            totalAmount: number;
            taxAmount: number;
            status: import(".prisma/client").$Enums.QuotationStatus;
            createdAt: Date;
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
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        buyerPO: {
            bills: {
                id: string;
                billNumber: string;
                billDate: Date;
                totalAmount: number;
                status: import(".prisma/client").$Enums.BillStatus;
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
            unitPrice: number;
            totalPrice: number;
            inventoryId: string;
            mrp: number;
            packagePrice: number;
            taxPercentage: number | null;
        })[];
    } & {
        id: string;
        totalAmount: number;
        taxAmount: number;
        status: import(".prisma/client").$Enums.QuotationStatus;
        createdAt: Date;
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
            unitPrice: number;
            totalPrice: number;
            inventoryId: string;
            mrp: number;
            packagePrice: number;
            taxPercentage: number | null;
        })[];
    } & {
        id: string;
        totalAmount: number;
        taxAmount: number;
        status: import(".prisma/client").$Enums.QuotationStatus;
        createdAt: Date;
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
    }>;
    acceptQuotation(id: string, acceptQuotationDto: AcceptQuotationDto): Promise<{
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
            unitPrice: number;
            totalPrice: number;
            inventoryId: string;
            mrp: number;
            packagePrice: number;
            taxPercentage: number | null;
        })[];
    } & {
        id: string;
        totalAmount: number;
        taxAmount: number;
        status: import(".prisma/client").$Enums.QuotationStatus;
        createdAt: Date;
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
    }>;
    updateStatus(id: string, status: QuotationStatus): Promise<{
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
            unitPrice: number;
            totalPrice: number;
            inventoryId: string;
            mrp: number;
            packagePrice: number;
            taxPercentage: number | null;
        })[];
    } & {
        id: string;
        totalAmount: number;
        taxAmount: number;
        status: import(".prisma/client").$Enums.QuotationStatus;
        createdAt: Date;
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
    }>;
    remove(id: string): Promise<{
        id: string;
        totalAmount: number;
        taxAmount: number;
        status: import(".prisma/client").$Enums.QuotationStatus;
        createdAt: Date;
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
            unitPrice: number;
            totalPrice: number;
            inventoryId: string;
            mrp: number;
            packagePrice: number;
            taxPercentage: number | null;
        })[];
    } & {
        id: string;
        totalAmount: number;
        taxAmount: number;
        status: import(".prisma/client").$Enums.QuotationStatus;
        createdAt: Date;
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
    })[]>;
}
