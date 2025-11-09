import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PurchaseOrderService } from './po.service';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  MarkAsReceivedDto,
  PurchaseOrderQueryDto,
  CreatePurchaseOrderPaymentDto,
  PaymentSummaryDto,
} from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/auth.guard';
import { Request } from 'express';

@ApiTags('purchase-orders')
@ApiBearerAuth()
@Controller('purchase-orders')
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new purchase order' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Purchase order created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid investment percentage or amount',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AccessTokenGuard)
  async create(
    @Req() req: Request,
    @Body() createPurchaseOrderDto: CreatePurchaseOrderDto) {
    const request = req as any as {user:{id:string}}
    const id = request.user.id;
    console.log(id);
    const result = await this.purchaseOrderService.createPurchaseOrder(
      createPurchaseOrderDto, id
    );
    return{
      statusCode: HttpStatus.CREATED,
      message: 'Purchase order created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchase orders with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (starts from 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Purchase orders retrieved successfully',
  })
  async findAll(@Query() query: PurchaseOrderQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const result = await this.purchaseOrderService.findAll(skip, limit);

    return {
      statusCode: HttpStatus.OK,
      message: 'Purchase orders retrieved successfully',
      data: result.data,
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a purchase order by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Purchase order retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Purchase order not found',
  })
  async findOne(@Param('id') id: string) {
    const result = await this.purchaseOrderService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Purchase order retrieved successfully',
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a purchase order' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Purchase order updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Purchase order not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot modify received purchase order',
  })
  async update(
    @Param('id') id: string,
    @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto,
  ) {
    const result = await this.purchaseOrderService.updatePurchaseOrder(
      id,
      updatePurchaseOrderDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Purchase order updated successfully',
      data: result,
    };
  }

  @Post(':id/receive')
  @ApiOperation({
    summary: 'Mark purchase order as received and update inventory',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Purchase order marked as received and inventory updated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Purchase order not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Purchase order is already received or invalid items',
  })
  @HttpCode(HttpStatus.OK)
  async markAsReceived(
    @Param('id') id: string,
    @Body() markAsReceivedDto: MarkAsReceivedDto,
  ) {
    console.log(id);
    const result = await this.purchaseOrderService.markAsReceived(
      id,
      markAsReceivedDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Purchase order marked as received and inventory updated',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a purchase order' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Purchase order deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Purchase order not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete purchase order with associated inventory',
  })
  async remove(@Param('id') id: string) {
    await this.purchaseOrderService.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Purchase order deleted successfully',
    };
  }

  // Additional endpoints for status updates

  @Patch(':id/status/:status')
  @ApiOperation({ summary: 'Update purchase order status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Purchase order status updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Purchase order not found',
  })
  async updateStatus(
    @Param('id') id: string,
    @Param('status') status: string,
  ) {
    // Validate status against POStatus enum
    const validStatuses = ['PENDING', 'ORDERED', 'SHIPPED', 'RECEIVED', 'CANCELLED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid status',
      };
    }

    const result = await this.purchaseOrderService.updatePurchaseOrder(id, {
      status: status as any,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Purchase order status updated successfully',
      data: result,
    };
  }

  // Get purchase orders by status
  @Get('status/:status')
  @ApiOperation({ summary: 'Get purchase orders by status' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (starts from 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Purchase orders retrieved successfully',
  })
  async findByStatus(
    @Param('status') status: string,
    @Query() query: PurchaseOrderQueryDto,
  ) {
    const validStatuses = ['PENDING', 'ORDERED', 'SHIPPED', 'RECEIVED', 'CANCELLED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid status',
      };
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // You might want to add a method in service to filter by status
    // For now, we'll use the existing findAll and filter manually
    const allPOs = await this.purchaseOrderService.findAll(skip, limit);
    const filteredData = allPOs.data.filter(po => 
      po.status === status.toUpperCase()
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Purchase orders retrieved successfully',
      data: filteredData,
      meta: {
        page,
        limit,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / limit),
      },
    };
  }

  @Post(':id/payments')
  @ApiOperation({ summary: 'Add payment to purchase order' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment added successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Purchase order not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Payment amount exceeds due amount',
  })
  @HttpCode(HttpStatus.CREATED)
  async addPayment(
    @Param('id') id: string,
    @Body() createPaymentDto: CreatePurchaseOrderPaymentDto,
  ) {
    const result = await this.purchaseOrderService.addPayment(id, createPaymentDto);
    
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Payment added successfully',
      data: {
        payment: result.payment,
        purchaseOrder: result.updatedPO,
      },
    };
  }

  @Get(':id/payments/summary')
  @ApiOperation({ summary: 'Get payment summary for purchase order' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment summary retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Purchase order not found',
  })
  async getPaymentSummary(
    @Param('id') id: string,
  ): Promise<{ statusCode: number; message: string; data: PaymentSummaryDto }> {
    const paymentSummary = await this.purchaseOrderService.getPaymentSummary(id);
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Payment summary retrieved successfully',
      data: paymentSummary,
    };
  }

  @Get(':id/payments')
  @ApiOperation({ summary: 'Get all payments for purchase order' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payments retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Purchase order not found',
  })
  async getPayments(
    @Param('id') id: string,
  ) {
    const payments = await this.purchaseOrderService.getPayments(id);
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Payments retrieved successfully',
      data: payments,
    };
  }

  @Patch('payments/:paymentId')
  @ApiOperation({ summary: 'Update a payment' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  async updatePayment(
    @Param('paymentId') paymentId: string,
    @Body() updateData: Partial<CreatePurchaseOrderPaymentDto>,
  ) {
    const payment = await this.purchaseOrderService.updatePayment(paymentId, updateData);
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Payment updated successfully',
      data: payment,
    };
  }

  @Delete('payments/:paymentId')
  @ApiOperation({ summary: 'Delete a payment' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  async deletePayment(
    @Param('paymentId') paymentId: string,
  ) {
    const result = await this.purchaseOrderService.deletePayment(paymentId);
    
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: {
        revertedAmount: result.revertedAmount,
      },
    };
  }

  @Get('due/list')
  @ApiOperation({ summary: 'Get all purchase orders with due payments' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (starts from 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Due purchase orders retrieved successfully',
  })
  async getDuePurchaseOrders(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.purchaseOrderService.getDuePurchaseOrders(
      page || 1,
      limit || 10,
    );
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Due purchase orders retrieved successfully',
      data: result.data,
      meta: result.meta,
    };
  }
}