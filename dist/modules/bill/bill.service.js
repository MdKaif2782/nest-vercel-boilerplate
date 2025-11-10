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
exports.BillService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let BillService = class BillService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createBillDto, createdBy) {
        const { buyerPOId, ...billData } = createBillDto;
        return this.prisma.$transaction(async (tx) => {
            const buyerPO = await tx.buyerPurchaseOrder.findUnique({
                where: { id: buyerPOId },
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
            if (!buyerPO) {
                throw new common_1.NotFoundException(`Buyer Purchase Order with ID ${buyerPOId} not found`);
            }
            const existingBills = await tx.bill.findMany({
                where: { buyerPOId }
            });
            const totalBilled = existingBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
            const quotationTotal = buyerPO.quotation.totalAmount;
            const remainingAmount = quotationTotal - totalBilled;
            if (remainingAmount <= 0) {
                throw new common_1.BadRequestException('This purchase order has been fully billed');
            }
            const billCount = await tx.bill.count();
            const billNumber = `BL-${String(billCount + 1).padStart(4, '0')}`;
            const billItems = buyerPO.quotation.items.map(item => ({
                productDescription: item.inventory.productName,
                packagingDescription: item.inventory.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                inventoryId: item.inventoryId
            }));
            const totalAmount = buyerPO.quotation.totalAmount;
            const taxAmount = buyerPO.quotation.taxAmount || 0;
            const dueAmount = totalAmount;
            const bill = await tx.bill.create({
                data: {
                    billNumber,
                    billDate: new Date(),
                    vatRegNo: billData.vatRegNo,
                    code: billData.code,
                    vendorNo: billData.vendorNo,
                    totalAmount,
                    taxAmount,
                    dueAmount,
                    status: 'PENDING',
                    buyerPOId,
                    createdBy,
                    items: {
                        create: billItems
                    }
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
                    },
                    buyerPO: {
                        include: {
                            quotation: {
                                select: {
                                    quotationNumber: true,
                                    companyName: true,
                                }
                            }
                        }
                    },
                    user: {
                        select: {
                            name: true,
                            email: true,
                        }
                    }
                }
            });
            return bill;
        });
    }
    async findAll(searchDto) {
        const { page = 1, limit = 10, search, status, sortBy = 'billDate', sortOrder = 'desc' } = searchDto;
        const skip = (page - 1) * limit;
        const take = Number(limit);
        const where = {};
        if (search) {
            where.OR = [
                { billNumber: { contains: search, mode: 'insensitive' } },
                {
                    buyerPO: {
                        quotation: {
                            companyName: { contains: search, mode: 'insensitive' }
                        }
                    }
                },
                { vatRegNo: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status) {
            where.status = status;
        }
        const [bills, total] = await Promise.all([
            this.prisma.bill.findMany({
                where,
                skip,
                take,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    buyerPO: {
                        include: {
                            quotation: {
                                select: {
                                    quotationNumber: true,
                                    companyName: true,
                                    companyContact: true,
                                }
                            }
                        }
                    },
                    user: {
                        select: {
                            name: true,
                            email: true,
                        }
                    },
                    payments: {
                        orderBy: {
                            paymentDate: 'desc'
                        }
                    },
                    _count: {
                        select: {
                            payments: true,
                            profitDistributions: true
                        }
                    }
                },
            }),
            this.prisma.bill.count({ where }),
        ]);
        return {
            data: bills,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const bill = await this.prisma.bill.findUnique({
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
                            }
                        }
                    }
                },
                buyerPO: {
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
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                payments: {
                    orderBy: {
                        paymentDate: 'desc'
                    }
                }
            },
        });
        if (!bill) {
            throw new common_1.NotFoundException(`Bill with ID ${id} not found`);
        }
        return bill;
    }
    async addPayment(id, addPaymentDto) {
        return this.prisma.$transaction(async (tx) => {
            const bill = await tx.bill.findUnique({
                where: { id }
            });
            if (!bill) {
                throw new common_1.NotFoundException(`Bill with ID ${id} not found`);
            }
            if (bill.dueAmount <= 0) {
                throw new common_1.BadRequestException('This bill has already been fully paid');
            }
            if (addPaymentDto.amount > bill.dueAmount) {
                throw new common_1.BadRequestException(`Payment amount cannot exceed due amount of ${bill.dueAmount}`);
            }
            const payment = await tx.payment.create({
                data: {
                    ...addPaymentDto,
                    billId: id
                }
            });
            const allPayments = await tx.payment.findMany({
                where: { billId: id }
            });
            const totalPaid = allPayments.reduce((sum, payment) => sum + payment.amount, 0);
            const dueAmount = bill.totalAmount - totalPaid;
            let status = 'PENDING';
            if (dueAmount <= 0) {
                status = 'PAID';
            }
            else if (totalPaid > 0) {
                status = 'PARTIALLY_PAID';
            }
            const updatedBill = await tx.bill.update({
                where: { id },
                data: {
                    dueAmount,
                    status
                },
                include: {
                    payments: {
                        orderBy: {
                            paymentDate: 'desc'
                        }
                    }
                }
            });
            return updatedBill;
        });
    }
    async getStats() {
        const [totalBills, totalAmount, totalDue, pendingBills, paidBills, partiallyPaidBills, overdueBills] = await Promise.all([
            this.prisma.bill.count(),
            this.prisma.bill.aggregate({
                _sum: { totalAmount: true }
            }),
            this.prisma.bill.aggregate({
                _sum: { dueAmount: true }
            }),
            this.prisma.bill.count({ where: { status: 'PENDING' } }),
            this.prisma.bill.count({ where: { status: 'PAID' } }),
            this.prisma.bill.count({ where: { status: 'PARTIALLY_PAID' } }),
            this.prisma.bill.count({ where: { status: 'OVERDUE' } })
        ]);
        return {
            totalBills,
            totalAmount: totalAmount._sum.totalAmount || 0,
            totalDue: totalDue._sum.dueAmount || 0,
            pendingBills,
            paidBills,
            partiallyPaidBills,
            overdueBills,
            collectionRate: totalAmount._sum.totalAmount ?
                ((totalAmount._sum.totalAmount - (totalDue._sum.dueAmount || 0)) / totalAmount._sum.totalAmount) * 100 : 0
        };
    }
    async getBillsByBuyerPO(buyerPOId) {
        return this.prisma.bill.findMany({
            where: { buyerPOId },
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
                payments: {
                    orderBy: {
                        paymentDate: 'desc'
                    }
                },
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            },
            orderBy: {
                billDate: 'desc'
            }
        });
    }
    async getRecentBills(limit = 10) {
        return this.prisma.bill.findMany({
            take: limit,
            orderBy: {
                billDate: 'desc'
            },
            include: {
                buyerPO: {
                    include: {
                        quotation: {
                            select: {
                                companyName: true,
                            }
                        }
                    }
                },
                payments: {
                    orderBy: {
                        paymentDate: 'desc'
                    },
                    take: 1
                }
            }
        });
    }
    async getAvailableBuyerPOs() {
        const buyerPOs = await this.prisma.buyerPurchaseOrder.findMany({
            where: {
                quotation: {
                    status: 'ACCEPTED'
                }
            },
            include: {
                quotation: {
                    select: {
                        totalAmount: true,
                        companyName: true,
                        companyContact: true,
                        items: {
                            include: {
                                inventory: true
                            }
                        }
                    }
                },
                bills: {
                    select: {
                        totalAmount: true
                    }
                }
            }
        });
        return buyerPOs.map(po => {
            const totalBilled = po.bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
            const remainingAmount = po.quotation.totalAmount - totalBilled;
            return {
                ...po,
                remainingAmount,
                canCreateBill: remainingAmount > 0
            };
        }).filter(po => po.canCreateBill);
    }
};
exports.BillService = BillService;
exports.BillService = BillService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], BillService);
//# sourceMappingURL=bill.service.js.map