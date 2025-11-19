import { CreateInvestorDto, UpdateInvestorDto } from './dto';
import { DatabaseService } from '../database/database.service';
export declare class InvestorService {
    private prisma;
    constructor(prisma: DatabaseService);
    createInvestor(createInvestorDto: CreateInvestorDto): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        address: string | null;
        taxId: string | null;
        bankAccount: string | null;
        bankName: string | null;
        isActive: boolean;
        createdAt: Date;
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
            id: string;
            name: string;
            email: string;
            phone: string | null;
            address: string | null;
            taxId: string | null;
            bankAccount: string | null;
            bankName: string | null;
            isActive: boolean;
            createdAt: Date;
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
        id: string;
        name: string;
        email: string;
        phone: string | null;
        address: string | null;
        taxId: string | null;
        bankAccount: string | null;
        bankName: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
    updateInvestor(id: string, updateInvestorDto: UpdateInvestorDto): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        address: string | null;
        taxId: string | null;
        bankAccount: string | null;
        bankName: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
    deleteInvestor(id: string): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        address: string | null;
        taxId: string | null;
        bankAccount: string | null;
        bankName: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
    toggleInvestorStatus(id: string): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        address: string | null;
        taxId: string | null;
        bankAccount: string | null;
        bankName: string | null;
        isActive: boolean;
        createdAt: Date;
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
        investorId: string;
        totalProfitEarned: number;
        totalPaid: number;
        totalDue: number;
        payableNow: number;
        poBreakdown: any[];
    }>;
    payInvestor(investorId: string, amount: number, description?: string): Promise<{
        id: string;
        investorId: string;
        description: string | null;
        amount: number;
        paymentDate: Date;
    }>;
}
