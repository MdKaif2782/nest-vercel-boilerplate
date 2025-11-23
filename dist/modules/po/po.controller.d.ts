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
            items: {
                id: string;
                purchaseOrderId: string;
                description: string | null;
                productName: string;
                quantity: number;
                unitPrice: number;
                taxPercentage: number;
                totalPrice: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
            items: {
                id: string;
                purchaseOrderId: string;
                description: string | null;
                productName: string;
                quantity: number;
                unitPrice: number;
                taxPercentage: number;
                totalPrice: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
                purchaseOrderId: string;
                description: string | null;
                productName: string;
                quantity: number;
                productCode: string;
                barcode: string | null;
                purchasePrice: number;
                expectedSalePrice: number;
                minStockLevel: number | null;
                maxStockLevel: number | null;
            }[];
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
            items: {
                id: string;
                purchaseOrderId: string;
                description: string | null;
                productName: string;
                quantity: number;
                unitPrice: number;
                taxPercentage: number;
                totalPrice: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
            receivedAt: Date | null;
            createdBy: string;
        };
    }>;
    update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
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
            items: {
                id: string;
                purchaseOrderId: string;
                description: string | null;
                productName: string;
                quantity: number;
                unitPrice: number;
                taxPercentage: number;
                totalPrice: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
            receivedAt: Date | null;
            createdBy: string;
        };
    }>;
    markAsReceived(id: string, markAsReceivedDto: MarkAsReceivedDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            inventoryItems: any[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
            items: {
                id: string;
                purchaseOrderId: string;
                description: string | null;
                productName: string;
                quantity: number;
                unitPrice: number;
                taxPercentage: number;
                totalPrice: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
            items: {
                id: string;
                purchaseOrderId: string;
                description: string | null;
                productName: string;
                quantity: number;
                unitPrice: number;
                taxPercentage: number;
                totalPrice: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
            _count: {
                payments: number;
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
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
