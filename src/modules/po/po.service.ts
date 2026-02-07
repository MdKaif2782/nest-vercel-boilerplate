import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, POStatus, PaymentType, ExpenseCategory, ExpenseStatus } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { PurchaseOrderInvestmentDto, CreatePurchaseOrderDto, UpdatePurchaseOrderDto, MarkAsReceivedDto, CreatePurchaseOrderPaymentDto, PaymentSummaryDto } from './dto';

@Injectable()
export class PurchaseOrderService {
  constructor(private readonly database: DatabaseService) { }

  /**
   * Get an admin user ID for auto-generated expense records.
   */
  private async getSystemUserId(): Promise<string> {
    const admin = await this.database.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    if (!admin) {
      const anyUser = await this.database.user.findFirst({ select: { id: true } });
      return anyUser?.id || 'system';
    }
    return admin.id;
  }

  // Generate unique PO number
  private async generatePONumber(): Promise<string> {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PO-${timestamp}-${random}`;
  }

  // Find or create Self investor
  private async findOrCreateSelfInvestor(): Promise<string> {
    const selfInvestor = await this.database.investor.findFirst({
      where: { name: 'Self' }
    });

    if (selfInvestor) {
      return selfInvestor.id;
    }

    const newSelfInvestor = await this.database.investor.create({
      data: {
        name: 'Self',
        email: `self-${Date.now()}@company.com`,
        isActive: true,
      }
    });

    return newSelfInvestor.id;
  }

  // Validate investments and handle self investment
  private async validateAndProcessInvestments(
    investments: PurchaseOrderInvestmentDto[],
    totalAmount: number
  ): Promise<{ processedInvestments: PurchaseOrderInvestmentDto[]; selfInvestment?: PurchaseOrderInvestmentDto }> {
    const totalProfitPercentage = investments.reduce((sum, inv) => sum + inv.profitPercentage, 0);
    const totalInvestmentAmount = investments.reduce((sum, inv) => sum + inv.investmentAmount, 0);

    // If investments cover 100% profit and total amount, return as is
    if (Math.abs(totalProfitPercentage - 100) < 0.01 && Math.abs(totalInvestmentAmount - totalAmount) < 0.01) {
      return { processedInvestments: investments };
    }

    // If more than 100% profit, throw error
    if (totalProfitPercentage > 100) {
      throw new BadRequestException('Total profit percentage cannot exceed 100%');
    }

    // If total investment exceeds PO total, throw error
    if (totalInvestmentAmount > totalAmount) {
      throw new BadRequestException('Total investment amount cannot exceed purchase order total amount');
    }

    // Calculate remaining percentage and amount for self investment
    const remainingPercentage = 100 - totalProfitPercentage;
    const remainingAmount = totalAmount - totalInvestmentAmount;

    // Create self investment for remaining percentage and amount
    const selfInvestorId = await this.findOrCreateSelfInvestor();

    const selfInvestment: PurchaseOrderInvestmentDto = {
      investorId: selfInvestorId,
      investmentAmount: remainingAmount,
      profitPercentage: remainingPercentage,
      isFullInvestment: false
    };

    return {
      processedInvestments: [...investments, selfInvestment],
      selfInvestment
    };
  }

  // Create purchase order
  async createPurchaseOrder(dto: CreatePurchaseOrderDto, createdBy: string) {
    const { items, investments, ...poData } = dto;

    // Validate and process investments
    const { processedInvestments } = await this.validateAndProcessInvestments(
      investments,
      poData.totalAmount
    );

    // Create purchase order with items
    const purchaseOrder = await this.database.purchaseOrder.create({
      data: {
        createdBy: createdBy,
        ...poData,
        poNumber: await this.generatePONumber(),
        status: POStatus.PENDING,
        items: {
          create: items.map(item => ({
            ...item,
            taxPercentage: item.taxPercentage || 0,
          }))
        }
      },
      include: { items: true }
    });

    // Create investments
    for (const investment of processedInvestments) {
      await this.database.purchaseOrderInvestment.create({
        data: {
          ...investment,
          purchaseOrderId: purchaseOrder.id,
        }
      });
    }

    // Return complete purchase order with investments
    return await this.database.purchaseOrder.findUnique({
      where: { id: purchaseOrder.id },
      include: {
        items: true,
        investments: {
          include: {
            investor: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  // Update purchase order
  async updatePurchaseOrder(id: string, dto: UpdatePurchaseOrderDto) {
    const { items, investments, ...poData } = dto;

    // Check if PO exists
    const existingPO = await this.database.purchaseOrder.findUnique({
      where: { id },
      include: { items: true, investments: true }
    });

    if (!existingPO) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }

    // Prevent updating received POs
    if (existingPO.status === POStatus.RECEIVED) {
      throw new BadRequestException('Cannot modify a received purchase order');
    }

    // Update basic PO data
    const updatedPO = await this.database.purchaseOrder.update({
      where: { id },
      data: poData
    });

    // Update items if provided
    if (items) {
      // Delete existing items
      await this.database.purchaseOrderItem.deleteMany({
        where: { purchaseOrderId: id }
      });

      // Create new items
      await this.database.purchaseOrderItem.createMany({
        data: items.map(item => ({
          ...item,
          purchaseOrderId: id,
          taxPercentage: item.taxPercentage || 0,
        }))
      });
    }

    // Update investments if provided
    if (investments) {
      const { processedInvestments } = await this.validateAndProcessInvestments(
        investments,
        poData.totalAmount || existingPO.totalAmount
      );

      // Delete existing investments
      await this.database.purchaseOrderInvestment.deleteMany({
        where: { purchaseOrderId: id }
      });

      // Create new investments
      for (const investment of processedInvestments) {
        await this.database.purchaseOrderInvestment.create({
          data: {
            ...investment,
            purchaseOrderId: id,
          }
        });
      }
    }

    return await this.database.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: true,
        investments: {
          include: {
            investor: true
          }
        }
      }
    });
  }

  // Mark purchase order as received and update inventory
  async markAsReceived(id: string, dto: MarkAsReceivedDto) {
    const { receivedItems } = dto;

    // Check if PO exists and is not already received
    const purchaseOrder = await this.database.purchaseOrder.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!purchaseOrder) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }

    if (purchaseOrder.status === POStatus.RECEIVED) {
      throw new BadRequestException('Purchase order is already marked as received');
    }

    // Validate received items
    for (const receivedItem of receivedItems) {
      const poItem = purchaseOrder.items.find(item => item.id === receivedItem.purchaseOrderItemId);
      if (!poItem) {
        throw new BadRequestException(`Purchase order item with ID ${receivedItem.purchaseOrderItemId} not found`);
      }
    }

    // Update PO status and received date
    const updatedPO = await this.database.purchaseOrder.update({
      where: { id },
      data: {
        status: POStatus.RECEIVED,
        receivedAt: new Date(),
      }
    });

    // Create inventory items
    const createdInventoryItems = [];
    for (const receivedItem of receivedItems) {
      const poItem = purchaseOrder.items.find(item => item.id === receivedItem.purchaseOrderItemId)!;

      // Generate product code from product name
      const productCode = poItem.productName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .substring(0, 20) + `_${Date.now()}`;

      const inventoryItem = await this.database.inventory.create({
        data: {
          productCode,
          productName: poItem.productName,
          description: poItem.description,
          quantity: receivedItem.receivedQuantity,
          imageUrl: receivedItem.imageUrl,
          purchasePrice: poItem.unitPrice,
          expectedSalePrice: receivedItem.expectedSalePrice,
          purchaseOrderId: id,
        }
      });
      createdInventoryItems.push(inventoryItem);
    }

    return {
      ...updatedPO,
      inventoryItems: createdInventoryItems
    };
  }

  // Get purchase order by ID
  async findOne(id: string) {
    const purchaseOrder = await this.database.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: true,
        investments: {
          include: {
            investor: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        inventory: true
      }
    });

    if (!purchaseOrder) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }

    return purchaseOrder;
  }

  // Get all purchase orders
  async findAll(skip?: number, take?: number) {
    const [data, total] = await Promise.all([
      this.database.purchaseOrder.findMany({
        skip,
        take,
        include: {
          items: true,
          investments: {
            include: {
              investor: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.database.purchaseOrder.count()
    ]);

    return { data, total };
  }

  // Delete purchase order
  async delete(id: string) {
    const purchaseOrder = await this.database.purchaseOrder.findUnique({
      where: { id },
      include: { inventory: true }
    });

    if (!purchaseOrder) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }

    if (purchaseOrder.inventory.length > 0) {
      throw new BadRequestException('Cannot delete purchase order with associated inventory items');
    }

    return await this.database.purchaseOrder.delete({
      where: { id }
    });
  }

  async addPayment(
    purchaseOrderId: string, 
    createPaymentDto: CreatePurchaseOrderPaymentDto
  ): Promise<{ payment: any; updatedPO: any }> {
    // Find the purchase order
    const purchaseOrder = await this.database.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: { payments: true }
    });

    if (!purchaseOrder) {
      throw new NotFoundException(`Purchase order with ID ${purchaseOrderId} not found`);
    }

    // Check if purchase order is cancelled
    if (purchaseOrder.status === POStatus.CANCELLED) {
      throw new BadRequestException('Cannot add payment to cancelled purchase order');
    }

    const { amount, paymentMethod, reference, notes, paymentDate } = createPaymentDto;

    // Validate payment amount doesn't exceed due amount
    if (amount > purchaseOrder.dueAmount) {
      throw new BadRequestException(
        `Payment amount (${amount}) exceeds due amount (${purchaseOrder.dueAmount})`
      );
    }

    // Validate payment amount is positive
    if (amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than 0');
    }

    // Create payment record
    const payment = await this.database.purchaseOrderPayment.create({
      data: {
        amount,
        paymentMethod,
        reference,
        notes,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        purchaseOrderId,
      },
    });

    // Update purchase order due amount
    const updatedPO = await this.database.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: {
        dueAmount: {
          decrement: amount,
        },
      },
      include: {
        payments: {
          orderBy: { paymentDate: 'desc' }
        },
        items: true,
        investments: {
          include: {
            investor: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Auto-create expense record for PO payment
    try {
      const systemUserId = purchaseOrder.createdBy || await this.getSystemUserId();
      await this.database.expense.create({
        data: {
          title: `PO Payment - ${purchaseOrder.poNumber}`,
          description: `Payment for purchase order ${purchaseOrder.poNumber} (${purchaseOrder.vendorName})`,
          amount,
          category: ExpenseCategory.PURCHASE_ORDER_PAYMENT,
          expenseDate: paymentDate ? new Date(paymentDate) : new Date(),
          paymentMethod: paymentMethod,
          status: ExpenseStatus.APPROVED,
          isAutoGenerated: true,
          purchaseOrderPaymentId: payment.id,
          recordedBy: systemUserId,
          notes: notes || undefined,
        },
      });
    } catch (_) {
      // Don't fail the main operation if expense logging fails
    }

    return { payment, updatedPO };
  }

  /**
   * Get payment summary for a purchase order
   */
  async getPaymentSummary(purchaseOrderId: string): Promise<PaymentSummaryDto> {
    const purchaseOrder = await this.database.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: { 
        payments: {
          orderBy: { paymentDate: 'asc' }
        }
      }
    });

    if (!purchaseOrder) {
      throw new NotFoundException(`Purchase order with ID ${purchaseOrderId} not found`);
    }

    const totalPaid = purchaseOrder.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingDue = purchaseOrder.totalAmount - totalPaid;

    return {
      totalAmount: purchaseOrder.totalAmount,
      totalPaid,
      remainingDue,
      paymentCount: purchaseOrder.payments.length,
      payments: purchaseOrder.payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        paymentMethod: payment.paymentMethod,
        reference: payment.reference,
        notes: payment.notes,
        purchaseOrderId: payment.purchaseOrderId,
        createdAt: payment.paymentDate
      }))
    };
  }

  /**
   * Get all payments for a purchase order
   */
  async getPayments(purchaseOrderId: string) {
    const payments = await this.database.purchaseOrderPayment.findMany({
      where: { purchaseOrderId },
      orderBy: { paymentDate: 'desc' },
      include: {
        purchaseOrder: {
          select: {
            poNumber: true,
            vendorName: true,
            totalAmount: true,
          }
        }
      }
    });

    return payments;
  }

  /**
   * Update a payment record
   */
  async updatePayment(
    paymentId: string, 
    updateData: Partial<CreatePurchaseOrderPaymentDto>
  ) {
    const payment = await this.database.purchaseOrderPayment.findUnique({
      where: { id: paymentId },
      include: { purchaseOrder: true }
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    // If updating amount, we need to adjust the purchase order due amount
    if (updateData.amount !== undefined) {
      const amountDifference = updateData.amount - payment.amount;
      
      if (amountDifference + payment.purchaseOrder.dueAmount < 0) {
        throw new BadRequestException('Updated payment amount would make due amount negative');
      }

      // Update payment
      const updatedPayment = await this.database.purchaseOrderPayment.update({
        where: { id: paymentId },
        data: updateData,
      });

      // Adjust purchase order due amount
      await this.database.purchaseOrder.update({
        where: { id: payment.purchaseOrderId },
        data: {
          dueAmount: {
            increment: -amountDifference,
          }
        }
      });

      return updatedPayment;
    }

    // If not updating amount, just update the payment
    return await this.database.purchaseOrderPayment.update({
      where: { id: paymentId },
      data: updateData,
    });
  }

  /**
   * Delete a payment and revert due amount
   */
  async deletePayment(paymentId: string) {
    const payment = await this.database.purchaseOrderPayment.findUnique({
      where: { id: paymentId },
      include: { purchaseOrder: true }
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    // Delete the payment
    await this.database.purchaseOrderPayment.delete({
      where: { id: paymentId },
    });

    // Revert the due amount
    await this.database.purchaseOrder.update({
      where: { id: payment.purchaseOrderId },
      data: {
        dueAmount: {
          increment: payment.amount,
        }
      }
    });

    return { message: 'Payment deleted successfully', revertedAmount: payment.amount };
  }

  async getDuePurchaseOrders(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [purchaseOrders, total] = await Promise.all([
      this.database.purchaseOrder.findMany({
        where: {
          dueAmount: { gt: 0 },
          status: { not: POStatus.CANCELLED }
        },
        include: {
          payments: {
            orderBy: { paymentDate: 'desc' }
          },
          user: {
            select: {
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              payments: true
            }
          }
        },
        orderBy: { dueAmount: 'desc' },
        skip,
        take: limit,
      }),
      this.database.purchaseOrder.count({
        where: {
          dueAmount: { gt: 0 },
          status: { not: POStatus.CANCELLED }
        }
      })
    ]);

    return {
      data: purchaseOrders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }
}