"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const client_1 = require("@prisma/client");
let QuotationService = class QuotationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createQuotationDto) {
        const { items, ...quotationData } = createQuotationDto;
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
    }
    async findAll(searchDto) {
        const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = searchDto;
        const skip = (page - 1) * limit;
        const take = Number(limit);
        const where = {};
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
                                    imageUrl: true
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
    async findOne(id) {
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
                                imageUrl: true
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
            throw new common_1.NotFoundException(`Quotation with ID ${id} not found`);
        }
        return quotation;
    }
    async update(id, updateQuotationDto) {
        const existingQuotation = await this.prisma.quotation.findUnique({
            where: { id },
        });
        if (!existingQuotation) {
            throw new common_1.NotFoundException(`Quotation with ID ${id} not found`);
        }
        if (existingQuotation.status === 'ACCEPTED') {
            throw new common_1.BadRequestException('Cannot update an accepted quotation');
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
                                imageUrl: true
                            }
                        }
                    }
                }
            },
        });
    }
    async acceptQuotation(id, acceptQuotationDto) {
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
                throw new common_1.NotFoundException(`Quotation with ID ${id} not found`);
            }
            if (quotation.status === 'ACCEPTED') {
                throw new common_1.BadRequestException('Quotation is already accepted');
            }
            if (quotation.status === 'REJECTED') {
                throw new common_1.BadRequestException('Cannot accept a rejected quotation');
            }
            let updatedQuotation = quotation;
            if (acceptQuotationDto.items && acceptQuotationDto.items.length > 0) {
                const quotationItemIds = quotation.items.map(item => item.inventoryId);
                const requestItemIds = acceptQuotationDto.items.map(item => item.inventoryId);
                const invalidItems = requestItemIds.filter(id => !quotationItemIds.includes(id));
                if (invalidItems.length > 0) {
                    throw new common_1.BadRequestException(`Cannot add new items. Invalid inventory IDs: ${invalidItems.join(', ')}`);
                }
                for (const itemDto of acceptQuotationDto.items) {
                    const existingItem = quotation.items.find(item => item.inventoryId === itemDto.inventoryId);
                    if (existingItem) {
                        const updateData = {};
                        if (itemDto.quantity !== undefined)
                            updateData.quantity = itemDto.quantity;
                        if (itemDto.unitPrice !== undefined)
                            updateData.unitPrice = itemDto.unitPrice;
                        if (itemDto.packagePrice !== undefined)
                            updateData.packagePrice = itemDto.packagePrice;
                        if (itemDto.mrp !== undefined)
                            updateData.mrp = itemDto.mrp;
                        if (itemDto.taxPercentage !== undefined)
                            updateData.taxPercentage = itemDto.taxPercentage;
                        const newQuantity = itemDto.quantity !== undefined ? itemDto.quantity : existingItem.quantity;
                        const newUnitPrice = itemDto.unitPrice !== undefined ? itemDto.unitPrice : existingItem.unitPrice;
                        updateData.totalPrice = newQuantity * newUnitPrice;
                        await prisma.quotationItem.update({
                            where: { id: existingItem.id },
                            data: updateData
                        });
                    }
                }
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
                await prisma.quotation.update({
                    where: { id },
                    data: {
                        totalAmount: newTotalAmount,
                        taxAmount: newTaxAmount,
                    }
                });
            }
            const poCount = await prisma.buyerPurchaseOrder.count();
            const poNumber = `BPO-${String(poCount + 1).padStart(4, '0')}`;
            const buyerPO = await prisma.buyerPurchaseOrder.create({
                data: {
                    poNumber,
                    poDate: acceptQuotationDto.poDate ? new Date(acceptQuotationDto.poDate) : new Date(),
                    pdfUrl: acceptQuotationDto.pdfUrl,
                    externalUrl: acceptQuotationDto.externalUrl,
                    quotation: { connect: { id } },
                }
            });
            const recorder = await prisma.user.findFirst();
            if (!recorder)
                throw new common_1.BadRequestException("At least one admin id must exists");
            if (acceptQuotationDto.commission && acceptQuotationDto.commission > 0) {
                await prisma.expense.create({
                    data: {
                        title: `Commission for Quotation ${quotation.quotationNumber}`,
                        description: `Commission for quotation ${quotation.quotationNumber} to ${quotation.companyName}`,
                        amount: acceptQuotationDto.commission,
                        category: client_1.ExpenseCategory.COMMISSIONS,
                        paymentMethod: client_1.PaymentMethod.CASH,
                        status: client_1.ExpenseStatus.PENDING,
                        notes: `Commission recorded for accepting quotation ${quotation.quotationNumber}`,
                        recordedBy: recorder.id
                    }
                });
            }
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
    async updateStatus(id, status) {
        const quotation = await this.prisma.quotation.findUnique({ where: { id } });
        if (!quotation) {
            throw new common_1.NotFoundException(`Quotation with ID ${id} not found`);
        }
        if (quotation.status === 'ACCEPTED' && status !== 'ACCEPTED') {
            throw new common_1.BadRequestException('Cannot change status of an accepted quotation');
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
                                imageUrl: true
                            }
                        }
                    }
                }
            },
        });
    }
    async remove(id) {
        const quotation = await this.prisma.quotation.findUnique({
            where: { id },
        });
        if (!quotation) {
            throw new common_1.NotFoundException(`Quotation with ID ${id} not found`);
        }
        if (quotation.status === 'ACCEPTED') {
            throw new common_1.BadRequestException('Cannot delete an accepted quotation');
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
                                imageUrl: true
                            }
                        }
                    }
                }
            }
        });
    }
};
exports.QuotationService = QuotationService;
exports.QuotationService = QuotationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], QuotationService);
//# sourceMappingURL=quotation.service.js.map