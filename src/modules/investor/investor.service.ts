import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInvestorDto, UpdateInvestorDto } from './dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class InvestorService {
  constructor(private prisma: DatabaseService) {}

  async createInvestor(createInvestorDto: CreateInvestorDto) {
    return this.prisma.investor.create({
      data: createInvestorDto,
    });
  }

  async getAllInvestors(page: number = 1, limit: number = 10, search: string = '') {
    const skip = (page - 1) * limit;
    
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    const [investors, total] = await Promise.all([
      this.prisma.investor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          investments: {
            include: {
              purchaseOrder: {
                select: {
                  status: true,
                  totalAmount: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.investor.count({ where }),
    ]);

    return {
      investors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getInvestorById(id: string) {
    const investor = await this.prisma.investor.findUnique({
      where: { id },
      include: {
        investments: {
          include: {
            purchaseOrder: {
              select: {
                poNumber: true,
                status: true,
                totalAmount: true,
                vendorName: true,
                createdAt: true,
              },
            },
          },
        },
        profitDistributions: {
          include: {
            bill: {
              select: {
                billNumber: true,
                totalAmount: true,
                billDate: true,
              },
            },
          },
          orderBy: { distributionDate: 'desc' },
        },
      },
    });

    if (!investor) {
      throw new NotFoundException(`Investor with ID ${id} not found`);
    }

    return investor;
  }

  async updateInvestor(id: string, updateInvestorDto: UpdateInvestorDto) {
    await this.getInvestorById(id); // Check if investor exists

    return this.prisma.investor.update({
      where: { id },
      data: updateInvestorDto,
    });
  }

  async deleteInvestor(id: string) {
    await this.getInvestorById(id); // Check if investor exists

    // Check if investor has any investments
    const investments = await this.prisma.purchaseOrderInvestment.count({
      where: { investorId: id },
    });

    if (investments > 0) {
      throw new NotFoundException(
        'Cannot delete investor with existing investments. Please deactivate instead.',
      );
    }

    return this.prisma.investor.delete({
      where: { id },
    });
  }

  async toggleInvestorStatus(id: string) {
    const investor = await this.getInvestorById(id);
    
    return this.prisma.investor.update({
      where: { id },
      data: { isActive: !investor.isActive },
    });
  }

  // Statistics and Reports
  async getInvestorStatistics() {
    const [
      totalInvestors,
      activeInvestors,
      totalInvestmentData,
      investorsWithInvestments,
    ] = await Promise.all([
      this.prisma.investor.count(),
      this.prisma.investor.count({ where: { isActive: true } }),
      this.prisma.purchaseOrderInvestment.aggregate({
        _sum: { investmentAmount: true },
      }),
      this.prisma.investor.findMany({
        where: { isActive: true },
        include: {
          investments: {
            include: {
              purchaseOrder: {
                select: { status: true },
              },
            },
          },
        },
      }),
    ]);

    const totalInvestment = totalInvestmentData._sum.investmentAmount || 0;

    // Calculate individual investor statistics
    const investorStats = investorsWithInvestments.map(investor => {
      const totalInvested = investor.investments.reduce(
        (sum, inv) => sum + inv.investmentAmount,
        0,
      );
      
      const activeInvestments = investor.investments.filter(
        inv => inv.purchaseOrder.status !== 'CANCELLED',
      ).length;

      return {
        investorId: investor.id,
        investorName: investor.name,
        totalInvested,
        activeInvestments,
        sharePercentage: totalInvestment > 0 ? (totalInvested / totalInvestment) * 100 : 0,
      };
    });

    // Calculate equity distribution
    const equityDistribution = investorStats.map(stat => ({
      investorName: stat.investorName,
      sharePercentage: stat.sharePercentage,
      amount: stat.totalInvested,
    }));

    // Calculate averages
    const averageShare = investorStats.length > 0 
      ? investorStats.reduce((sum, stat) => sum + stat.sharePercentage, 0) / investorStats.length 
      : 0;

    const averageInvestment = investorStats.length > 0
      ? investorStats.reduce((sum, stat) => sum + stat.totalInvested, 0) / investorStats.length
      : 0;

    return {
      summary: {
        totalInvestors,
        activeInvestors,
        inactiveInvestors: totalInvestors - activeInvestors,
        totalInvestment,
        combinedCapital: totalInvestment, // Same as total investment
        averageInvestment,
        averageShare,
      },
      equityDistribution,
      investorDetails: investorStats,
    };
  }

  async getInvestorPerformanceReport() {
    const investors = await this.prisma.investor.findMany({
      where: { isActive: true },
      include: {
        investments: {
          include: {
            purchaseOrder: {
              select: {
                status: true,
                totalAmount: true,
                poNumber: true,
                createdAt: true,
              },
            },
          },
        },
        profitDistributions: {
          include: {
            bill: {
              select: {
                billNumber: true,
                totalAmount: true,
              },
            },
          },
        },
      },
    });

    const report = investors.map(investor => {
      const totalInvested = investor.investments.reduce(
        (sum, inv) => sum + inv.investmentAmount,
        0,
      );

      const totalProfit = investor.profitDistributions.reduce(
        (sum, dist) => sum + dist.amount,
        0,
      );

      const activeInvestments = investor.investments.filter(
        inv => !['CANCELLED', 'RECEIVED'].includes(inv.purchaseOrder.status),
      ).length;

      const completedInvestments = investor.investments.filter(
        inv => inv.purchaseOrder.status === 'RECEIVED',
      ).length;

      return {
        id: investor.id,
        name: investor.name,
        email: investor.email,
        totalInvested,
        totalProfit,
        activeInvestments,
        completedInvestments,
        totalInvestments: investor.investments.length,
        roi: totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0,
        lastInvestment: investor.investments.length > 0 
          ? investor.investments[investor.investments.length - 1].purchaseOrder.createdAt
          : null,
      };
    });

    return report.sort((a, b) => b.totalInvested - a.totalInvested);
  }

  async getEquityDistribution() {
    const statistics = await this.getInvestorStatistics();
    return statistics.equityDistribution;
  }
}