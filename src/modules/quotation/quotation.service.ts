// src/quotation/quotation.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { AcceptQuotationDto, QuotationSearchDto, UpdateQuotationDto } from './dto/update-quotation.dto';
import { DatabaseService } from '../database/database.service';
import { ExpenseCategory, ExpenseStatus, PaymentMethod, QuotationStatus } from '@prisma/client';
import { PdfService } from '../pdf/pdf.service';

@Injectable()
export class QuotationService {
  constructor(
    private prisma: DatabaseService,
    private readonly pdfService: PdfService,
  ) {}

async create(createQuotationDto: CreateQuotationDto) {
    const { items, ...quotationData } = createQuotationDto;

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    // Generate quotation number
    const quotationCount = await this.prisma.quotation.count();
    const quotationNumber = `GSGC-${String(quotationCount + 1).padStart(4, '0')}`;

    // Create quotation
    const quotation = await this.prisma.quotation.create({
      data: {
        ...quotationData,
        quotationNumber,
        totalAmount,
        taxAmount: quotationData.taxAmount || 0,
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
                id: true,
                productCode: true,
                productName: true,
                description: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });

    return quotation;
  }

  async generatePdf(quotationId: string): Promise<Buffer> {
    // Check if quotation exists
    const quotation = await this.prisma.quotation.findUnique({
      where: { id: quotationId },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${quotationId} not found`);
    }

    // Generate PDF
    const pdfBuffer = await this.pdfService.generateQuotationPdf(quotationId);
    
    return pdfBuffer;
  }

  async getQuotationWithPdf(quotationId: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        items: {
          include: {
            inventory: true,
          },
        },
      },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${quotationId} not found`);
    }

    // Generate PDF
    const pdfBuffer = await this.pdfService.generateQuotationPdf(quotationId);
    
    return {
      ...quotation,
      pdfBase64: pdfBuffer.toString('base64'),
      pdfBuffer: pdfBuffer,
    };
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
                  id: true,
                  productCode: true,
                  productName: true,
                  imageUrl: true // Include imageUrl
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
                imageUrl: true // Include imageUrl
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
                id: true,
                productCode: true,
                productName: true,
                imageUrl: true // Include imageUrl
              }
            }
          }
        }
      },
    });
  }

 async acceptQuotation(id: string, acceptQuotationDto: AcceptQuotationDto) {
    return this.prisma.$transaction(async (prisma) => {
      const quotation = await prisma.quotation.findUnique({
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
                  imageUrl: true,
                  quantity: true,
                  expectedSalePrice: true,
                  purchasePrice: true
                }
              }
            }
          } 
        }
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

      let updatedQuotation = quotation;
      
      // Update quotation items if provided
      if (acceptQuotationDto.items && acceptQuotationDto.items.length > 0) {
        // Validate that all items exist in the quotation
        const quotationItemIds = quotation.items.map(item => item.inventoryId);
        const requestItemIds = acceptQuotationDto.items.map(item => item.inventoryId);
        
        // Check for invalid items (items not in original quotation)
        const invalidItems = requestItemIds.filter(id => !quotationItemIds.includes(id));
        if (invalidItems.length > 0) {
          throw new BadRequestException(
            `Cannot add new items. Invalid inventory IDs: ${invalidItems.join(', ')}`
          );
        }

        // Update each item
        for (const itemDto of acceptQuotationDto.items) {
          const existingItem = quotation.items.find(
            item => item.inventoryId === itemDto.inventoryId
          );

          if (existingItem) {
            const updateData: any = {};
            
            // Only update fields that are provided
            if (itemDto.quantity !== undefined) updateData.quantity = itemDto.quantity;
            if (itemDto.unitPrice !== undefined) updateData.unitPrice = itemDto.unitPrice;
            if (itemDto.packagePrice !== undefined) updateData.packagePrice = itemDto.packagePrice;
            if (itemDto.mrp !== undefined) updateData.mrp = itemDto.mrp;
            if (itemDto.taxPercentage !== undefined) updateData.taxPercentage = itemDto.taxPercentage;
            
            // Recalculate totalPrice if quantity or unitPrice changes
            const newQuantity = itemDto.quantity !== undefined ? itemDto.quantity : existingItem.quantity;
            const newUnitPrice = itemDto.unitPrice !== undefined ? itemDto.unitPrice : existingItem.unitPrice;
            updateData.totalPrice = newQuantity * newUnitPrice;

            await prisma.quotationItem.update({
              where: { id: existingItem.id },
              data: updateData
            });
          }
        }

        // Recalculate quotation totals
        const updatedItems = await prisma.quotationItem.findMany({
          where: { quotationId: id },
          include: { 
            inventory: {
              select: {
                id: true,
                productCode: true,
                productName: true,
                description: true,
                imageUrl: true
              }
            }
          }
        });

        const newTotalAmount = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const newTaxAmount = updatedItems.reduce((sum, item) => {
          if (item.taxPercentage) {
            return sum + (item.totalPrice * (item.taxPercentage / 100));
          }
          return sum;
        }, 0);

        // Update quotation with new totals
        await prisma.quotation.update({
          where: { id },
          data: {
            totalAmount: newTotalAmount,
            taxAmount: newTaxAmount,
          }
        });
      }

      // Generate buyer PO number
      const poCount = await prisma.buyerPurchaseOrder.count();
      const poNumber = `BPO-${String(poCount + 1).padStart(4, '0')}`;

      // Create Buyer Purchase Order
      const buyerPO = await prisma.buyerPurchaseOrder.create({
        data: {
          poNumber,
          poDate: acceptQuotationDto.poDate ? new Date(acceptQuotationDto.poDate) : new Date(),
          pdfUrl: acceptQuotationDto.pdfUrl,
          externalUrl: acceptQuotationDto.externalUrl,
          quotation: { connect: { id } },
        }
      });

      // Create commission expense if commission is provided and greater than 0

      const recorder = await prisma.user.findFirst();
      if(!recorder) throw new BadRequestException("At least one admin id must exists")

      if (acceptQuotationDto.commission && acceptQuotationDto.commission > 0) {
        await prisma.expense.create({
          data: {
            title: `Commission for Quotation ${quotation.quotationNumber}`,
            description: `Commission for quotation ${quotation.quotationNumber} to ${quotation.companyName}`,
            amount: acceptQuotationDto.commission,
            category: ExpenseCategory.COMMISSIONS,
            paymentMethod: PaymentMethod.CASH,
            status: ExpenseStatus.PENDING,
            notes: `Commission recorded for accepting quotation ${quotation.quotationNumber}`,
            recordedBy: recorder.id
          }
        });
      }

      // Update quotation status to ACCEPTED and return with full data
      const finalQuotation = await prisma.quotation.update({
        where: { id },
        data: { status: 'ACCEPTED' },
        include: {
          items: {
            include: {
              inventory: {
                select: {
                  id: true,
                  productCode: true,
                  productName: true,
                  description: true,
                  imageUrl: true,
                  quantity: true,
                  expectedSalePrice: true,
                  purchasePrice: true
                }
              }
            }
          },
          buyerPO: true
        }
      });

      return finalQuotation;
    });
  }


  async updateStatus(id: string, status: QuotationStatus) {
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
                id: true,
                productCode: true,
                productName: true,
                imageUrl: true // Include imageUrl
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
                id: true,
                productCode: true,
                productName: true,
                imageUrl: true // Include imageUrl
              }
            }
          }
        }
      }
    });
  }
}