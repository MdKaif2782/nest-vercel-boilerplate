// src/quotation/quotation.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { QuotationSearchDto } from './dto/update-quotation.dto';
import { AcceptQuotationDto } from './dto/update-quotation.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class QuotationService {
  constructor(private prisma: DatabaseService) {}

  async create(createQuotationDto: CreateQuotationDto) {
    const { items, ...quotationData } = createQuotationDto;

    // Generate quotation number
    const quotationCount = await this.prisma.quotation.count();
    const quotationNumber = `QT-${String(quotationCount + 1).padStart(4, '0')}`;

    return this.prisma.quotation.create({
      data: {
        ...quotationData,
        quotationNumber,
        items: {
          create: items.map(item => ({
            quantity: item.quantity,
            mrp: item.mrp,
            unitPrice: item.unitPrice,
            packagePrice: item.packagePrice,
            taxPercentage: item.taxPercentage,
            totalPrice: item.quantity * item.unitPrice,
            inventory: {
              connect: { id: item.inventoryId }
            }
          }))
        }
      },
      include: {
        items: {
          include: {
            inventory: {
              select: {
                productCode: true,
                productName: true,
                description: true
              }
            }
          }
        }
      }
    });
  }

  async findAll(searchDto: QuotationSearchDto) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = searchDto;

    const skip = (page - 1) * limit;
    const take = Number(limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { quotationNumber: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { companyAddress: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [quotations, total] = await Promise.all([
      this.prisma.quotation.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          items: {
            include: {
              inventory: {
                select: {
                  productCode: true,
                  productName: true,
                }
              }
            }
          },
          buyerPO: {
            select: {
              id: true,
              poNumber: true,
              poDate: true,
            }
          }
        },
      }),
      this.prisma.quotation.count({ where }),
    ]);

    return {
      data: quotations,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const quotation = await this.prisma.quotation.findUnique({
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
                quantity: true,
                expectedSalePrice: true,
              }
            }
          }
        },
        buyerPO: {
          include: {
            bills: {
              select: {
                id: true,
                billNumber: true,
                billDate: true,
                totalAmount: true,
                status: true,
              }
            },
            challans: {
              select: {
                id: true,
                challanNumber: true,
                status: true,
                dispatchDate: true,
              }
            }
          }
        }
      },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    return quotation;
  }

  async update(id: string, updateQuotationDto: UpdateQuotationDto) {
    const existingQuotation = await this.prisma.quotation.findUnique({
      where: { id },
    });

    if (!existingQuotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    if (existingQuotation.status === 'ACCEPTED') {
      throw new BadRequestException('Cannot update an accepted quotation');
    }

    return this.prisma.quotation.update({
      where: { id },
      data: updateQuotationDto,
      include: {
        items: {
          include: {
            inventory: {
              select: {
                productCode: true,
                productName: true,
              }
            }
          }
        }
      },
    });
  }

  async acceptQuotation(id: string, acceptQuotationDto: AcceptQuotationDto) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    if (quotation.status === 'ACCEPTED') {
      throw new BadRequestException('Quotation is already accepted');
    }

    if (quotation.status === 'REJECTED') {
      throw new BadRequestException('Cannot accept a rejected quotation');
    }

    // Generate buyer PO number
    const poCount = await this.prisma.buyerPurchaseOrder.count();
    const poNumber = `BPO-${String(poCount + 1).padStart(4, '0')}`;

    // Create Buyer Purchase Order
    const buyerPO = await this.prisma.buyerPurchaseOrder.create({
      data: {
        poNumber,
        poDate: acceptQuotationDto.poDate || new Date(),
        pdfUrl: acceptQuotationDto.pdfUrl,
        externalUrl: acceptQuotationDto.externalUrl,
        quotation: { connect: { id } },
      }
    });

    // Update quotation status to ACCEPTED
    const updatedQuotation = await this.prisma.quotation.update({
      where: { id },
      data: { status: 'ACCEPTED' },
      include: {
        items: {
          include: {
            inventory: {
              select: {
                productCode: true,
                productName: true,
              }
            }
          }
        },
        buyerPO: true
      }
    });

    return updatedQuotation;
  }

  async updateStatus(id: string, status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED') {
    const quotation = await this.prisma.quotation.findUnique({ where: { id } });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    if (quotation.status === 'ACCEPTED' && status !== 'ACCEPTED') {
      throw new BadRequestException('Cannot change status of an accepted quotation');
    }

    return this.prisma.quotation.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            inventory: {
              select: {
                productCode: true,
                productName: true,
              }
            }
          }
        }
      },
    });
  }

  async remove(id: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    if (quotation.status === 'ACCEPTED') {
      throw new BadRequestException('Cannot delete an accepted quotation');
    }

    return this.prisma.quotation.delete({
      where: { id },
    });
  }

  async getExpiredQuotations() {
    const now = new Date();
    
    return this.prisma.quotation.findMany({
      where: {
        validUntil: { lt: now },
        status: 'PENDING'
      },
      include: {
        items: {
          include: {
            inventory: {
              select: {
                productCode: true,
                productName: true,
              }
            }
          }
        }
      }
    });
  }
}
