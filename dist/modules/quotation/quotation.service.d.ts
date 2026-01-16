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
                description: string;
                productName: string;
                productCode: string;
                imageUrl: string;
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
    }>;
    generatePdf(quotationId: string): Promise<Buffer>;
    getQuotationWithPdf(quotationId: string): Promise<{
        pdfBase64: string;
        pdfBuffer: Buffer;
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
    }>;
    findAll(searchDto: QuotationSearchDto): Promise<{
        data: ({
            items: ({
                inventory: {
                    id: string;
                    productName: string;
                    productCode: string;
                    imageUrl: string;
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
            buyerPO: {
                id: string;
                poNumber: string;
                poDate: Date;
            };
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
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        items: ({
            inventory: {
                id: string;
                description: string;
                productName: string;
                quantity: number;
                productCode: string;
                imageUrl: string;
                expectedSalePrice: number;
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
            createdAt: Date;
            poNumber: string;
            poDate: Date;
            dispatchedQuantity: number;
            pdfUrl: string | null;
            externalUrl: string | null;
            quotationId: string;
        };
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
    }>;
    update(id: string, updateQuotationDto: UpdateQuotationDto): Promise<{
        items: ({
            inventory: {
                id: string;
                productName: string;
                productCode: string;
                imageUrl: string;
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
    }>;
    acceptQuotation(id: string, acceptQuotationDto: AcceptQuotationDto): Promise<{
        items: ({
            inventory: {
                id: string;
                description: string;
                productName: string;
                quantity: number;
                productCode: string;
                imageUrl: string;
                purchasePrice: number;
                expectedSalePrice: number;
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
        buyerPO: {
            id: string;
            createdAt: Date;
            poNumber: string;
            poDate: Date;
            dispatchedQuantity: number;
            pdfUrl: string | null;
            externalUrl: string | null;
            quotationId: string;
        };
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
    }>;
    updateStatus(id: string, status: QuotationStatus): Promise<{
        items: ({
            inventory: {
                id: string;
                productName: string;
                productCode: string;
                imageUrl: string;
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
    }>;
    remove(id: string): Promise<{
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
    }>;
    getExpiredQuotations(): Promise<({
        items: ({
            inventory: {
                id: string;
                productName: string;
                productCode: string;
                imageUrl: string;
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
    })[]>;
}
