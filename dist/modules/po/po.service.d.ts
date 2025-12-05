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
            id: string;
            name: string;
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
        createdAt: Date;
        updatedAt: Date;
        receivedAt: Date | null;
        createdBy: string;
    }>;
    updatePurchaseOrder(id: string, dto: UpdatePurchaseOrderDto): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        receivedAt: Date | null;
        createdBy: string;
    }>;
    markAsReceived(id: string, dto: MarkAsReceivedDto): Promise<{
        inventoryItems: any[];
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
        receivedAt: Date | null;
        createdBy: string;
    }>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            name: string;
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
        inventory: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            productName: string;
            description: string | null;
            quantity: number;
            purchaseOrderId: string;
            productCode: string;
            barcode: string | null;
            purchasePrice: number;
            expectedSalePrice: number;
            minStockLevel: number | null;
            maxStockLevel: number | null;
        }[];
    } & {
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
        receivedAt: Date | null;
        createdBy: string;
    }>;
    findAll(skip?: number, take?: number): Promise<{
        data: ({
            user: {
                id: string;
                name: string;
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
            createdAt: Date;
            updatedAt: Date;
            receivedAt: Date | null;
            createdBy: string;
        })[];
        total: number;
    }>;
    delete(id: string): Promise<{
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
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
        paymentDate: Date;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        reference: string | null;
    })[]>;
    updatePayment(paymentId: string, updateData: Partial<CreatePurchaseOrderPaymentDto>): Promise<{
        id: string;
        notes: string | null;
        purchaseOrderId: string;
        amount: number;
        paymentDate: Date;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        reference: string | null;
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
            vendorContactNo: string | null;
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
