import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateRetailSaleDto, RetailSaleQueryDto, RetailSaleResponseDto, RetailAnalyticsDto } from './dto';

@Injectable()
export class RetailSaleService {
  constructor(private prisma: DatabaseService) {}

  async createRetailSale(createRetailSaleDto: CreateRetailSaleDto): Promise<RetailSaleResponseDto> {
    // Validate inventory availability
    for (const item of createRetailSaleDto.items) {
      const inventory = await this.prisma.inventory.findUnique({
        where: { id: item.inventoryId },
      });

      if (!inventory) {
        throw new NotFoundException(`Inventory item ${item.inventoryId} not found`);
      }

      if (inventory.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${inventory.productName}. Available: ${inventory.quantity}, Requested: ${item.quantity}`
        );
      }
    }

    // Calculate amounts
    const subtotal = createRetailSaleDto.items.reduce(
      (sum, item) => sum + (item.quantity * item.unitPrice),
      0
    );
    const discount = createRetailSaleDto.discount || 0;
    const tax = createRetailSaleDto.tax || 0;
    const totalAmount = subtotal - discount + tax;

    // Generate sale number
    const saleNumber = await this.generateSaleNumber();

    // Create retail sale with items in a transaction
    const retailSale = await this.prisma.$transaction(async (tx) => {
      // Create the sale
      const sale = await tx.retailSale.create({
        data: {
          saleNumber,
          saleDate: new Date(),
          customerName: createRetailSaleDto.customerName,
          customerPhone: createRetailSaleDto.customerPhone,
          subtotal,
          discount,
          tax,
          totalAmount,
          paymentMethod: createRetailSaleDto.paymentMethod,
          reference: createRetailSaleDto.reference,
          notes: createRetailSaleDto.notes,
          items: {
            create: createRetailSaleDto.items.map(item => ({
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
              inventoryId: item.inventoryId,
            })),
          },
        },
        include: {
          items: {
            include: {
              inventory: {
                select: {
                  id: true,
                  productCode: true,
                  productName: true,
                  description: true,
                },
              },
            },
          },
        },
      });

      // Update inventory quantities
      for (const item of createRetailSaleDto.items) {
        await tx.inventory.update({
          where: { id: item.inventoryId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return sale;
    });

    return {
      id: retailSale.id,
      saleNumber: retailSale.saleNumber,
      saleDate: retailSale.saleDate,
      customerName: retailSale.customerName,
      customerPhone: retailSale.customerPhone,
      subtotal: retailSale.subtotal,
      discount: retailSale.discount,
      tax: retailSale.tax,
      totalAmount: retailSale.totalAmount,
      paymentMethod: retailSale.paymentMethod,
      reference: retailSale.reference,
      notes: retailSale.notes,
      createdAt: retailSale.createdAt,
      updatedAt: retailSale.updatedAt,
      items: retailSale.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        inventory: item.inventory,
      })),
    };
  }

  async getAllRetailSales(query: RetailSaleQueryDto) {
    const { page = 1, limit = 10, search, startDate, endDate, paymentMethod } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { saleNumber: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.saleDate = {};
      if (startDate) where.saleDate.gte = new Date(startDate);
      if (endDate) where.saleDate.lte = new Date(endDate);
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    const [sales, total] = await Promise.all([
      this.prisma.retailSale.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { saleDate: 'desc' },
        include: {
          items: {
            include: {
              inventory: {
                select: {
                  id: true,
                  productCode: true,
                  productName: true,
                  description: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.retailSale.count({ where }),
    ]);

    return {
      sales: sales.map(sale => ({
        id: sale.id,
        saleNumber: sale.saleNumber,
        saleDate: sale.saleDate,
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
        subtotal: sale.subtotal,
        discount: sale.discount,
        tax: sale.tax,
        totalAmount: sale.totalAmount,
        paymentMethod: sale.paymentMethod,
        reference: sale.reference,
        notes: sale.notes,
        createdAt: sale.createdAt,
        updatedAt: sale.updatedAt,
        items: sale.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          inventory: item.inventory,
        })),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getRetailSaleById(id: string): Promise<RetailSaleResponseDto> {
    const sale = await this.prisma.retailSale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            inventory: {
              select: {
                id: true,
                productCode: true,
                productName: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException(`Retail sale with ID ${id} not found`);
    }

    return {
      id: sale.id,
      saleNumber: sale.saleNumber,
      saleDate: sale.saleDate,
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
      subtotal: sale.subtotal,
      discount: sale.discount,
      tax: sale.tax,
      totalAmount: sale.totalAmount,
      paymentMethod: sale.paymentMethod,
      reference: sale.reference,
      notes: sale.notes,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
      items: sale.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        inventory: item.inventory,
      })),
    };
  }

  async getRetailAnalytics(startDate?: string, endDate?: string): Promise<RetailAnalyticsDto> {
    const where: any = {};
    
    if (startDate || endDate) {
      where.saleDate = {};
      if (startDate) where.saleDate.gte = new Date(startDate);
      if (endDate) where.saleDate.lte = new Date(endDate);
    }

    const [sales, salesItems] = await Promise.all([
      this.prisma.retailSale.findMany({
        where,
        include: {
          items: {
            include: {
              inventory: true,
            },
          },
        },
      }),
      this.prisma.retailSaleItem.findMany({
        where: {
          retailSale: where,
        },
        include: {
          inventory: true,
        },
      }),
    ]);

    // Calculate summary
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalTransactions = sales.length;
    const totalItemsSold = salesItems.reduce((sum, item) => sum + item.quantity, 0);

    const paymentMethodCounts = sales.reduce((acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    // Top selling products
    const productSales = salesItems.reduce((acc, item) => {
      const key = item.inventory.productCode;
      if (!acc[key]) {
        acc[key] = {
          productCode: item.inventory.productCode,
          productName: item.inventory.productName,
          quantitySold: 0,
          revenue: 0,
        };
      }
      acc[key].quantitySold += item.quantity;
      acc[key].revenue += item.totalPrice;
      return acc;
    }, {} as Record<string, any>);

    const topSellingProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);

    // Daily sales
    const dailySalesMap = sales.reduce((acc, sale) => {
      const date = sale.saleDate.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          totalSales: 0,
          totalTransactions: 0,
          revenue: 0,
        };
      }
      acc[date].totalSales += 1;
      acc[date].totalTransactions += 1;
      acc[date].revenue += sale.totalAmount;
      return acc;
    }, {} as Record<string, any>);

    const dailySales = Object.values(dailySalesMap).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Payment method breakdown
    const paymentMethodBreakdown = Object.entries(paymentMethodCounts).map(([method, amount]) => ({
      method: method as any,
      count: sales.filter(s => s.paymentMethod === method).length,
      amount,
      percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0,
    }));

    return {
      summary: {
        totalSales: totalTransactions,
        totalRevenue,
        totalTransactions,
        averageTransactionValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
        totalItemsSold,
        cashSales: paymentMethodCounts['CASH'] || 0,
        cardSales: paymentMethodCounts['CARD'] || 0,
        bankTransferSales: paymentMethodCounts['BANK_TRANSFER'] || 0,
        chequeSales: paymentMethodCounts['CHEQUE'] || 0,
      },
      topSellingProducts,
      dailySales,
      paymentMethodBreakdown,
    };
  }

  private async generateSaleNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    // Count retail sales in current month
    const startOfMonth = new Date(year, today.getMonth(), 1);
    const endOfMonth = new Date(year, today.getMonth() + 1, 0);
    
    const count = await this.prisma.retailSale.count({
      where: {
        saleDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    return `RS-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }

  async deleteRetailSale(id: string) {
    const sale = await this.getRetailSaleById(id);

    // Return items to inventory in a transaction
    await this.prisma.$transaction(async (tx) => {
      // Restore inventory quantities
      for (const item of sale.items) {
        await tx.inventory.update({
          where: { id: item.inventory.id },
          data: {
            quantity: {
              increment: item.quantity,
            },
          },
        });
      }

      // Delete the sale (cascade will delete items)
      await tx.retailSale.delete({
        where: { id },
      });
    });

    return { message: 'Retail sale deleted successfully' };
  }
}
