import { BillService } from './bill.service';
import { BillSearchDto, AddPaymentDto, CreateBillDto } from './dto';
import { Request, Response } from 'express';
export declare class BillController {
    private readonly billService;
    constructor(billService: BillService);
    create(req: Request, createBillDto: CreateBillDto): Promise<{
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
            productDescription: string;
            packagingDescription: string | null;
            billId: string;
        })[];
        buyerPO: {
            quotation: {
                quotationNumber: string;
                companyName: string;
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
        user: {
            name: string;
            email: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.BillStatus;
        totalAmount: number;
        taxAmount: number;
        billNumber: string;
        billDate: Date;
        vatRegNo: string;
        code: string;
        vendorNo: string;
        dueAmount: number;
        buyerPOId: string;
        createdBy: string;
    }>;
    findAll(searchDto: BillSearchDto): Promise<{
        data: ({
            _count: {
                payments: number;
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
                dispatchedQuantity: number;
                pdfUrl: string | null;
                externalUrl: string | null;
                createdAt: Date;
                quotationId: string;
            };
            user: {
                name: string;
                email: string;
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
            status: import(".prisma/client").$Enums.BillStatus;
            totalAmount: number;
            taxAmount: number;
            billNumber: string;
            billDate: Date;
            vatRegNo: string;
            code: string;
            vendorNo: string;
            dueAmount: number;
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
    getRecentBills(limit: number): Promise<({
        buyerPO: {
            quotation: {
                companyName: string;
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
        status: import(".prisma/client").$Enums.BillStatus;
        totalAmount: number;
        taxAmount: number;
        billNumber: string;
        billDate: Date;
        vatRegNo: string;
        code: string;
        vendorNo: string;
        dueAmount: number;
        buyerPOId: string;
        createdBy: string;
    })[]>;
    getAvailableBuyerPOs(): Promise<{
        remainingAmount: number;
        canCreateBill: boolean;
        quotation: {
            companyName: string;
            companyContact: string;
            totalAmount: number;
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
        };
        bills: {
            totalAmount: number;
        }[];
        id: string;
        poNumber: string;
        poDate: Date;
        dispatchedQuantity: number;
        pdfUrl: string | null;
        externalUrl: string | null;
        createdAt: Date;
        quotationId: string;
    }[]>;
    getBillsByBuyerPO(buyerPOId: string): Promise<({
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
            productDescription: string;
            packagingDescription: string | null;
            billId: string;
        })[];
        user: {
            name: string;
            email: string;
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
        status: import(".prisma/client").$Enums.BillStatus;
        totalAmount: number;
        taxAmount: number;
        billNumber: string;
        billDate: Date;
        vatRegNo: string;
        code: string;
        vendorNo: string;
        dueAmount: number;
        buyerPOId: string;
        createdBy: string;
    })[]>;
    findOne(id: string): Promise<{
        items: ({
            inventory: {
                id: string;
                productCode: string;
                productName: string;
                description: string;
            };
        } & {
            id: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            inventoryId: string;
            productDescription: string;
            packagingDescription: string | null;
            billId: string;
        })[];
        buyerPO: {
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
        user: {
            id: string;
            name: string;
            email: string;
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
        status: import(".prisma/client").$Enums.BillStatus;
        totalAmount: number;
        taxAmount: number;
        billNumber: string;
        billDate: Date;
        vatRegNo: string;
        code: string;
        vendorNo: string;
        dueAmount: number;
        buyerPOId: string;
        createdBy: string;
    }>;
    getPdf(id: string, res: Response): Promise<void>;
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
        status: import(".prisma/client").$Enums.BillStatus;
        totalAmount: number;
        taxAmount: number;
        billNumber: string;
        billDate: Date;
        vatRegNo: string;
        code: string;
        vendorNo: string;
        dueAmount: number;
        buyerPOId: string;
        createdBy: string;
    }>;
}
