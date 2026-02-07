import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateInvestorDto, UpdateInvestorDto } from './dto';
import { DatabaseService } from '../database/database.service';
import { PaymentMethod, ExpenseCategory, ExpenseStatus } from '@prisma/client';

@Injectable()
export class InvestorService {
  constructor(private prisma: DatabaseService) {}

  /**
   * Get an admin user ID for auto-generated expense records.
   */
  private async getSystemUserId(): Promise<string> {
    const admin = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    if (!admin) {
      const anyUser = await this.prisma.user.findFirst({ select: { id: true } });
      return anyUser?.id || 'system';
    }
    return admin.id;
  }

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
        // profitDistributions: {
        //   include: {
        //     bill: {
        //       select: {
        //         billNumber: true,
        //         totalAmount: true,
        //         billDate: true,
        //       },
        //     },
        //   },
        //   orderBy: { distributionDate: 'desc' },
        // },
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
      },
    });

    const report = investors.map(investor => {
      const totalInvested = investor.investments.reduce(
        (sum, inv) => sum + inv.investmentAmount,
        0,
      );

      const totalProfit = 0; // for now .. will update later

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
async getDueSummary(investorId: string) {
  const investor = await this.prisma.investor.findUnique({
    where: { id: investorId },
    include: {
      investments: {
        include: {
          purchaseOrder: {
            include: {
              items: true,
              inventory: {
                include: {
                  billItems: {
                    include: {
                      bill: {
                        include: { 
                          payments: true,
                          buyerPO: {
                            include: {
                              quotation: {
                                select: {
                                  companyName: true,
                                  companyContact: true
                                }
                              }
                            }
                          }
                        }
                      },
                    },
                  },
                  retailItems: {
                    include: {
                      retailSale: true
                    }
                  }
                },
              },
            },
          },
        },
      },
      investorPayments: {
        orderBy: { paymentDate: 'desc' },
        include: {
          // Include any related payment details if needed
        }
      }
    },
  });

  if (!investor) throw new NotFoundException('Investor not found');

  // Investor Basic Information
  const investorInfo = {
    id: investor.id,
    name: investor.name,
    email: investor.email,
    phone: investor.phone,
    taxId: investor.taxId,
    bankAccount: investor.bankAccount,
    bankName: investor.bankName,
    joinDate: investor.createdAt,
    status: investor.isActive ? 'Active' : 'Inactive'
  };

  let totalInvestment = 0;
  let totalRevenue = 0;
  let totalCollected = 0;
  let totalProfitEarned = 0;
  let payableNow = 0;

  const investmentBreakdown = [];
  const productSales = [];

  for (const inv of investor.investments) {
    const po = inv.purchaseOrder;
    const profitPercent = inv.profitPercentage / 100;
    
    totalInvestment += inv.investmentAmount;

    let poRevenue = 0;
    let poCollected = 0;
    let poCost = 0;

    // Calculate PO cost from items
    poCost = po.items.reduce((sum, item) => sum + item.totalPrice, 0);

    // Track products and their sales
    const poProducts = new Map();

    // Process corporate sales (Bills)
    for (const inventory of po.inventory) {
      for (const billItem of inventory.billItems) {
        const bill = billItem.bill;
        
        poRevenue += billItem.totalPrice;

        // Track product sales
        const productKey = `${inventory.productName}-${inventory.productCode}`;
        if (!poProducts.has(productKey)) {
          poProducts.set(productKey, {
            productName: inventory.productName,
            productCode: inventory.productCode,
            purchasePrice: inventory.purchasePrice,
            expectedSalePrice: inventory.expectedSalePrice,
            totalSold: 0,
            totalRevenue: 0,
            customers: new Set()
          });
        }

        const product = poProducts.get(productKey);
        product.totalSold += billItem.quantity;
        product.totalRevenue += billItem.totalPrice;
        product.customers.add(bill.buyerPO?.quotation?.companyName || 'Unknown Customer');

        // Calculate collected amount from bill payments
        const billCollected = bill.payments.reduce((sum, p) => sum + p.amount, 0);
        poCollected += (billItem.totalPrice / bill.totalAmount) * billCollected;
      }

      // Process retail sales
      for (const retailItem of inventory.retailItems) {
        const retailSale = retailItem.retailSale;
        
        poRevenue += retailItem.totalPrice;
        poCollected += retailItem.totalPrice; // Retail sales are typically paid immediately

        const productKey = `${inventory.productName}-${inventory.productCode}`;
        if (!poProducts.has(productKey)) {
          poProducts.set(productKey, {
            productName: inventory.productName,
            productCode: inventory.productCode,
            purchasePrice: inventory.purchasePrice,
            expectedSalePrice: inventory.expectedSalePrice,
            totalSold: 0,
            totalRevenue: 0,
            customers: new Set()
          });
        }

        const product = poProducts.get(productKey);
        product.totalSold += retailItem.quantity;
        product.totalRevenue += retailItem.totalPrice;
        product.customers.add('Retail Customer');
      }
    }

    const poProfit = poRevenue * profitPercent;
    const poPayableNow = poCollected * profitPercent;

    totalRevenue += poRevenue;
    totalCollected += poCollected;
    totalProfitEarned += poProfit;
    payableNow += poPayableNow;

    // Add to product sales breakdown
    poProducts.forEach(product => {
      productSales.push({
        poId: po.id,
        poNumber: po.poNumber,
        ...product,
        customers: Array.from(product.customers)
      });
    });

    investmentBreakdown.push({
      investmentId: inv.id,
      poId: po.id,
      poNumber: po.poNumber,
      vendorName: po.vendorName,
      investmentAmount: inv.investmentAmount,
      profitPercentage: inv.profitPercentage,
      poStatus: po.status,
      orderDate: po.createdAt,
      receivedDate: po.receivedAt,
      
      // Financial metrics
      poCost,
      poRevenue,
      poCollected,
      poProfit,
      poPayableNow,
      
      // Performance metrics
      roi: ((poRevenue - poCost) / poCost) * 100,
      profitEarned: poProfit,
      payableNow: poPayableNow,

      // Products in this PO
      products: po.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      }))
    });
  }

  // Investor payments history
  const paymentHistory = investor.investorPayments.map(payment => ({
    id: payment.id,
    amount: payment.amount,
    paymentDate: payment.paymentDate,
    description: payment.description,
    paymentMethod: payment.paymentMethod,
    reference: payment.reference
  }));

  const totalPaid = paymentHistory.reduce((sum, p) => sum + p.amount, 0);
  const totalDue = totalProfitEarned - totalPaid;
  
  // Recalculate payableNow considering already paid amounts
  payableNow = Math.max(0, payableNow - totalPaid);

  // Performance metrics
  const overallROI = totalInvestment > 0 ? ((totalProfitEarned - totalInvestment) / totalInvestment) * 100 : 0;
  const collectionEfficiency = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0;

  return {
    // Investor Information
    investor: investorInfo,
    
    // Summary Section
    summary: {
      totalInvestment,
      totalRevenue,
      totalCollected,
      totalProfitEarned,
      totalPaid,
      totalDue,
      payableNow,
      overallROI: Number(overallROI.toFixed(2)),
      collectionEfficiency: Number(collectionEfficiency.toFixed(2)),
      activeInvestments: investor.investments.filter(inv => 
        ['ORDERED', 'SHIPPED', 'RECEIVED'].includes(inv.purchaseOrder.status)
      ).length
    },

    // Detailed Breakdowns
    investmentBreakdown,
    productSales,
    paymentHistory,

    // Timeline & Recent Activity
    recentActivity: [
      ...investmentBreakdown
        .filter(inv => inv.poStatus === 'RECEIVED')
        .map(inv => ({
          type: 'PO_RECEIVED',
          date: inv.receivedDate,
          description: `Purchase Order ${inv.poNumber} received from ${inv.vendorName}`,
          amount: inv.investmentAmount
        })),
      ...paymentHistory.map(payment => ({
        type: 'PAYMENT_RECEIVED',
        date: payment.paymentDate,
        description: `Payment received - ${payment.description || 'Investor Payment'}`,
        amount: payment.amount,
        method: payment.paymentMethod
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)
  };
}

async payInvestor(
  investorId: string, 
  amount: number, 
  description?: string,
  paymentMethod?: PaymentMethod,
  reference?: string
) {
  if (amount <= 0) throw new BadRequestException('Invalid amount');

  // Verify investor exists
  const investor = await this.prisma.investor.findUnique({
    where: { id: investorId }
  });

  if (!investor) throw new NotFoundException('Investor not found');

  // Check payable_now with enhanced summary
  const summary = await this.getDueSummary(investorId);

  if (amount > summary.summary.payableNow) {
    throw new BadRequestException(
      `You can only pay up to ${summary.summary.payableNow} BDT right now. Available from collected sales.`
    );
  }

  // Create payment record
  const payment = await this.prisma.investorPayment.create({
    data: {
      investorId,
      amount,
      description: description || `Payment for profits from sales`,
      paymentMethod,
      reference,
    },
  });

  // Auto-create expense record
  try {
    const systemUserId = await this.getSystemUserId();
    await this.prisma.expense.create({
      data: {
        title: `Investor Payment - ${investor.name}`,
        description: description || `Profit payment to investor ${investor.name}`,
        amount,
        category: ExpenseCategory.INVESTOR_PAYMENT,
        expenseDate: new Date(),
        paymentMethod: paymentMethod || 'BANK_TRANSFER',
        status: ExpenseStatus.APPROVED,
        isAutoGenerated: true,
        investorPaymentId: payment.id,
        recordedBy: systemUserId,
      },
    });
  } catch (_) {
    // Don't fail the main operation if expense logging fails
  }

  return {
    success: true,
    payment,
    newBalance: {
      previousDue: summary.summary.totalDue,
      newDue: summary.summary.totalDue - amount,
      remainingPayable: summary.summary.payableNow - amount
    },
    investor: summary.investor
  };
}
}