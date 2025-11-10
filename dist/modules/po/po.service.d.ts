import { DatabaseService } from '../database/database.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, MarkAsReceivedDto, CreatePurchaseOrderPaymentDto, PaymentSummaryDto } from './dto';
export declare class PurchaseOrderService {
    private readonly database;
    constructor(database: DatabaseService);
    private generatePONumber;
    private findOrCreateSelfInvestor;
    private validateAndProcessInvestments;
    createPurchaseOrder(dto: CreatePurchaseOrderDto, createdBy: string): Promise<{
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
    }>;
    updatePurchaseOrder(id: string, dto: UpdatePurchaseOrderDto): Promise<{
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
    }>;
    markAsReceived(id: string, dto: MarkAsReceivedDto): Promise<{
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
    }>;
    findOne(id: string): Promise<{
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
            expectedSalePrice: number;
            productCode: string;
            barcode: string | null;
            purchasePrice: number;
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
    }>;
    findAll(skip?: number, take?: number): Promise<{
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
        total: number;
    }>;
    delete(id: string): Promise<{
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
    }>;
    addPayment(purchaseOrderId: string, createPaymentDto: CreatePurchaseOrderPaymentDto): Promise<{
        payment: any;
        updatedPO: any;
    }>;
    getPaymentSummary(purchaseOrderId: string): Promise<PaymentSummaryDto>;
    getPayments(purchaseOrderId: string): Promise<({
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
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        reference: string | null;
        paymentDate: Date;
    })[]>;
    updatePayment(paymentId: string, updateData: Partial<CreatePurchaseOrderPaymentDto>): Promise<{
        id: string;
        notes: string | null;
        purchaseOrderId: string;
        amount: number;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        reference: string | null;
        paymentDate: Date;
    }>;
    deletePayment(paymentId: string): Promise<{
        message: string;
        revertedAmount: number;
    }>;
    getDuePurchaseOrders(page?: number, limit?: number): Promise<{
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
                paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
                reference: string | null;
                paymentDate: Date;
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
