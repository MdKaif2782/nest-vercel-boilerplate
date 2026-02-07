import { CreateInvestorDto, UpdateInvestorDto } from './dto';
import { DatabaseService } from '../database/database.service';
import { PaymentMethod } from '@prisma/client';
export declare class InvestorService {
    private prisma;
    constructor(prisma: DatabaseService);
    private getSystemUserId;
    createInvestor(createInvestorDto: CreateInvestorDto): Promise<{
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
    }>;
    getAllInvestors(page?: number, limit?: number, search?: string): Promise<{
        investors: ({
            investments: ({
                purchaseOrder: {
                    status: import(".prisma/client").$Enums.POStatus;
                    totalAmount: number;
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
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getInvestorById(id: string): Promise<{
        investments: ({
            purchaseOrder: {
                createdAt: Date;
                poNumber: string;
                vendorName: string;
                status: import(".prisma/client").$Enums.POStatus;
                totalAmount: number;
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
    }>;
    updateInvestor(id: string, updateInvestorDto: UpdateInvestorDto): Promise<{
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
    }>;
    deleteInvestor(id: string): Promise<{
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
    }>;
    toggleInvestorStatus(id: string): Promise<{
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
    }>;
    getInvestorStatistics(): Promise<{
        summary: {
            totalInvestors: number;
            activeInvestors: number;
            inactiveInvestors: number;
            totalInvestment: number;
            combinedCapital: number;
            averageInvestment: number;
            averageShare: number;
        };
        equityDistribution: {
            investorName: string;
            sharePercentage: number;
            amount: number;
        }[];
        investorDetails: {
            investorId: string;
            investorName: string;
            totalInvested: number;
            activeInvestments: number;
            sharePercentage: number;
        }[];
    }>;
    getInvestorPerformanceReport(): Promise<{
        id: string;
        name: string;
        email: string;
        totalInvested: number;
        totalProfit: number;
        activeInvestments: number;
        completedInvestments: number;
        totalInvestments: number;
        roi: number;
        lastInvestment: Date;
    }[]>;
    getEquityDistribution(): Promise<{
        investorName: string;
        sharePercentage: number;
        amount: number;
    }[]>;
    getDueSummary(investorId: string): Promise<{
        investor: {
            id: string;
            name: string;
            email: string;
            phone: string;
            taxId: string;
            bankAccount: string;
            bankName: string;
            joinDate: Date;
            status: string;
        };
        summary: {
            totalInvestment: number;
            totalRevenue: number;
            totalCollected: number;
            totalProfitEarned: number;
            totalPaid: number;
            totalDue: number;
            payableNow: number;
            overallROI: number;
            collectionEfficiency: number;
            activeInvestments: number;
        };
        investmentBreakdown: any[];
        productSales: any[];
        paymentHistory: {
            id: string;
            amount: number;
            paymentDate: Date;
            description: string;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            reference: string;
        }[];
        recentActivity: {
            type: string;
            date: any;
            description: string;
            amount: any;
        }[];
    }>;
    payInvestor(investorId: string, amount: number, description?: string, paymentMethod?: PaymentMethod, reference?: string): Promise<{
        success: boolean;
        payment: {
            id: string;
            investorId: string;
            description: string | null;
            amount: number;
            paymentDate: Date;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
            reference: string | null;
        };
        newBalance: {
            previousDue: number;
            newDue: number;
            remainingPayable: number;
        };
        investor: {
            id: string;
            name: string;
            email: string;
            phone: string;
            taxId: string;
            bankAccount: string;
            bankName: string;
            joinDate: Date;
            status: string;
        };
    }>;
}
