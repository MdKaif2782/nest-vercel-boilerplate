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
                productCode: string;
                productName: string;
            };
        } & {
            id: string;
            quantity: number;
            productDescription: string;
            packagingDescription: string | null;
            unitPrice: number;
            totalPrice: number;
            billId: string;
            inventoryId: string;
        })[];
        buyerPO: {
            quotation: {
                companyName: string;
                quotationNumber: string;
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
                billId: string;
                paymentDate: Date;
                paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
                reference: string | null;
            }[];
            buyerPO: {
                quotation: {
                    companyName: string;
                    companyContact: string;
                    quotationNumber: string;
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
                productCode: string;
                productName: string;
            };
        } & {
            id: string;
            quantity: number;
            productDescription: string;
            packagingDescription: string | null;
            unitPrice: number;
            totalPrice: number;
            billId: string;
            inventoryId: string;
        })[];
        payments: {
            id: string;
            amount: number;
            billId: string;
            paymentDate: Date;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            reference: string | null;
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
                        productCode: string;
                        barcode: string | null;
                        productName: string;
                        quantity: number;
                        purchasePrice: number;
                        expectedSalePrice: number;
                        minStockLevel: number | null;
                        maxStockLevel: number | null;
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
            billId: string;
            paymentDate: Date;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            reference: string | null;
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
                productCode: string;
                productName: string;
            };
        } & {
            id: string;
            quantity: number;
            productDescription: string;
            packagingDescription: string | null;
            unitPrice: number;
            totalPrice: number;
            billId: string;
            inventoryId: string;
        })[];
        payments: {
            id: string;
            amount: number;
            billId: string;
            paymentDate: Date;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            reference: string | null;
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
            billId: string;
            paymentDate: Date;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            reference: string | null;
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
                    productCode: string;
                    barcode: string | null;
                    productName: string;
                    quantity: number;
                    purchasePrice: number;
                    expectedSalePrice: number;
                    minStockLevel: number | null;
                    maxStockLevel: number | null;
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
