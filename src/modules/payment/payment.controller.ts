import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ResponseService } from '@/utils/response';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
 async create(@Body() createPaymentDto: CreatePaymentDto) {
    const result = await this.paymentService.create(createPaymentDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Payment Created Successfully',
      data: result
    })
  }

  @Get()
 async findAll(
  @Query() query: Record<string, any>,
 ) {
    const result = await this.paymentService.findAll();
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Payment Found Successfully',
      data: result
    })
  }

  @Get(':id')
async  findOne(@Param('id') id: string) {
    const result = await this.paymentService.findOne(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Payment Found Successfully',
      data: result
    })
}

  @Patch(':id')
async  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    const result = await this.paymentService.update(id, updatePaymentDto);
  
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Payment Updated Successfully',
      data: result
    })
  }

  @Delete(':id')
 async remove(@Param('id') id: string) {
    const result = await this.paymentService.remove(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Payment Deleted Successfully',
      data: result
    })
  }
}
