import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { 
  CreateChallanDto, 
  UpdateChallanStatusDto, 
  DispatchBPODto,
  BpoSummaryDto 
} from './dto';
import { ChallanStatus } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ChallanService {
  constructor(private prisma: DatabaseService) {}

  // Helper to calculate total quantity from quotation items
  private calculateTotalQuantity(quotation: any): number {
    return quotation?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
  }

  // Get BPOs without challan or not dispatched
  async getPendingBPOs() {
    const bpos = await this.prisma.buyerPurchaseOrder.findMany({
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
            items: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return bpos.map(bpo => {
      const totalQuantity = this.calculateTotalQuantity(bpo.quotation);
      const dispatchedQuantity = bpo.dispatchedQuantity;
      
      return {
        id: bpo.id,
        poNumber: bpo.poNumber,
        companyName: bpo.quotation.companyName,
        totalQuantity,
        dispatchedQuantity,
        remainingQuantity: totalQuantity - dispatchedQuantity,
        hasChallan: bpo.challans.length > 0,
        challanStatus: bpo.challans[0]?.status,
        items: bpo.quotation.items.map(item => ({
          inventoryId: item.inventoryId,
          productName: item.inventory.productName,
          productCode: item.inventory.productCode,
          orderedQuantity: item.quantity,
          availableQuantity: item.inventory.quantity,
          unitPrice: item.unitPrice
        }))
      };
    });
  }

  // Create challan for BPO
  async createChallan(dto: CreateChallanDto) {
    // Get BPO with quotation items
    const bpo = await this.prisma.buyerPurchaseOrder.findUnique({
      where: { id: dto.buyerPurchaseOrderId },
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
            items: true
          }
        }
      }
    });

    if (!bpo) {
      throw new NotFoundException('Buyer Purchase Order not found');
    }

    // Calculate total ordered quantity from quotation
    const totalOrdered = this.calculateTotalQuantity(bpo.quotation);
    const alreadyDispatched = bpo.dispatchedQuantity;
    const requestedDispatch = dto.items.reduce((sum, item) => sum + item.quantity, 0);

    if (alreadyDispatched + requestedDispatch > totalOrdered) {
      throw new BadRequestException(
        `Cannot dispatch ${requestedDispatch} items. Already dispatched ${alreadyDispatched} of ${totalOrdered}`
      );
    }

    // Check if items exist in the quotation
    const quotationItemMap = new Map(
      bpo.quotation.items.map(item => [item.inventoryId, item])
    );

    // Validate each item in the challan
    for (const item of dto.items) {
      const quotationItem = quotationItemMap.get(item.inventoryId);
      if (!quotationItem) {
        throw new BadRequestException(`Item ${item.inventoryId} not found in purchase order`);
      }

      // Check if we're trying to dispatch more than ordered
      const alreadyDispatchedForItem = bpo.challans.reduce((sum, challan) => {
        const challanItem = challan.items.find(ci => ci.inventoryId === item.inventoryId);
        return sum + (challanItem?.quantity || 0);
      }, 0);

      if (alreadyDispatchedForItem + item.quantity > quotationItem.quantity) {
        throw new BadRequestException(
          `Cannot dispatch ${item.quantity} of ${quotationItem.inventory.productName}. ` +
          `Ordered: ${quotationItem.quantity}, Already dispatched: ${alreadyDispatchedForItem}`
        );
      }

      // Check inventory availability
      const inventory = quotationItem.inventory;
      if (inventory.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient inventory for ${inventory.productName}. Available: ${inventory.quantity}, Requested: ${item.quantity}`
        );
      }
    }

    // Create challan in transaction
    return await this.prisma.$transaction(async (prisma) => {
      // Update inventory quantities
      for (const item of dto.items) {
        await prisma.inventory.update({
          where: { id: item.inventoryId },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        });
      }

      // Update BPO dispatched quantity
      await prisma.buyerPurchaseOrder.update({
        where: { id: bpo.id },
        data: {
          dispatchedQuantity: {
            increment: requestedDispatch
          }
        }
      });

      // Generate challan number
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      
      const challanCount = await prisma.challan.count({
        where: {
          createdAt: {
            gte: new Date(`${year}-${month}-01`),
            lt: new Date(`${year}-${month}-${day} 23:59:59`)
          }
        }
      });
      
      const challanNumber = `CH${year}${month}${day}${String(challanCount + 1).padStart(3, '0')}`;

      // Create challan
      const challan = await prisma.challan.create({
        data: {
          challanNumber,
          buyerPurchaseOrderId: bpo.id,
          dispatchDate: dto.dispatchDate || new Date(),
          deliveryDate: dto.deliveryDate,
          status: dto.status || 'DRAFT',
          items: {
            create: dto.items.map(item => ({
              inventoryId: item.inventoryId,
              quantity: item.quantity
            }))
          }
        },
        include: {
          items: {
            include: {
              inventory: true
            }
          },
          buyerPurchaseOrder: {
            include: {
              quotation: true
            }
          }
        }
      });

      return challan;
    });
  }

  // Mark BPO as dispatched (creates challan automatically)
  async markAsDispatched(dto: DispatchBPODto) {
    const bpo = await this.prisma.buyerPurchaseOrder.findUnique({
      where: { id: dto.buyerPurchaseOrderId },
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
            items: true
          }
        }
      }
    });

    if (!bpo) {
      throw new NotFoundException('Buyer Purchase Order not found');
    }

    // Check if already fully dispatched
    const totalOrdered = this.calculateTotalQuantity(bpo.quotation);
    if (bpo.dispatchedQuantity >= totalOrdered) {
      throw new BadRequestException('Purchase order is already fully dispatched');
    }

    // Check if all remaining items are available
    const remainingItems = bpo.quotation.items.map(item => {
      const alreadyDispatchedForItem = bpo.challans.reduce((sum, challan) => {
        const challanItem = challan.items.find(ci => ci.inventoryId === item.inventoryId);
        return sum + (challanItem?.quantity || 0);
      }, 0);
      
      const remainingToDispatch = item.quantity - alreadyDispatchedForItem;
      
      return {
        inventoryId: item.inventoryId,
        quantity: remainingToDispatch,
        inventory: item.inventory
      };
    });

    // Check inventory availability for remaining items
    for (const item of remainingItems) {
      if (item.quantity > 0 && item.inventory.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient inventory for ${item.inventory.productName}. ` +
          `Available: ${item.inventory.quantity}, Required: ${item.quantity}`
        );
      }
    }

    // Create challan with remaining items
    const challanItems = remainingItems
      .filter(item => item.quantity > 0)
      .map(item => ({
        inventoryId: item.inventoryId,
        quantity: item.quantity
      }));

    if (challanItems.length === 0) {
      throw new BadRequestException('No items remaining to dispatch');
    }

    return await this.createChallan({
      buyerPurchaseOrderId: bpo.id,
      items: challanItems,
      dispatchDate: new Date(),
      status: dto.status || 'DISPATCHED'
    } as CreateChallanDto);
  }

  // Update challan status
  async updateChallanStatus(challanId: string, dto: UpdateChallanStatusDto) {
    const challan = await this.prisma.challan.findUnique({
      where: { id: challanId },
      include: {
        items: true,
        buyerPurchaseOrder: true
      }
    });

    if (!challan) {
      throw new NotFoundException('Challan not found');
    }

    // Validate status transition
    this.validateStatusTransition(challan.status, dto.status);

    // If marking as RETURNED, return items to inventory
    if (dto.status === 'RETURNED' && challan.status !== 'RETURNED') {
      await this.prisma.$transaction(async (prisma) => {
        // Return items to inventory
        for (const item of challan.items) {
          await prisma.inventory.update({
            where: { id: item.inventoryId },
            data: {
              quantity: {
                increment: item.quantity
              }
            }
          });
        }

        // Update BPO dispatched quantity
        const totalReturned = challan.items.reduce((sum, item) => sum + item.quantity, 0);
        await prisma.buyerPurchaseOrder.update({
          where: { id: challan.buyerPurchaseOrderId },
          data: {
            dispatchedQuantity: {
              decrement: totalReturned
            }
          }
        });
      });
    }

    // If marking as DELIVERED from DISPATCHED, update delivery date
    let updateData: any = {
      status: dto.status as ChallanStatus
    };

    if (dto.status === 'DELIVERED') {
      updateData.deliveryDate = new Date();
    } else if (dto.status === 'DISPATCHED' && !challan.dispatchDate) {
      updateData.dispatchDate = new Date();
    }

    return await this.prisma.challan.update({
      where: { id: challanId },
      data: updateData,
      include: {
        items: {
          include: {
            inventory: true
          }
        },
        buyerPurchaseOrder: {
          include: {
            quotation: true
          }
        }
      }
    });
  }

  // Validate status transitions
  private validateStatusTransition(currentStatus: string, newStatus: string) {
    const validTransitions: Record<string, string[]> = {
      'DRAFT': ['DISPATCHED', 'CANCELLED'],
      'DISPATCHED': ['DELIVERED', 'RETURNED', 'REJECTED'],
      'DELIVERED': ['RETURNED'],
      'RETURNED': [],
      'REJECTED': []
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`
      );
    }
  }

  // Get dispatch summary
  async getDispatchSummary() {
    const bpos = await this.prisma.buyerPurchaseOrder.findMany({
      include: {
        quotation: {
          include: {
            items: true
          }
        },
        challans: {
          include: {
            items: true
          }
        }
      }
    });

    const summary = {
      totalBPOs: bpos.length,
      fullyDispatched: 0,
      partiallyDispatched: 0,
      notDispatched: 0,
      totalItemsOrdered: 0,
      totalItemsDispatched: 0,
      totalValueOrdered: 0,
      totalValueDispatched: 0,
      bpoDetails: [] as BpoSummaryDto[]
    };

    for (const bpo of bpos) {
      const totalOrdered = this.calculateTotalQuantity(bpo.quotation);
      const dispatched = bpo.dispatchedQuantity;
      const remaining = totalOrdered - dispatched;
      const hasChallan = bpo.challans.length > 0;
      
      // Calculate values
      const orderedValue = bpo.quotation.totalAmount || 0;
      const dispatchedValue = orderedValue * (dispatched / totalOrdered) || 0;

      if (dispatched === 0) {
        summary.notDispatched++;
      } else if (dispatched < totalOrdered) {
        summary.partiallyDispatched++;
      } else {
        summary.fullyDispatched++;
      }

      summary.totalItemsOrdered += totalOrdered;
      summary.totalItemsDispatched += dispatched;
      summary.totalValueOrdered += orderedValue;
      summary.totalValueDispatched += dispatchedValue;

      summary.bpoDetails.push({
        id: bpo.id,
        poNumber: bpo.poNumber,
        companyName: bpo.quotation.companyName,
        totalQuantity: totalOrdered,
        dispatchedQuantity: dispatched,
        remainingQuantity: remaining,
        orderedValue,
        dispatchedValue,
        hasChallan,
        challanStatus: bpo.challans[0]?.status,
        createdAt: bpo.createdAt
      });
    }

    return summary;
  }

  // Get all challans
  async getAllChallans(status?: string) {
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    return await this.prisma.challan.findMany({
      where,
      include: {
        items: {
          include: {
            inventory: true
          }
        },
        buyerPurchaseOrder: {
          include: {
            quotation: {
              include: {
                items: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Get challan by ID
  async getChallanById(id: string) {
    const challan = await this.prisma.challan.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            inventory: true
          }
        },
        buyerPurchaseOrder: {
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
        }
      }
    });

    if (!challan) {
      throw new NotFoundException('Challan not found');
    }

    return challan;
  }

  // Get challans by BPO ID
  async getChallansByBPOId(bpoId: string) {
    const bpo = await this.prisma.buyerPurchaseOrder.findUnique({
      where: { id: bpoId },
      include: {
        challans: {
          include: {
            items: {
              include: {
                inventory: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!bpo) {
      throw new NotFoundException('Buyer Purchase Order not found');
    }

    return bpo.challans;
  }
}