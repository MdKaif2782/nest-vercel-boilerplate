import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PoService } from './po.service';
import { CreatePoDto } from './dto/create-po.dto';
import { UpdatePoDto } from './dto/update-po.dto';

@Controller('po')
export class PoController {
  constructor(private readonly poService: PoService) {}

  @Post()
  create(@Body() createPoDto: CreatePoDto) {
    return this.poService.create(createPoDto);
  }

  @Get()
  findAll() {
    return this.poService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.poService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePoDto: UpdatePoDto) {
    return this.poService.update(+id, updatePoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.poService.remove(+id);
  }
}
