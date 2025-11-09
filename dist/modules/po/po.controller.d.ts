import { HttpStatus } from '@nestjs/common';
import { PurchaseOrderService } from './po.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, MarkAsReceivedDto, PurchaseOrderQueryDto, CreatePurchaseOrderPaymentDto, PaymentSummaryDto } from './dto';
import { Request } from 'express';
export declare class PurchaseOrderController {
    private readonly purchaseOrderService;
    constructor(purchaseOrderService: PurchaseOrderService);
    create(req: Request, createPurchaseOrderDto: CreatePurchaseOrderDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            user: {
                name: string;
                id: string;
                email: string;
            };
            items: {
                id: string;
                productName: string;
                description: string | null;
                quantity: number;
                unitPrice: number;
                taxPercentage: number;
                totalPrice: number;
                purchaseOrderId: string;
            }[];
            investments: ({
                investor: {
                    name: string;
                    id: string;
                    createdAt: Date;
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
            vendorName: string;
            vendorCountry: string;
            vendorAddress: string;
            vendorContact: string;
            paymentType: import(".prisma/client").$Enums.PaymentType;
            status: import(".prisma/client").$Enums.POStatus;
            totalAmount: number;
            taxAmount: number;
            dueAmount: number;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            receivedAt: Date | null;
            createdBy: string;
        };
    }>;
    findAll(query: PurchaseOrderQueryDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: ({
            user: {
                name: string;
                id: string;
                email: string;
            };
            items: {
                id: string;
                productName: string;
                description: string | null;
                quantity: number;
                unitPrice: number;
                taxPercentage: number;
                totalPrice: number;
                purchaseOrderId: string;
            }[];
            investments: ({
                investor: {
                    name: string;
                    id: string;
                    createdAt: Date;
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
            vendorName: string;
            vendorCountry: string;
            vendorAddress: string;
            vendorContact: string;
            paymentType: import(".prisma/client").$Enums.PaymentType;
            status: import(".prisma/client").$Enums.POStatus;
            totalAmount: number;
            taxAmount: number;
            dueAmount: number;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            receivedAt: Date | null;
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
        statusCode: HttpStatus;
        message: string;
        data: {
            user: {
                name: string;
                id: string;
                email: string;
            };
            inventory: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productName: string;
                description: string | null;
                quantity: number;
                purchaseOrderId: string;
                expectedSalePrice: number;
                productCode: string;
                barcode: string | null;
                purchasePrice: number;
                minStockLevel: number | null;
                maxStockLevel: number | null;
            }[];
            items: {
                id: string;
                productName: string;
                description: string | null;
                quantity: number;
                unitPrice: number;
                taxPercentage: number;
                totalPrice: number;
                purchaseOrderId: string;
            }[];
            investments: ({
                investor: {
                    name: string;
                    id: string;
                    createdAt: Date;
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
            vendorName: string;
            vendorCountry: string;
            vendorAddress: string;
            vendorContact: string;
            paymentType: import(".prisma/client").$Enums.PaymentType;
            status: import(".prisma/client").$Enums.POStatus;
            totalAmount: number;
            taxAmount: number;
            dueAmount: number;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            receivedAt: Date | null;
            createdBy: string;
        };
    }>;
    update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            items: {
                id: string;
                productName: string;
                description: string | null;
                quantity: number;
                unitPrice: number;
                taxPercentage: number;
                totalPrice: number;
                purchaseOrderId: string;
            }[];
            investments: ({
                investor: {
                    name: string;
                    id: string;
                    createdAt: Date;
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
            vendorName: string;
            vendorCountry: string;
            vendorAddress: string;
            vendorContact: string;
            paymentType: import(".prisma/client").$Enums.PaymentType;
            status: import(".prisma/client").$Enums.POStatus;
            totalAmount: number;
            taxAmount: number;
            dueAmount: number;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            receivedAt: Date | null;
            createdBy: string;
        };
    }>;
    markAsReceived(id: string, markAsReceivedDto: MarkAsReceivedDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            inventoryItems: {
                productName: string;
                receivedQuantity: number;
                expectedSalePrice: number;
            }[];
            id: string;
            poNumber: string;
            vendorName: string;
            vendorCountry: string;
            vendorAddress: string;
            vendorContact: string;
            paymentType: import(".prisma/client").$Enums.PaymentType;
            status: import(".prisma/client").$Enums.POStatus;
            totalAmount: number;
            taxAmount: number;
            dueAmount: number;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            receivedAt: Date | null;
            createdBy: string;
        };
    }>;
    remove(id: string): Promise<{
        statusCode: HttpStatus;
        message: string;
    }>;
    updateStatus(id: string, status: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        statusCode: HttpStatus;
        message: string;
        data: {
            items: {
                id: string;
                productName: string;
                description: string | null;
                quantity: number;
                unitPrice: number;
                taxPercentage: number;
                totalPrice: number;
                purchaseOrderId: string;
            }[];
            investments: ({
                investor: {
                    name: string;
                    id: string;
                    createdAt: Date;
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
            vendorName: string;
            vendorCountry: string;
            vendorAddress: string;
            vendorContact: string;
            paymentType: import(".prisma/client").$Enums.PaymentType;
            status: import(".prisma/client").$Enums.POStatus;
            totalAmount: number;
            taxAmount: number;
            dueAmount: number;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            receivedAt: Date | null;
            createdBy: string;
        };
    }>;
    findByStatus(status: string, query: PurchaseOrderQueryDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data?: undefined;
        meta?: undefined;
    } | {
        statusCode: HttpStatus;
        message: string;
        data: ({
            user: {
                name: string;
                id: string;
                email: string;
            };
            items: {
                id: string;
                productName: string;
                description: string | null;
                quantity: number;
                unitPrice: number;
                taxPercentage: number;
                totalPrice: number;
                purchaseOrderId: string;
            }[];
            investments: ({
                investor: {
                    name: string;
                    id: string;
                    createdAt: Date;
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
            vendorName: string;
            vendorCountry: string;
            vendorAddress: string;
            vendorContact: string;
            paymentType: import(".prisma/client").$Enums.PaymentType;
            status: import(".prisma/client").$Enums.POStatus;
            totalAmount: number;
            taxAmount: number;
            dueAmount: number;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            receivedAt: Date | null;
            createdBy: string;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    addPayment(id: string, createPaymentDto: CreatePurchaseOrderPaymentDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            payment: any;
            purchaseOrder: any;
        };
    }>;
    getPaymentSummary(id: string): Promise<{
        statusCode: number;
        message: string;
        data: PaymentSummaryDto;
    }>;
    getPayments(id: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: ({
            purchaseOrder: {
                poNumber: string;
                vendorName: string;
                totalAmount: number;
            };
        } & {
            id: string;
            notes: string | null;
            purchaseOrderId: string;
            amount: number;
            paymentDate: Date;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            reference: string | null;
        })[];
    }>;
    updatePayment(paymentId: string, updateData: Partial<CreatePurchaseOrderPaymentDto>): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            id: string;
            notes: string | null;
            purchaseOrderId: string;
            amount: number;
            paymentDate: Date;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            reference: string | null;
        };
    }>;
    deletePayment(paymentId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            revertedAmount: number;
        };
    }>;
    getDuePurchaseOrders(page?: number, limit?: number): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: ({
            user: {
                name: string;
                email: string;
            };
            payments: {
                id: string;
                notes: string | null;
                purchaseOrderId: string;
                amount: number;
                paymentDate: Date;
                paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
                reference: string | null;
            }[];
            _count: {
                payments: number;
            };
        } & {
            id: string;
            poNumber: string;
            vendorName: string;
            vendorCountry: string;
            vendorAddress: string;
            vendorContact: string;
            paymentType: import(".prisma/client").$Enums.PaymentType;
            status: import(".prisma/client").$Enums.POStatus;
            totalAmount: number;
            taxAmount: number;
            dueAmount: number;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            receivedAt: Date | null;
            createdBy: string;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
