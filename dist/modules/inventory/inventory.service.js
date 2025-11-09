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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let InventoryService = class InventoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(searchDto) {
        const { page = 1, limit = 10, search, sortBy = 'productName', sortOrder = 'asc' } = searchDto;
        const skip = (page - 1) * limit;
        const take = limit;
        const where = {};
        if (search) {
            where.OR = [
                { productCode: { contains: search, mode: 'insensitive' } },
                { productName: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { barcode: { contains: search, mode: 'insensitive' } },
            ];
        }
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Inventory item with ID ${id} not found`);
        }
        return inventory;
    }
    async update(id, updateInventoryDto) {
        const existingInventory = await this.prisma.inventory.findUnique({
            where: { id },
        });
        if (!existingInventory) {
            throw new common_1.NotFoundException(`Inventory item with ID ${id} not found`);
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
    async getLowStockItems(threshold) {
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
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map