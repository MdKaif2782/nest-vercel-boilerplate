import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, POStatus, PaymentType } from '@prisma/client';
import { DatabaseService } from '../database/database.service'; // Adjust path as needed
import { PurchaseOrderInvestmentDto, CreatePurchaseOrderDto, UpdatePurchaseOrderDto, MarkAsReceivedDto } from './dto';

@Injectable()
export class PurchaseOrderService {
  constructor(private readonly database: DatabaseService) {}

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

    // Validate total investment amount matches PO total
    if (Math.abs(totalInvestmentAmount - totalAmount) > 0.01) {
      throw new BadRequestException('Total investment amount must match purchase order total amount');
    }

    // If investments cover 100%, return as is
    if (Math.abs(totalProfitPercentage - 100) < 0.01) {
      return { processedInvestments: investments };
    }

    // If more than 100%, throw error
    if (totalProfitPercentage > 100) {
      throw new BadRequestException('Total profit percentage cannot exceed 100%');
    }

    // If less than 100%, create self investment for remaining
    const remainingPercentage = 100 - totalProfitPercentage;
    const selfInvestmentAmount = totalAmount - totalInvestmentAmount;

    const selfInvestorId = await this.findOrCreateSelfInvestor();
    
    const selfInvestment: PurchaseOrderInvestmentDto = {
      investorId: selfInvestorId,
      investmentAmount: selfInvestmentAmount,
      profitPercentage: remainingPercentage,
      isFullInvestment: false
    };

    return {
      processedInvestments: [...investments, selfInvestment],
      selfInvestment
    };
  }

  // Create purchase order
  async createPurchaseOrder(dto: CreatePurchaseOrderDto) {
    const { items, investments, ...poData } = dto;

    // Validate and process investments
    const { processedInvestments } = await this.validateAndProcessInvestments(
      investments,
      poData.totalAmount
    );

    return await this.database.$transaction(async (prisma) => {
      // Create purchase order
      const purchaseOrder = await prisma.purchaseOrder.create({
        data: {
          ...poData,
          poNumber: await this.generatePONumber(),
          status: POStatus.PENDING,
          items: {
            create: items.map(item => ({
              ...item,
              taxPercentage: item.taxPercentage || 0, // Handle zero tax
            }))
          }
        },
        include: { items: true }
      });

      // Create investments
      for (const investment of processedInvestments) {
        await prisma.purchaseOrderInvestment.create({
          data: {
            ...investment,
            purchaseOrderId: purchaseOrder.id,
          }
        });
      }

      // Return complete purchase order with investments
      return await prisma.purchaseOrder.findUnique({
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

    return await this.database.$transaction(async (prisma) => {
      // Update basic PO data
      const updatedPO = await prisma.purchaseOrder.update({
        where: { id },
        data: poData
      });

      // Update items if provided
      if (items) {
        // Delete existing items
        await prisma.purchaseOrderItem.deleteMany({
          where: { purchaseOrderId: id }
        });

        // Create new items
        await prisma.purchaseOrderItem.createMany({
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
        await prisma.purchaseOrderInvestment.deleteMany({
          where: { purchaseOrderId: id }
        });

        // Create new investments
        for (const investment of processedInvestments) {
          await prisma.purchaseOrderInvestment.create({
            data: {
              ...investment,
              purchaseOrderId: id,
            }
          });
        }
      }

      return await prisma.purchaseOrder.findUnique({
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

    return await this.database.$transaction(async (prisma) => {
      // Update PO status and received date
      const updatedPO = await prisma.purchaseOrder.update({
        where: { id },
        data: {
          status: POStatus.RECEIVED,
          receivedAt: new Date(),
        }
      });

      // Create inventory items
      for (const receivedItem of receivedItems) {
        const poItem = purchaseOrder.items.find(item => item.id === receivedItem.purchaseOrderItemId)!;
        
        // Generate product code from product name
        const productCode = poItem.productName
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '_')
          .substring(0, 20) + `_${Date.now()}`;

        await prisma.inventory.create({
          data: {
            productCode,
            productName: poItem.productName,
            description: poItem.description,
            quantity: receivedItem.receivedQuantity,
            purchasePrice: poItem.unitPrice,
            expectedSalePrice: receivedItem.expectedSalePrice,
            purchaseOrderId: id,
          }
        });
      }

      return {
        ...updatedPO,
        inventoryItems: receivedItems.map(ri => ({
          productName: purchaseOrder.items.find(item => item.id === ri.purchaseOrderItemId)?.productName,
          receivedQuantity: ri.receivedQuantity,
          expectedSalePrice: ri.expectedSalePrice
        }))
      };
    });
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
}