import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderDto, OrderSummaryDto, InvestorProfitSummaryDto, OrderProductDto, OrderTimelineEventDto } from './dto';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    create(createOrderDto: CreateOrderDto): Promise<{
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
        };
    } & {
        id: string;
        poNumber: string;
        poDate: Date;
        pdfUrl: string | null;
        externalUrl: string | null;
        createdAt: Date;
        quotationId: string;
    }>;
    findAll(page?: number, limit?: number, status?: string): Promise<{
        data: ({
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
            };
            bills: ({
                items: {
                    id: string;
                    quantity: number;
                    unitPrice: number;
                    totalPrice: number;
                    inventoryId: string;
                    productDescription: string;
                    packagingDescription: string | null;
                    billId: string;
                }[];
                payments: {
                    id: string;
                    billId: string;
                    amount: number;
                    paymentDate: Date;
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
            challans: ({
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
                    quantity: number;
                    inventoryId: string;
                    challanId: string;
                })[];
            } & {
                id: string;
                createdAt: Date;
                status: import(".prisma/client").$Enums.ChallanStatus;
                updatedAt: Date;
                challanNumber: string;
                dispatchDate: Date | null;
                deliveryDate: Date | null;
                buyerPurchaseOrderId: string;
            })[];
        } & {
            id: string;
            poNumber: string;
            poDate: Date;
            pdfUrl: string | null;
            externalUrl: string | null;
            createdAt: Date;
            quotationId: string;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getStatistics(): Promise<{
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
    findOne(id: string): Promise<{
        quotation: {
            items: ({
                inventory: {
                    purchaseOrder: {
                        investments: ({
                            investor: {
                                id: string;
                                createdAt: Date;
                                name: string;
                                email: string;
                                phone: string | null;
                                address: string | null;
                                taxId: string | null;
                                bankAccount: string | null;
                                bankName: string | null;
                                isActive: boolean;
                            };
                        } & {
                            id: string;
                            purchaseOrderId: string;
                            investmentAmount: number;
                            profitPercentage: number;
                            isFullInvestment: boolean;
                            investorId: string;
                        })[];
                    } & {
                        id: string;
                        poNumber: string;
                        createdAt: Date;
                        status: import(".prisma/client").$Enums.POStatus;
                        totalAmount: number;
                        taxAmount: number;
                        updatedAt: Date;
                        dueAmount: number;
                        createdBy: string;
                        vendorName: string;
                        vendorCountry: string;
                        vendorAddress: string;
                        vendorContact: string;
                        paymentType: import(".prisma/client").$Enums.PaymentType;
                        notes: string | null;
                        receivedAt: Date | null;
                    };
                } & {
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
        };
        bills: ({
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
                quantity: number;
                unitPrice: number;
                totalPrice: number;
                inventoryId: string;
                productDescription: string;
                packagingDescription: string | null;
                billId: string;
            })[];
            payments: {
                id: string;
                billId: string;
                amount: number;
                paymentDate: Date;
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
        challans: ({
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
                quantity: number;
                inventoryId: string;
                challanId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.ChallanStatus;
            updatedAt: Date;
            challanNumber: string;
            dispatchDate: Date | null;
            deliveryDate: Date | null;
            buyerPurchaseOrderId: string;
        })[];
    } & {
        id: string;
        poNumber: string;
        poDate: Date;
        pdfUrl: string | null;
        externalUrl: string | null;
        createdAt: Date;
        quotationId: string;
    }>;
    getSummary(id: string): Promise<OrderSummaryDto>;
    getInvestorProfits(id: string): Promise<InvestorProfitSummaryDto[]>;
    getProducts(id: string): Promise<OrderProductDto[]>;
    getTimeline(id: string): Promise<OrderTimelineEventDto[]>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<{
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
        };
    } & {
        id: string;
        poNumber: string;
        poDate: Date;
        pdfUrl: string | null;
        externalUrl: string | null;
        createdAt: Date;
        quotationId: string;
    }>;
    delete(id: string): Promise<{
        id: string;
        poNumber: string;
        poDate: Date;
        pdfUrl: string | null;
        externalUrl: string | null;
        createdAt: Date;
        quotationId: string;
    }>;
}
