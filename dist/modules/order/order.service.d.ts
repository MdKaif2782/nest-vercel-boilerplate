import { DatabaseService } from '../database/database.service';
import { CreateOrderDto, UpdateOrderDto, OrderSummaryDto, InvestorProfitSummaryDto } from './dto';
export declare class OrderService {
    private readonly database;
    constructor(database: DatabaseService);
    private generateOrderNumber;
    createOrder(createOrderDto: CreateOrderDto): Promise<{
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
    }>;
    findAll(page?: number, limit?: number, status?: string): Promise<{
        data: ({
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
            bills: ({
                items: {
                    id: string;
                    quantity: number;
                    unitPrice: number;
                    totalPrice: number;
                    productDescription: string;
                    packagingDescription: string | null;
                    billId: string;
                    inventoryId: string;
                }[];
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
            })[];
            challans: ({
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
            })[];
        } & {
            id: string;
            createdAt: Date;
            poNumber: string;
            poDate: Date;
            pdfUrl: string | null;
            externalUrl: string | null;
            quotationId: string;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        quotation: {
            items: ({
                inventory: {
                    purchaseOrder: {
                        investments: ({
                            investor: {
                                name: string;
                                id: string;
                                email: string;
                                createdAt: Date;
                                phone: string | null;
                                address: string | null;
                                taxId: string | null;
                                bankAccount: string | null;
                                bankName: string | null;
                                isActive: boolean;
                            };
                        } & {
                            id: string;
                            investmentAmount: number;
                            profitPercentage: number;
                            isFullInvestment: boolean;
                            purchaseOrderId: string;
                            investorId: string;
                        })[];
                    } & {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        poNumber: string;
                        vendorName: string;
                        vendorCountry: string;
                        vendorAddress: string;
                        vendorContact: string;
                        vendorContactNo: string | null;
                        paymentType: import(".prisma/client").$Enums.PaymentType;
                        status: import(".prisma/client").$Enums.POStatus;
                        totalAmount: number;
                        taxAmount: number;
                        dueAmount: number;
                        notes: string | null;
                        receivedAt: Date | null;
                        createdBy: string;
                    };
                } & {
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
        bills: ({
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
        })[];
        challans: ({
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
        })[];
    } & {
        id: string;
        createdAt: Date;
        poNumber: string;
        poDate: Date;
        pdfUrl: string | null;
        externalUrl: string | null;
        quotationId: string;
    }>;
    updateOrder(id: string, updateOrderDto: UpdateOrderDto): Promise<{
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
    }>;
    deleteOrder(id: string): Promise<{
        id: string;
        createdAt: Date;
        poNumber: string;
        poDate: Date;
        pdfUrl: string | null;
        externalUrl: string | null;
        quotationId: string;
    }>;
    getOrderSummary(id: string): Promise<OrderSummaryDto>;
    calculateInvestorProfits(id: string): Promise<InvestorProfitSummaryDto[]>;
    getOrderStatusTimeline(id: string): Promise<any[]>;
    getOrderProducts(id: string): Promise<{
        productId: string;
        productCode: string;
        productName: string;
        description: string;
        orderedQuantity: number;
        deliveredQuantity: number;
        remainingQuantity: number;
        unitPrice: number;
        totalPrice: number;
        purchasePrice: number;
        expectedProfit: number;
        status: string;
    }[]>;
    getOrderStatistics(): Promise<{
        totalOrders: number;
        statusBreakdown: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.QuotationGroupByOutputType, "status"[]> & {
            _count: {
                id: number;
            };
        })[];
        totalBilledAmount: number;
        totalPaidAmount: number;
        pendingAmount: number;
        recentOrders: {
            id: string;
            poNumber: string;
            companyName: string;
            totalAmount: number;
            status: import(".prisma/client").$Enums.QuotationStatus;
            billCount: number;
            totalBilled: number;
        }[];
    }>;
}
