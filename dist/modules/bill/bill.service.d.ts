import { DatabaseService } from '../database/database.service';
import { AddPaymentDto, BillSearchDto, CreateBillDto } from './dto';
export declare class BillService {
    private prisma;
    constructor(prisma: DatabaseService);
    create(createBillDto: CreateBillDto, createdBy: string): Promise<{
        user: {
            name: string;
            email: string;
        };
        items: ({
            inventory: {
                productName: string;
                productCode: string;
            };
        } & {
            id: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            productDescription: string;
            packagingDescription: string | null;
            billId: string;
            inventoryId: string;
        })[];
        buyerPO: {
            quotation: {
                quotationNumber: string;
                companyName: string;
            };
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
        status: import(".prisma/client").$Enums.BillStatus;
        totalAmount: number;
        taxAmount: number;
        dueAmount: number;
        createdBy: string;
        billNumber: string;
        billDate: Date;
        vatRegNo: string;
        code: string;
        vendorNo: string;
        buyerPOId: string;
    }>;
    findAll(searchDto: BillSearchDto): Promise<{
        data: ({
            user: {
                name: string;
                email: string;
            };
            _count: {
                payments: number;
            };
            payments: {
                id: string;
                amount: number;
                paymentDate: Date;
                paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
                reference: string | null;
                billId: string;
            }[];
            buyerPO: {
                quotation: {
                    quotationNumber: string;
                    companyName: string;
                    companyContact: string;
                };
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
            status: import(".prisma/client").$Enums.BillStatus;
            totalAmount: number;
            taxAmount: number;
            dueAmount: number;
            createdBy: string;
            billNumber: string;
            billDate: Date;
            vatRegNo: string;
            code: string;
            vendorNo: string;
            buyerPOId: string;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        user: {
            name: string;
            id: string;
            email: string;
        };
        items: ({
            inventory: {
                id: string;
                description: string;
                productName: string;
                productCode: string;
            };
        } & {
            id: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            productDescription: string;
            packagingDescription: string | null;
            billId: string;
            inventoryId: string;
        })[];
        payments: {
            id: string;
            amount: number;
            paymentDate: Date;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            reference: string | null;
            billId: string;
        }[];
        buyerPO: {
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
            pdfUrl: string | null;
            externalUrl: string | null;
            quotationId: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.BillStatus;
        totalAmount: number;
        taxAmount: number;
        dueAmount: number;
        createdBy: string;
        billNumber: string;
        billDate: Date;
        vatRegNo: string;
        code: string;
        vendorNo: string;
        buyerPOId: string;
    }>;
    addPayment(id: string, addPaymentDto: AddPaymentDto): Promise<{
        payments: {
            id: string;
            amount: number;
            paymentDate: Date;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            reference: string | null;
            billId: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.BillStatus;
        totalAmount: number;
        taxAmount: number;
        dueAmount: number;
        createdBy: string;
        billNumber: string;
        billDate: Date;
        vatRegNo: string;
        code: string;
        vendorNo: string;
        buyerPOId: string;
    }>;
    getStats(): Promise<{
        totalBills: number;
        totalAmount: number;
        totalDue: number;
        pendingBills: number;
        paidBills: number;
        partiallyPaidBills: number;
        overdueBills: number;
        collectionRate: number;
    }>;
    getBillsByBuyerPO(buyerPOId: string): Promise<({
        user: {
            name: string;
            email: string;
        };
        items: ({
            inventory: {
                productName: string;
                productCode: string;
            };
        } & {
            id: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            productDescription: string;
            packagingDescription: string | null;
            billId: string;
            inventoryId: string;
        })[];
        payments: {
            id: string;
            amount: number;
            paymentDate: Date;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            reference: string | null;
            billId: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.BillStatus;
        totalAmount: number;
        taxAmount: number;
        dueAmount: number;
        createdBy: string;
        billNumber: string;
        billDate: Date;
        vatRegNo: string;
        code: string;
        vendorNo: string;
        buyerPOId: string;
    })[]>;
    getRecentBills(limit?: number): Promise<({
        payments: {
            id: string;
            amount: number;
            paymentDate: Date;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            reference: string | null;
            billId: string;
        }[];
        buyerPO: {
            quotation: {
                companyName: string;
            };
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
        status: import(".prisma/client").$Enums.BillStatus;
        totalAmount: number;
        taxAmount: number;
        dueAmount: number;
        createdBy: string;
        billNumber: string;
        billDate: Date;
        vatRegNo: string;
        code: string;
        vendorNo: string;
        buyerPOId: string;
    })[]>;
    getAvailableBuyerPOs(): Promise<{
        remainingAmount: number;
        canCreateBill: boolean;
        quotation: {
            totalAmount: number;
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
            companyName: string;
            companyContact: string;
        };
        bills: {
            totalAmount: number;
        }[];
        id: string;
        createdAt: Date;
        poNumber: string;
        poDate: Date;
        pdfUrl: string | null;
        externalUrl: string | null;
        quotationId: string;
    }[]>;
}
