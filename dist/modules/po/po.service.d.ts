import { DatabaseService } from '../database/database.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, MarkAsReceivedDto } from './dto';
export declare class PurchaseOrderService {
    private readonly database;
    constructor(database: DatabaseService);
    private generatePONumber;
    private findOrCreateSelfInvestor;
    private validateAndProcessInvestments;
    createPurchaseOrder(dto: CreatePurchaseOrderDto): Promise<{
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
        inventoryItems: {
            productName: string;
            receivedQuantity: number;
            expectedSalePrice: number;
        }[];
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
}
