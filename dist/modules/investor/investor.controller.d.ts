import { InvestorService } from './investor.service';
import { CreateInvestorDto, UpdateInvestorDto } from './dto';
export declare class InvestorController {
    private readonly investorService;
    constructor(investorService: InvestorService);
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
    getAllInvestors(page: number, limit: number, search?: string): Promise<{
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
        profitDistributions: ({
            bill: {
                totalAmount: number;
                billNumber: string;
                billDate: Date;
            };
        } & {
            id: string;
            investorId: string;
            description: string | null;
            amount: number;
            distributionDate: Date;
            billId: string;
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
}
