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
        buyerPO: {
            quotation: {
                quotationNumber: string;
                companyName: string;
            };
        } & {
            id: string;
            poNumber: string;
            poDate: Date;
            pdfUrl: string | null;
            externalUrl: string | null;
            createdAt: Date;
            quotationId: string;
        };
        items: ({
            inventory: {
                productCode: string;
                productName: string;
            };
        } & {
            id: string;
            productDescription: string;
            packagingDescription: string | null;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            inventoryId: string;
            billId: string;
        })[];
    } & {
        id: string;
        billNumber: string;
        billDate: Date;
        vatRegNo: string;
        code: string;
        vendorNo: string;
        totalAmount: number;
        taxAmount: number;
        dueAmount: number;
        status: import(".prisma/client").$Enums.BillStatus;
        buyerPOId: string;
        createdBy: string;
    }>;
    findAll(searchDto: BillSearchDto): Promise<{
        data: ({
            user: {
                name: string;
                email: string;
            };
            buyerPO: {
                quotation: {
                    quotationNumber: string;
                    companyName: string;
                    companyContact: string;
                };
            } & {
                id: string;
                poNumber: string;
                poDate: Date;
                pdfUrl: string | null;
                externalUrl: string | null;
                createdAt: Date;
                quotationId: string;
            };
            payments: {
                id: string;
                billId: string;
                paymentDate: Date;
                amount: number;
                paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
                reference: string | null;
            }[];
            _count: {
                payments: number;
            };
        } & {
            id: string;
            billNumber: string;
            billDate: Date;
            vatRegNo: string;
            code: string;
            vendorNo: string;
            totalAmount: number;
            taxAmount: number;
            dueAmount: number;
            status: import(".prisma/client").$Enums.BillStatus;
            buyerPOId: string;
            createdBy: string;
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
            id: string;
            name: string;
            email: string;
        };
        buyerPO: {
            quotation: {
                items: ({
                    inventory: {
                        id: string;
                        createdAt: Date;
                        quantity: number;
                        productCode: string;
                        barcode: string | null;
                        productName: string;
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
            };
        } & {
            id: string;
            poNumber: string;
            poDate: Date;
            pdfUrl: string | null;
            externalUrl: string | null;
            createdAt: Date;
            quotationId: string;
        };
        items: ({
            inventory: {
                id: string;
                productCode: string;
                productName: string;
                description: string;
            };
        } & {
            id: string;
            productDescription: string;
            packagingDescription: string | null;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            inventoryId: string;
            billId: string;
        })[];
        payments: {
            id: string;
            billId: string;
            paymentDate: Date;
            amount: number;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            reference: string | null;
        }[];
    } & {
        id: string;
        billNumber: string;
        billDate: Date;
        vatRegNo: string;
        code: string;
        vendorNo: string;
        totalAmount: number;
        taxAmount: number;
        dueAmount: number;
        status: import(".prisma/client").$Enums.BillStatus;
        buyerPOId: string;
        createdBy: string;
    }>;
    addPayment(id: string, addPaymentDto: AddPaymentDto): Promise<{
        payments: {
            id: string;
            billId: string;
            paymentDate: Date;
            amount: number;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            reference: string | null;
        }[];
    } & {
        id: string;
        billNumber: string;
        billDate: Date;
        vatRegNo: string;
        code: string;
        vendorNo: string;
        totalAmount: number;
        taxAmount: number;
        dueAmount: number;
        status: import(".prisma/client").$Enums.BillStatus;
        buyerPOId: string;
        createdBy: string;
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
            productDescription: string;
            packagingDescription: string | null;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            inventoryId: string;
            billId: string;
        })[];
        payments: {
            id: string;
            billId: string;
            paymentDate: Date;
            amount: number;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            reference: string | null;
        }[];
    } & {
        id: string;
        billNumber: string;
        billDate: Date;
        vatRegNo: string;
        code: string;
        vendorNo: string;
        totalAmount: number;
        taxAmount: number;
        dueAmount: number;
        status: import(".prisma/client").$Enums.BillStatus;
        buyerPOId: string;
        createdBy: string;
    })[]>;
    getRecentBills(limit?: number): Promise<({
        buyerPO: {
            quotation: {
                companyName: string;
            };
        } & {
            id: string;
            poNumber: string;
            poDate: Date;
            pdfUrl: string | null;
            externalUrl: string | null;
            createdAt: Date;
            quotationId: string;
        };
        payments: {
            id: string;
            billId: string;
            paymentDate: Date;
            amount: number;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            reference: string | null;
        }[];
    } & {
        id: string;
        billNumber: string;
        billDate: Date;
        vatRegNo: string;
        code: string;
        vendorNo: string;
        totalAmount: number;
        taxAmount: number;
        dueAmount: number;
        status: import(".prisma/client").$Enums.BillStatus;
        buyerPOId: string;
        createdBy: string;
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
                    quantity: number;
                    productCode: string;
                    barcode: string | null;
                    productName: string;
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
            companyName: string;
            companyContact: string;
        };
        bills: {
            totalAmount: number;
        }[];
        id: string;
        poNumber: string;
        poDate: Date;
        pdfUrl: string | null;
        externalUrl: string | null;
        createdAt: Date;
        quotationId: string;
    }[]>;
}
