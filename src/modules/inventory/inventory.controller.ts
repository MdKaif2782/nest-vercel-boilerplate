// src/inventory/inventory.controller.ts
import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  ValidationPipe,
} from '@nestjs/common';
import { InventorySearchDto } from '../inventory/dto';
import { UpdateInventoryDto } from '../inventory/dto/update-inventory.dto';
import { InventoryService } from '../inventory/inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(@Query(ValidationPipe) searchDto: InventorySearchDto) {
    return this.inventoryService.findAll(searchDto);
  }

  @Get('low-stock')
  getLowStockItems(
    @Query('threshold', new DefaultValuePipe(10), ParseIntPipe) threshold?: number,
  ) {
    return this.inventoryService.getLowStockItems(threshold);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(id, updateInventoryDto);
  }
}