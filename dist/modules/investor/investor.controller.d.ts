import { InvestorService } from './investor.service';
import { CreateInvestorDto, UpdateInvestorDto } from './dto';
export declare class InvestorController {
    private readonly investorService;
    constructor(investorService: InvestorService);
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
            distributionDate: Date;
            amount: number;
            description: string | null;
            billId: string;
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
}
