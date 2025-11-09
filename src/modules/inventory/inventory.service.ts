// src/inventory/inventory.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { DatabaseService } from '../database/database.service';
import { InventorySearchDto } from './dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: DatabaseService) {}

  async findAll(searchDto: InventorySearchDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'productName',
      sortOrder = 'asc'
    } = searchDto;

    const skip = (page - 1) * limit;
    const take = limit;

    // Build where condition for search
    const where: any = {};

    if (search) {
      where.OR = [
        { productCode: { contains: search, mode: 'insensitive' } },
        { productName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Execute queries in parallel
    const [inventory, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where,
        skip,
        take: Number(take),
        orderBy: { [sortBy]: sortOrder },
        include: {
          purchaseOrder: {
            select: {
              poNumber: true,
              vendorName: true,
            },
          },
        },
      }),
      this.prisma.inventory.count({ where }),
    ]);

    return {
      data: inventory,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { id },
      include: {
        purchaseOrder: {
          select: {
            poNumber: true,
            vendorName: true,
            vendorCountry: true,
          },
        },
      },
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    return inventory;
  }

  async update(id: string, updateInventoryDto: UpdateInventoryDto) {
    // Check if inventory exists
    const existingInventory = await this.prisma.inventory.findUnique({
      where: { id },
    });

    if (!existingInventory) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    return this.prisma.inventory.update({
      where: { id },
      data: updateInventoryDto,
      include: {
        purchaseOrder: {
          select: {
            poNumber: true,
            vendorName: true,
          },
        },
      },
    });
  }

  async getLowStockItems(threshold?: number) {
    const minStockThreshold = threshold || 10;
    
    return this.prisma.inventory.findMany({
      where: {
        quantity: {
          lte: minStockThreshold,
        },
      },
      include: {
        purchaseOrder: {
          select: {
            poNumber: true,
            vendorName: true,
          },
        },
      },
      orderBy: {
        quantity: 'asc',
      },
    });
  }
}