import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { 
  CreateOrderDto, 
  UpdateOrderDto, 
  OrderStatusUpdateDto,
  OrderSummaryDto,
  InvestorProfitSummaryDto 
} from './dto';

@Injectable()
export class OrderService {
  constructor(private readonly database: DatabaseService) {}

  // Generate unique Order number
  private async generateOrderNumber(): Promise<string> {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORDER-${timestamp}-${random}`;
  }

  // Create a new order from quotation
  async createOrder(createOrderDto: CreateOrderDto) {
    const { quotationId, ...orderData } = createOrderDto;

    // Check if quotation exists and is accepted
    const quotation = await this.database.quotation.findUnique({
      where: { id: quotationId },
      include: { items: true }
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${quotationId} not found`);
    }

    if (quotation.status !== 'ACCEPTED') {
      throw new BadRequestException('Only accepted quotations can be converted to orders');
    }

    // Check if order already exists for this quotation
    const existingOrder = await this.database.buyerPurchaseOrder.findUnique({
      where: { quotationId }
    });

    if (existingOrder) {
      throw new BadRequestException('Order already exists for this quotation');
    }

    // Create the order
    const order = await this.database.buyerPurchaseOrder.create({
      data: {
        ...orderData,
        poNumber: await this.generateOrderNumber(),
        poDate: orderData.poDate || new Date(),
        quotationId,
      },
      include: {
        quotation: {
          include: {
            items: {
              include: {
                inventory: true
              }
            }
          }
        }
      }
    });

    return order;
  }

  // Get all orders with pagination and filters
  async findAll(page: number = 1, limit: number = 10, status?: string) {
    const skip = (page - 1) * limit;
    
    const whereClause: any = {};
    if (status) {
      whereClause.quotation = {
        status: status
      };
    }

    const [orders, total] = await Promise.all([
      this.database.buyerPurchaseOrder.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          quotation: {
            include: {
              items: {
                include: {
                  inventory: true
                }
              }
            }
          },
          challans: {
            include: {
              items: {
                include: {
                  inventory: true
                }
              }
            }
          },
          bills: {
            include: {
              items: true,
              payments: true,
              profitDistributions: {
                include: {
                  investor: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.database.buyerPurchaseOrder.count({ where: whereClause })
    ]);

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  // Get order by ID
  async findOne(id: string) {
    const order = await this.database.buyerPurchaseOrder.findUnique({
      where: { id },
      include: {
        quotation: {
          include: {
            items: {
              include: {
                inventory: {
                  include: {
                    purchaseOrder: {
                      include: {
                        investments: {
                          include: {
                            investor: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        challans: {
          include: {
            items: {
              include: {
                inventory: true
              }
            }
          }
        },
        bills: {
          include: {
            items: {
              include: {
                inventory: true
              }
            },
            payments: true,
            profitDistributions: {
              include: {
                investor: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  // Update order
  async updateOrder(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.database.buyerPurchaseOrder.findUnique({
      where: { id }
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Check if there are existing bills or challans
    const existingBills = await this.database.bill.count({
      where: { buyerPOId: id }
    });

    const existingChallans = await this.database.challan.count({
      where: { buyerPurchaseOrderId: id }
    });

    if ((existingBills > 0 || existingChallans > 0) && updateOrderDto.poDate) {
      throw new BadRequestException('Cannot update PO date when bills or challans exist');
    }

    return await this.database.buyerPurchaseOrder.update({
      where: { id },
      data: updateOrderDto,
      include: {
        quotation: {
          include: {
            items: {
              include: {
                inventory: true
              }
            }
          }
        }
      }
    });
  }

  // Delete order (only if no related records)
  async deleteOrder(id: string) {
    const order = await this.database.buyerPurchaseOrder.findUnique({
      where: { id },
      include: {
        bills: true,
        challans: true
      }
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.bills.length > 0) {
      throw new BadRequestException('Cannot delete order with associated bills');
    }

    if (order.challans.length > 0) {
      throw new BadRequestException('Cannot delete order with associated challans');
    }

    return await this.database.buyerPurchaseOrder.delete({
      where: { id }
    });
  }

  // Get order summary with statistics
  async getOrderSummary(id: string): Promise<OrderSummaryDto> {
    const order = await this.findOne(id);

    // Calculate total ordered quantity from quotation
    const totalOrderedQuantity = order.quotation.items.reduce(
      (sum, item) => sum + item.quantity, 0
    );

    // Calculate total delivered quantity from challans
    const totalDeliveredQuantity = order.challans.reduce((sum, challan) => {
      return sum + challan.items.reduce((challanSum, item) => challanSum + item.quantity, 0);
    }, 0);

    // Calculate total billed amount
    const totalBilledAmount = order.bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const totalPaidAmount = order.bills.reduce((sum, bill) => {
      return sum + bill.payments.reduce((paymentSum, payment) => paymentSum + payment.amount, 0);
    }, 0);

    // Calculate total profit distributed
    const totalProfitDistributed = order.bills.reduce((sum, bill) => {
      return sum + bill.profitDistributions.reduce(
        (profitSum, distribution) => profitSum + distribution.amount, 0
      );
    }, 0);

    // Calculate completion percentage
    const completionPercentage = totalOrderedQuantity > 0 
      ? (totalDeliveredQuantity / totalOrderedQuantity) * 100 
      : 0;

    return {
      orderId: order.id,
      orderNumber: order.poNumber,
      quotationNumber: order.quotation.quotationNumber,
      companyName: order.quotation.companyName,
      totalOrderedQuantity,
      totalDeliveredQuantity,
      totalBilledAmount,
      totalPaidAmount,
      totalProfitDistributed,
      completionPercentage: Math.round(completionPercentage * 100) / 100,
      billCount: order.bills.length,
      challanCount: order.challans.length,
      status: order.quotation.status,
      createdAt: order.createdAt,
      lastUpdated: new Date()
    };
  }

  // Calculate investor profits for an order
  async calculateInvestorProfits(id: string): Promise<InvestorProfitSummaryDto[]> {
    const order = await this.findOne(id);

    // Get all inventory items involved in this order through quotation
    const inventoryItems = order.quotation.items.map(item => item.inventory);

    // Collect unique purchase orders and their investments
    const purchaseOrderInvestments = new Map();

    for (const inventoryItem of inventoryItems) {
      const purchaseOrder = inventoryItem.purchaseOrder;
      if (purchaseOrder && purchaseOrder.investments) {
        if (!purchaseOrderInvestments.has(purchaseOrder.id)) {
          purchaseOrderInvestments.set(purchaseOrder.id, {
            purchaseOrder,
            totalAmount: purchaseOrder.totalAmount,
            investments: purchaseOrder.investments
          });
        }
      }
    }

    // Calculate total sales from bills for this order
    const totalSales = order.bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const totalCost = inventoryItems.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0);
    const totalProfit = totalSales - totalCost;

    // Calculate profit distribution based on investment percentages
    const investorProfits = new Map();

    // First, collect all investors and their total investment percentages across all POs
    let totalInvestmentPercentage = 0;

    for (const [, poData] of purchaseOrderInvestments) {
      for (const investment of poData.investments) {
        const investorId = investment.investorId;
        const profitPercentage = investment.profitPercentage;

        if (!investorProfits.has(investorId)) {
          investorProfits.set(investorId, {
            investor: investment.investor,
            totalProfitPercentage: 0,
            totalInvestmentAmount: 0,
            calculatedProfit: 0,
            purchaseOrders: []
          });
        }

        const investorData = investorProfits.get(investorId);
        investorData.totalProfitPercentage += profitPercentage;
        investorData.totalInvestmentAmount += investment.investmentAmount;
        investorData.purchaseOrders.push({
          poNumber: poData.purchaseOrder.poNumber,
          profitPercentage: profitPercentage,
          investmentAmount: investment.investmentAmount
        });

        totalInvestmentPercentage += profitPercentage;
      }
    }

    // Calculate actual profit for each investor
    const results: InvestorProfitSummaryDto[] = [];
    
    for (const [, investorData] of investorProfits) {
      // Normalize percentage if total exceeds 100%
      const normalizedPercentage = totalInvestmentPercentage > 100 
        ? (investorData.totalProfitPercentage / totalInvestmentPercentage) * 100
        : investorData.totalProfitPercentage;

      const calculatedProfit = (normalizedPercentage / 100) * totalProfit;

      results.push({
        investorId: investorData.investor.id,
        investorName: investorData.investor.name,
        totalProfitPercentage: Math.round(investorData.totalProfitPercentage * 100) / 100,
        totalInvestmentAmount: investorData.totalInvestmentAmount,
        calculatedProfit: Math.round(calculatedProfit * 100) / 100,
        actualDistributedProfit: 0, // This would come from profitDistributions
        purchaseOrders: investorData.purchaseOrders
      });
    }

    // Calculate actual distributed profits from profitDistributions
    const actualDistributions = new Map();
    for (const bill of order.bills) {
      for (const distribution of bill.profitDistributions) {
        const investorId = distribution.investorId;
        actualDistributions.set(
          investorId, 
          (actualDistributions.get(investorId) || 0) + distribution.amount
        );
      }
    }

    // Update results with actual distributed profits
    for (const result of results) {
      result.actualDistributedProfit = Math.round(
        (actualDistributions.get(result.investorId) || 0) * 100
      ) / 100;
    }

    return results.sort((a, b) => b.calculatedProfit - a.calculatedProfit);
  }

  // Get order status timeline
  async getOrderStatusTimeline(id: string) {
    const order = await this.findOne(id);
    
    const timeline = [];

    // Quotation creation
    timeline.push({
      event: 'QUOTATION_CREATED',
      date: order.quotation.createdAt,
      description: `Quotation ${order.quotation.quotationNumber} created`,
      status: order.quotation.status
    });

    // Order creation
    timeline.push({
      event: 'ORDER_CREATED',
      date: order.createdAt,
      description: `Order ${order.poNumber} created from quotation`,
      status: 'ORDERED'
    });

    // Challan events
    for (const challan of order.challans) {
      timeline.push({
        event: 'CHALLAN_CREATED',
        date: challan.createdAt,
        description: `Challan ${challan.challanNumber} created`,
        status: challan.status
      });

      if (challan.dispatchDate) {
        timeline.push({
          event: 'CHALLAN_DISPATCHED',
          date: challan.dispatchDate,
          description: `Challan ${challan.challanNumber} dispatched`,
          status: 'DISPATCHED'
        });
      }

      if (challan.deliveryDate) {
        timeline.push({
          event: 'CHALLAN_DELIVERED',
          date: challan.deliveryDate,
          description: `Challan ${challan.challanNumber} delivered`,
          status: 'DELIVERED'
        });
      }
    }

    // Bill events
    for (const bill of order.bills) {
      timeline.push({
        event: 'BILL_CREATED',
        date: bill.billDate,
        description: `Bill ${bill.billNumber} created`,
        status: bill.status
      });

      // Payment events
      for (const payment of bill.payments) {
        timeline.push({
          event: 'PAYMENT_RECEIVED',
          date: payment.paymentDate,
          description: `Payment of ৳${payment.amount} received for bill ${bill.billNumber}`,
          status: 'PAID'
        });
      }
    }

    // Sort timeline by date
    return timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Get products in order
  async getOrderProducts(id: string) {
    const order = await this.database.buyerPurchaseOrder.findUnique({
      where: { id },
      include: {
        quotation: {
          include: {
            items: {
              include: {
                inventory: {
                  include: {
                    purchaseOrder: true
                  }
                }
              }
            }
          }
        },
        challans: {
          include: {
            items: {
              include: {
                inventory: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const products = order.quotation.items.map(quotationItem => {
      const inventory = quotationItem.inventory;
      
      // Calculate delivered quantity from challans
      const deliveredQuantity = order.challans.reduce((sum, challan) => {
        const challanItem = challan.items.find(item => item.inventoryId === inventory.id);
        return sum + (challanItem?.quantity || 0);
      }, 0);

      // Calculate remaining quantity to deliver
      const remainingQuantity = quotationItem.quantity - deliveredQuantity;

      return {
        productId: inventory.id,
        productCode: inventory.productCode,
        productName: inventory.productName,
        description: inventory.description,
        orderedQuantity: quotationItem.quantity,
        deliveredQuantity,
        remainingQuantity,
        unitPrice: quotationItem.unitPrice,
        totalPrice: quotationItem.totalPrice,
        purchasePrice: inventory.purchasePrice,
        expectedProfit: (quotationItem.unitPrice - inventory.purchasePrice) * quotationItem.quantity,
        status: remainingQuantity === 0 ? 'DELIVERED' : remainingQuantity === quotationItem.quantity ? 'PENDING' : 'PARTIAL'
      };
    });

    return products;
  }

  // Get order statistics
  async getOrderStatistics() {
    const totalOrders = await this.database.buyerPurchaseOrder.count();
    
    const ordersByStatus = await this.database.quotation.groupBy({
      by: ['status'],
      _count: {
        id: true
      },
      where: {
        buyerPO: { // Only count quotations that have orders
          isNot: null
        }
      }
    });

    const recentOrders = await this.database.buyerPurchaseOrder.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        quotation: {
          select: {
            companyName: true,
            totalAmount: true,
            status: true
          }
        },
        bills: {
          select: {
            totalAmount: true,
            status: true
          }
        }
      }
    });

    const totalBilledAmount = await this.database.bill.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        buyerPO: {
          isNot: null
        }
      }
    });

    const totalPaidAmount = await this.database.payment.aggregate({
      _sum: {
        amount: true
      },
      where: {
        bill: {
          buyerPO: {
            isNot: null
          }
        }
      }
    });

    return {
      totalOrders,
      statusBreakdown: ordersByStatus,
      totalBilledAmount: totalBilledAmount._sum.totalAmount || 0,
      totalPaidAmount: totalPaidAmount._sum.amount || 0,
      pendingAmount: (totalBilledAmount._sum.totalAmount || 0) - (totalPaidAmount._sum.amount || 0),
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        poNumber: order.poNumber,
        companyName: order.quotation.companyName,
        totalAmount: order.quotation.totalAmount,
        status: order.quotation.status,
        billCount: order.bills.length,
        totalBilled: order.bills.reduce((sum, bill) => sum + bill.totalAmount, 0)
      }))
    };
  }
}