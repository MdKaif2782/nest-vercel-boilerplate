import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { QuotationSearchDto } from './dto/update-quotation.dto';
import { AcceptQuotationDto } from './dto/update-quotation.dto';
import { DatabaseService } from '../database/database.service';
export declare class QuotationService {
    private prisma;
    constructor(prisma: DatabaseService);
    create(createQuotationDto: CreateQuotationDto): Promise<{
        items: ({
            inventory: {
                description: string;
                productCode: string;
                productName: string;
            };
        } & {
            id: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            inventoryId: string;
            taxPercentage: number | null;
            mrp: number;
            packagePrice: number;
            quotationId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.QuotationStatus;
        totalAmount: number;
        taxAmount: number;
        companyName: string;
        companyAddress: string;
        companyContact: string | null;
        deliveryTerms: string | null;
        deliveryDays: number | null;
        moneyInWords: string | null;
        validUntil: Date | null;
        quotationNumber: string;
    }>;
    findAll(searchDto: QuotationSearchDto): Promise<{
        data: ({
            items: ({
                inventory: {
                    productCode: string;
                    productName: string;
                };
            } & {
                id: string;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
                inventoryId: string;
                taxPercentage: number | null;
                mrp: number;
                packagePrice: number;
                quotationId: string;
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
            companyName: string;
            companyAddress: string;
            companyContact: string | null;
            deliveryTerms: string | null;
            deliveryDays: number | null;
            moneyInWords: string | null;
            validUntil: Date | null;
            quotationNumber: string;
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
                productCode: string;
                productName: string;
                quantity: number;
                expectedSalePrice: number;
            };
        } & {
            id: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            inventoryId: string;
            taxPercentage: number | null;
            mrp: number;
            packagePrice: number;
            quotationId: string;
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
        companyName: string;
        companyAddress: string;
        companyContact: string | null;
        deliveryTerms: string | null;
        deliveryDays: number | null;
        moneyInWords: string | null;
        validUntil: Date | null;
        quotationNumber: string;
    }>;
    update(id: string, updateQuotationDto: UpdateQuotationDto): Promise<{
        items: ({
            inventory: {
                productCode: string;
                productName: string;
            };
        } & {
            id: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            inventoryId: string;
            taxPercentage: number | null;
            mrp: number;
            packagePrice: number;
            quotationId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.QuotationStatus;
        totalAmount: number;
        taxAmount: number;
        companyName: string;
        companyAddress: string;
        companyContact: string | null;
        deliveryTerms: string | null;
        deliveryDays: number | null;
        moneyInWords: string | null;
        validUntil: Date | null;
        quotationNumber: string;
    }>;
    acceptQuotation(id: string, acceptQuotationDto: AcceptQuotationDto): Promise<{
        items: ({
            inventory: {
                productCode: string;
                productName: string;
            };
        } & {
            id: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            inventoryId: string;
            taxPercentage: number | null;
            mrp: number;
            packagePrice: number;
            quotationId: string;
        })[];
        buyerPO: {
            id: string;
            createdAt: Date;
            poNumber: string;
            poDate: Date;
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
        companyName: string;
        companyAddress: string;
        companyContact: string | null;
        deliveryTerms: string | null;
        deliveryDays: number | null;
        moneyInWords: string | null;
        validUntil: Date | null;
        quotationNumber: string;
    }>;
    updateStatus(id: string, status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'): Promise<{
        items: ({
            inventory: {
                productCode: string;
                productName: string;
            };
        } & {
            id: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            inventoryId: string;
            taxPercentage: number | null;
            mrp: number;
            packagePrice: number;
            quotationId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.QuotationStatus;
        totalAmount: number;
        taxAmount: number;
        companyName: string;
        companyAddress: string;
        companyContact: string | null;
        deliveryTerms: string | null;
        deliveryDays: number | null;
        moneyInWords: string | null;
        validUntil: Date | null;
        quotationNumber: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.QuotationStatus;
        totalAmount: number;
        taxAmount: number;
        companyName: string;
        companyAddress: string;
        companyContact: string | null;
        deliveryTerms: string | null;
        deliveryDays: number | null;
        moneyInWords: string | null;
        validUntil: Date | null;
        quotationNumber: string;
    }>;
    getExpiredQuotations(): Promise<({
        items: ({
            inventory: {
                productCode: string;
                productName: string;
            };
        } & {
            id: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            inventoryId: string;
            taxPercentage: number | null;
            mrp: number;
            packagePrice: number;
            quotationId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.QuotationStatus;
        totalAmount: number;
        taxAmount: number;
        companyName: string;
        companyAddress: string;
        companyContact: string | null;
        deliveryTerms: string | null;
        deliveryDays: number | null;
        moneyInWords: string | null;
        validUntil: Date | null;
        quotationNumber: string;
    })[]>;
}
